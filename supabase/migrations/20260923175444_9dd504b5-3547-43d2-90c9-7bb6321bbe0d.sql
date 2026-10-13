
-- ============ ENUMS ============
create type public.papel_admin as enum ('admin');
create type public.status_pedido as enum ('pendente','em_producao','pronto_envio','concluido','cancelado');
create type public.tipo_transacao as enum ('entrada','saida');
create type public.status_pagamento as enum ('pendente','pago','cancelado');
create type public.tipo_movimentacao as enum ('entrada','saida','ajuste');

-- ============ UTIL ============
create or replace function public.set_atualizado_em()
returns trigger language plpgsql set search_path = public as $$
begin new.atualizado_em = now(); return new; end; $$;

-- ============ PERFIS ADMIN ============
create table public.perfis_admin (
  user_id uuid primary key,
  usuario text not null unique,
  nome text,
  papel public.papel_admin not null default 'admin',
  criado_em timestamptz not null default now()
);
grant select on public.perfis_admin to authenticated;
grant all on public.perfis_admin to service_role;
alter table public.perfis_admin enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfis_admin where user_id = auth.uid());
$$;

create policy "admin le proprio perfil" on public.perfis_admin
for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- ============ CATALOGO ============
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ativo boolean not null default true,
  criada_em timestamptz not null default now()
);

create table public.cores (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  codigo_hex text not null check (codigo_hex ~* '^#[0-9a-f]{6}$'),
  ativo boolean not null default true,
  criada_em timestamptz not null default now()
);

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  nome text not null,
  slug text not null unique,
  descricao text,
  preco_base numeric(12,2) not null check (preco_base >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_produtos_categoria on public.produtos(categoria_id);
create index idx_produtos_ativo on public.produtos(ativo);
create trigger trg_produtos_upd before update on public.produtos
for each row execute function public.set_atualizado_em();

create table public.variacoes_cor (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  cor_id uuid not null references public.cores(id) on delete restrict,
  foto_url text,
  estoque_atual integer not null default 0 check (estoque_atual >= 0),
  estoque_minimo integer not null default 5 check (estoque_minimo >= 0),
  ativo boolean not null default true,
  unique (produto_id, cor_id)
);
create index idx_variacoes_produto on public.variacoes_cor(produto_id);
create index idx_variacoes_cor on public.variacoes_cor(cor_id);

create table public.produto_imagens (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  url text not null,
  ordem integer not null default 0
);
create index idx_imagens_produto on public.produto_imagens(produto_id);

-- ============ CLIENTES ============
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nome_loja text,
  whatsapp text not null unique,
  email text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create trigger trg_clientes_upd before update on public.clientes
for each row execute function public.set_atualizado_em();

create table public.enderecos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  principal boolean not null default true,
  criado_em timestamptz not null default now()
);
create index idx_enderecos_cliente on public.enderecos(cliente_id);

-- ============ PEDIDOS ============
create sequence public.pedidos_numero_seq start 1000;

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero bigint not null unique default nextval('public.pedidos_numero_seq'),
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  endereco_id uuid references public.enderecos(id) on delete restrict,
  valor_total numeric(12,2) not null default 0 check (valor_total >= 0),
  status public.status_pedido not null default 'pendente',
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_pedidos_cliente on public.pedidos(cliente_id);
create index idx_pedidos_endereco on public.pedidos(endereco_id);
create index idx_pedidos_status on public.pedidos(status);
create index idx_pedidos_criado on public.pedidos(criado_em);
create trigger trg_pedidos_upd before update on public.pedidos
for each row execute function public.set_atualizado_em();

create table public.itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  variacao_cor_id uuid references public.variacoes_cor(id) on delete restrict,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(12,2) not null check (preco_unitario >= 0),
  subtotal numeric(12,2) not null check (subtotal >= 0)
);
create index idx_itens_pedido on public.itens_pedido(pedido_id);
create index idx_itens_produto on public.itens_pedido(produto_id);
create index idx_itens_variacao on public.itens_pedido(variacao_cor_id);

create table public.pedido_status_historico (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  status_anterior public.status_pedido,
  status_novo public.status_pedido not null,
  alterado_por uuid,
  criado_em timestamptz not null default now()
);
create index idx_hist_pedido on public.pedido_status_historico(pedido_id);

