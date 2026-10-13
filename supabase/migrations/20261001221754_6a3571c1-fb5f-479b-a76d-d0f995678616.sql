create or replace function public.alterar_status_pedido(p_pedido_id uuid, p_status public.status_pedido)
returns void language plpgsql security definer set search_path = public as $$
declare v_atual public.status_pedido; v_item record; v_numero bigint;
begin
  if not public.is_admin() then raise exception 'Sem permissão'; end if;
  select status, numero into v_atual, v_numero from public.pedidos where id = p_pedido_id for update;
  if v_atual is null then raise exception 'Pedido não encontrado'; end if;
  if v_atual = p_status then return; end if;
  if p_status = 'cancelado' and v_atual <> 'cancelado' then
    for v_item in select variacao_cor_id, sum(quantidade)::integer as quantidade from public.itens_pedido where pedido_id = p_pedido_id and variacao_cor_id is not null group by variacao_cor_id order by variacao_cor_id loop
      update public.variacoes_cor set estoque_atual = estoque_atual + v_item.quantidade where id = v_item.variacao_cor_id;
      insert into public.movimentacoes_estoque (variacao_cor_id,tipo,quantidade,motivo,pedido_id)
      values (v_item.variacao_cor_id,'entrada',v_item.quantidade,'Cancelamento do pedido #' || v_numero,p_pedido_id);
    end loop;
    update public.transacoes_financeiras set status_pagamento = 'cancelado' where pedido_id = p_pedido_id and status_pagamento = 'pendente';
  end if;
  if v_atual = 'cancelado' and p_status <> 'cancelado' then
    for v_item in select variacao_cor_id, sum(quantidade)::integer as quantidade from public.itens_pedido where pedido_id = p_pedido_id and variacao_cor_id is not null group by variacao_cor_id order by variacao_cor_id loop
      update public.variacoes_cor set estoque_atual = estoque_atual - v_item.quantidade where id = v_item.variacao_cor_id and ativo = true and estoque_atual >= v_item.quantidade;
      if not found then raise exception 'Estoque insuficiente para reativar o pedido'; end if;
      insert into public.movimentacoes_estoque (variacao_cor_id,tipo,quantidade,motivo,pedido_id)
      values (v_item.variacao_cor_id,'saida',v_item.quantidade,'Reativação do pedido #' || v_numero,p_pedido_id);
    end loop;
  end if;
  update public.pedidos set status = p_status where id = p_pedido_id;
  insert into public.pedido_status_historico (pedido_id,status_anterior,status_novo,alterado_por)
  values (p_pedido_id,v_atual,p_status,auth.uid());
  if p_status = 'concluido' then
    insert into public.transacoes_financeiras (tipo,categoria_id,descricao,valor,data_transacao,status_pagamento,pedido_id)
    select 'entrada',(select id from public.categorias_financeiras where nome = 'Venda Direta' limit 1),
      'Pedido #' || v_numero, valor_total, current_date, 'pendente', p_pedido_id
    from public.pedidos where id = p_pedido_id and valor_total > 0
      and not exists (select 1 from public.transacoes_financeiras t where t.pedido_id = p_pedido_id);
    update public.transacoes_financeiras set status_pagamento = 'pendente' where pedido_id = p_pedido_id and status_pagamento = 'cancelado';
  end if;
end; $$;