create table public.movimentacoes_estoque (
  id uuid primary key default gen_random_uuid(),
  variacao_cor_id uuid not null references public.variacoes_cor(id) on delete restrict,
  tipo public.tipo_movimentacao not null,
  quantidade integer not null check (quantidade > 0),
  motivo text,
  pedido_id uuid references public.pedidos(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index idx_mov_variacao on public.movimentacoes_estoque(variacao_cor_id);
create index idx_mov_pedido on public.movimentacoes_estoque(pedido_id);
create index idx_mov_criado on public.movimentacoes_estoque(criado_em);

-- ============ FINANCEIRO ============
create table public.categorias_financeiras (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ativo boolean not null default true
);

create table public.transacoes_financeiras (
  id uuid primary key default gen_random_uuid(),
  tipo public.tipo_transacao not null,
  categoria_id uuid references public.categorias_financeiras(id) on delete restrict,
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  data_transacao date not null default current_date,
  data_vencimento date,
  data_pagamento date,
  status_pagamento public.status_pagamento not null default 'pendente',
  pedido_id uuid references public.pedidos(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index idx_trans_categoria on public.transacoes_financeiras(categoria_id);
create index idx_trans_pedido on public.transacoes_financeiras(pedido_id);
create index idx_trans_data on public.transacoes_financeiras(data_transacao);
create index idx_trans_status on public.transacoes_financeiras(status_pagamento);

create table public.instagram_metricas (
  id uuid primary key default gen_random_uuid(),
  mes integer not null check (mes between 1 and 12),
  ano integer not null check (ano between 2000 and 2100),
  visitas_perfil integer not null default 0 check (visitas_perfil >= 0),
  alcance integer not null default 0 check (alcance >= 0),
  visualizacoes integer not null default 0 check (visualizacoes >= 0),
  interacoes integer not null default 0 check (interacoes >= 0),
  unique (mes, ano)
);

-- ============ GRANTS ============
grant select on public.categorias, public.cores, public.produtos, public.variacoes_cor, public.produto_imagens to anon;
grant select, insert, update, delete on
  public.categorias, public.cores, public.produtos, public.variacoes_cor, public.produto_imagens,
  public.clientes, public.enderecos, public.pedidos, public.itens_pedido,
  public.pedido_status_historico, public.movimentacoes_estoque,
  public.categorias_financeiras, public.transacoes_financeiras, public.instagram_metricas
to authenticated;
grant all on
  public.categorias, public.cores, public.produtos, public.variacoes_cor, public.produto_imagens,
  public.clientes, public.enderecos, public.pedidos, public.itens_pedido,
  public.pedido_status_historico, public.movimentacoes_estoque,
  public.categorias_financeiras, public.transacoes_financeiras, public.instagram_metricas
to service_role;

-- ============ RLS ============
alter table public.categorias enable row level security;
alter table public.cores enable row level security;
alter table public.produtos enable row level security;
alter table public.variacoes_cor enable row level security;
alter table public.produto_imagens enable row level security;
alter table public.clientes enable row level security;
alter table public.enderecos enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.pedido_status_historico enable row level security;
alter table public.movimentacoes_estoque enable row level security;
alter table public.categorias_financeiras enable row level security;
alter table public.transacoes_financeiras enable row level security;
alter table public.instagram_metricas enable row level security;

create policy "publico le categorias ativas" on public.categorias for select to anon, authenticated using (ativo);
create policy "publico le cores ativas" on public.cores for select to anon, authenticated using (ativo);
create policy "publico le produtos ativos" on public.produtos for select to anon, authenticated using (ativo);
create policy "publico le variacoes ativas" on public.variacoes_cor for select to anon, authenticated using (ativo);
create policy "publico le imagens" on public.produto_imagens for select to anon, authenticated using (true);

create policy "admin categorias" on public.categorias for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin cores" on public.cores for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin produtos" on public.produtos for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin variacoes" on public.variacoes_cor for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin imagens" on public.produto_imagens for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin clientes" on public.clientes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin enderecos" on public.enderecos for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin pedidos" on public.pedidos for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin itens" on public.itens_pedido for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin historico" on public.pedido_status_historico for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin movimentacoes" on public.movimentacoes_estoque for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin categorias financeiras" on public.categorias_financeiras for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin transacoes" on public.transacoes_financeiras for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin instagram" on public.instagram_metricas for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============ RPC: criar pedido ============
create or replace function public.criar_pedido(
  p_cliente jsonb,
  p_endereco jsonb,
  p_itens jsonb,
  p_observacoes text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_whatsapp text;
  v_cliente_id uuid;
  v_endereco_id uuid;
  v_pedido_id uuid;
  v_numero bigint;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_var record;
  v_preco numeric(12,2);
  v_qtd integer;
  v_produto_id uuid;
begin
  v_whatsapp := regexp_replace(coalesce(p_cliente->>'whatsapp',''), '\D', '', 'g');
  if length(v_whatsapp) < 10 then
    raise exception 'WhatsApp inválido';
  end if;
  if jsonb_array_length(p_itens) = 0 then
    raise exception 'Carrinho vazio';
  end if;

  insert into public.clientes (nome, nome_loja, whatsapp, email)
  values (p_cliente->>'nome', nullif(p_cliente->>'nome_loja',''), v_whatsapp, nullif(p_cliente->>'email',''))
  on conflict (whatsapp) do update
    set nome = excluded.nome,
        nome_loja = coalesce(excluded.nome_loja, public.clientes.nome_loja),
        email = coalesce(excluded.email, public.clientes.email),
        ativo = true
  returning id into v_cliente_id;

  if p_endereco is not null then
    update public.enderecos set principal = false where cliente_id = v_cliente_id;
    insert into public.enderecos (cliente_id, cep, logradouro, numero, complemento, bairro, cidade, estado, principal)
    values (v_cliente_id, p_endereco->>'cep', p_endereco->>'logradouro', p_endereco->>'numero',
            nullif(p_endereco->>'complemento',''), p_endereco->>'bairro', p_endereco->>'cidade',
            upper(p_endereco->>'estado'), true)
    returning id into v_endereco_id;
  end if;

  insert into public.pedidos (cliente_id, endereco_id, valor_total, observacoes)
  values (v_cliente_id, v_endereco_id, 0, nullif(p_observacoes,''))
  returning id, numero into v_pedido_id, v_numero;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := (v_item->>'quantidade')::int;
    if v_qtd is null or v_qtd <= 0 then raise exception 'Quantidade inválida'; end if;

    select vc.id, vc.produto_id, vc.estoque_atual, p.preco_base, p.nome, p.ativo, vc.ativo as var_ativo
      into v_var
    from public.variacoes_cor vc
    join public.produtos p on p.id = vc.produto_id
    where vc.id = (v_item->>'variacao_cor_id')::uuid
    for update of vc;

    if v_var.id is null then raise exception 'Produto indisponível'; end if;
    if not v_var.ativo or not v_var.var_ativo then raise exception 'Produto % não está mais disponível', v_var.nome; end if;
    if v_var.estoque_atual < v_qtd then
      raise exception 'Estoque insuficiente para %: restam %', v_var.nome, v_var.estoque_atual;
    end if;

    v_preco := v_var.preco_base;
    v_produto_id := v_var.produto_id;
    v_total := v_total + (v_preco * v_qtd);

    insert into public.itens_pedido (pedido_id, produto_id, variacao_cor_id, quantidade, preco_unitario, subtotal)
    values (v_pedido_id, v_produto_id, v_var.id, v_qtd, v_preco, v_preco * v_qtd);

    update public.variacoes_cor set estoque_atual = estoque_atual - v_qtd where id = v_var.id;

    insert into public.movimentacoes_estoque (variacao_cor_id, tipo, quantidade, motivo, pedido_id)
    values (v_var.id, 'saida', v_qtd, 'Pedido #' || v_numero, v_pedido_id);
  end loop;

  update public.pedidos set valor_total = v_total where id = v_pedido_id;

  insert into public.pedido_status_historico (pedido_id, status_novo)
  values (v_pedido_id, 'pendente');

  return jsonb_build_object('pedido_id', v_pedido_id, 'numero', v_numero, 'total', v_total);
end; $$;

revoke all on function public.criar_pedido(jsonb,jsonb,jsonb,text) from public;
grant execute on function public.criar_pedido(jsonb,jsonb,jsonb,text) to anon, authenticated, service_role;

-- ============ RPC: revalidar carrinho (publico) ============
create or replace function public.revalidar_carrinho(p_variacoes uuid[])
returns table (
  variacao_cor_id uuid,
  produto_id uuid,
  produto_nome text,
  cor_nome text,
  preco numeric,
  estoque integer,
  disponivel boolean
) language sql stable security definer set search_path = public as $$
  select vc.id, p.id, p.nome, c.nome, p.preco_base, vc.estoque_atual, (p.ativo and vc.ativo)
  from public.variacoes_cor vc
  join public.produtos p on p.id = vc.produto_id
  join public.cores c on c.id = vc.cor_id
  where vc.id = any(p_variacoes);
$$;
grant execute on function public.revalidar_carrinho(uuid[]) to anon, authenticated, service_role;

-- ============ RPC: alterar status / cancelar ============
create or replace function public.alterar_status_pedido(p_pedido_id uuid, p_status public.status_pedido)
returns void language plpgsql security definer set search_path = public as $$
declare v_atual public.status_pedido; v_item record; v_numero bigint;
begin
  if not public.is_admin() then raise exception 'Sem permissão'; end if;
  select status, numero into v_atual, v_numero from public.pedidos where id = p_pedido_id for update;
  if v_atual is null then raise exception 'Pedido não encontrado'; end if;
  if v_atual = p_status then return; end if;

  if p_status = 'cancelado' and v_atual <> 'cancelado' then
    for v_item in select variacao_cor_id, quantidade from public.itens_pedido where pedido_id = p_pedido_id and variacao_cor_id is not null loop
      update public.variacoes_cor set estoque_atual = estoque_atual + v_item.quantidade where id = v_item.variacao_cor_id;
      insert into public.movimentacoes_estoque (variacao_cor_id, tipo, quantidade, motivo, pedido_id)
      values (v_item.variacao_cor_id, 'entrada', v_item.quantidade, 'Cancelamento do pedido #' || v_numero, p_pedido_id);
    end loop;
  end if;

  if v_atual = 'cancelado' and p_status <> 'cancelado' then
    for v_item in select variacao_cor_id, quantidade from public.itens_pedido where pedido_id = p_pedido_id and variacao_cor_id is not null loop
      update public.variacoes_cor set estoque_atual = greatest(estoque_atual - v_item.quantidade, 0) where id = v_item.variacao_cor_id;
      insert into public.movimentacoes_estoque (variacao_cor_id, tipo, quantidade, motivo, pedido_id)
      values (v_item.variacao_cor_id, 'saida', v_item.quantidade, 'Reativação do pedido #' || v_numero, p_pedido_id);
    end loop;
  end if;

  update public.pedidos set status = p_status where id = p_pedido_id;
  insert into public.pedido_status_historico (pedido_id, status_anterior, status_novo, alterado_por)
  values (p_pedido_id, v_atual, p_status, auth.uid());

  if p_status = 'concluido' then
    insert into public.transacoes_financeiras (tipo, categoria_id, descricao, valor, data_transacao, status_pagamento, pedido_id)
    select 'entrada',
           (select id from public.categorias_financeiras where nome = 'Venda Direta' limit 1),
           'Pedido #' || v_numero, valor_total, current_date, 'pendente', p_pedido_id
    from public.pedidos where id = p_pedido_id and valor_total > 0
      and not exists (select 1 from public.transacoes_financeiras t where t.pedido_id = p_pedido_id);
  end if;
end; $$;
grant execute on function public.alterar_status_pedido(uuid, public.status_pedido) to authenticated, service_role;

-- ============ RPC: ajuste de estoque ============
create or replace function public.ajustar_estoque(p_variacao_id uuid, p_novo_estoque integer, p_motivo text default 'Ajuste manual')
returns void language plpgsql security definer set search_path = public as $$
declare v_atual integer; v_delta integer;
begin
  if not public.is_admin() then raise exception 'Sem permissão'; end if;
  if p_novo_estoque < 0 then raise exception 'Estoque não pode ser negativo'; end if;
  select estoque_atual into v_atual from public.variacoes_cor where id = p_variacao_id for update;
  if v_atual is null then raise exception 'Variação não encontrada'; end if;
  v_delta := p_novo_estoque - v_atual;
  if v_delta = 0 then return; end if;
  update public.variacoes_cor set estoque_atual = p_novo_estoque where id = p_variacao_id;
  insert into public.movimentacoes_estoque (variacao_cor_id, tipo, quantidade, motivo)
  values (p_variacao_id, case when v_delta > 0 then 'entrada' else 'saida' end, abs(v_delta), p_motivo);
end; $$;
grant execute on function public.ajustar_estoque(uuid, integer, text) to authenticated, service_role;

-- ============ REALTIME ============
alter publication supabase_realtime add table public.produtos;
alter publication supabase_realtime add table public.variacoes_cor;
alter publication supabase_realtime add table public.pedidos;

-- ============ CATEGORIAS FINANCEIRAS PADRAO ============
insert into public.categorias_financeiras (nome) values
 ('Compra de Materiais'),('Frete'),('Venda Direta'),('Custos Operacionais'),('Outros');
