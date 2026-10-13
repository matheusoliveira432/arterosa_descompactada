# Artesão Digital

PROMPT — Sistema Arte Rosa Artesanatos

PAPEL

Você é um(a) desenvolvedor(a) full stack sênior, especialista em React, TypeScript, Supabase, PostgreSQL, UX/UI e sistemas administrativos. Você trabalha em etapas curtas, valida cada uma e explica decisões em linguagem simples.

OBJETIVO

Construir um sistema web para a Arte Rosa Artesanatos, empresa B2B que fabrica e vende produtos artesanais femininos (arranjos de bailarina, arcos, laços adulto/infantil, tiaras, arranjos de flores, kits).

O sistema tem duas partes:

Loja pública (sem login): o cliente escolhe produtos, cor e quantidade, monta o carrinho e envia o pedido pelo WhatsApp. O pagamento não é feito no sistema; ele é combinado na conversa.

Painel administrativo (com login): a administradora gerencia produtos, categorias, cores, estoque, pedidos, clientes, financeiro e KPIs.

Problemas que o sistema resolve: pedidos desorganizados, clientes espalhados, falta de controle de cores/estoque/financeiro, ausência de indicadores.

Usuária principal: pessoa com pouca familiaridade digital. Priorize simplicidade: textos claros, botões grandes, ícones sempre acompanhados de texto, poucos passos por tarefa, mensagens de erro em português e sem termos técnicos.

COMO VOCÊ DEVE TRABALHAR (importante)

Não gere tudo de uma vez. Siga as fases da seção "Plano de entrega".

Antes de codar, entregue o planejamento (seção "Fase 0") e espere minha aprovação.

Se algo estiver ambíguo, liste no máximo 5 perguntas objetivas na Fase 0. Onde eu não responder, adote a opção marcada como padrão neste documento e registre a decisão.

Ao final de cada fase, entregue: o que foi feito, como testar, o que ficou pendente. Só avance após meu "ok".

Se for trocar alguma tecnologia, justifique em uma frase.

Nunca coloque chaves privadas, senhas reais ou service_role no frontend. Use .env e entregue .env.example.

STACK (padrão)

React + TypeScript + Vite, Tailwind CSS, React Router, React Hook Form + Zod, Zustand (carrinho e sessão do cliente), Recharts, Lucide React, Supabase (PostgreSQL, Auth, Storage, Realtime, RPC/Edge Functions).

Configurações: interface em pt-BR, valores em R$ (Intl.NumberFormat), datas no padrão brasileiro, fuso America/Sao_Paulo, layout responsivo (celular, tablet, desktop; mobile-first).

IDENTIDADE VISUAL

Fundo branco; principal #E8A598; secundária #F7EBE8; escura #2D2727; clara #FAFAFA.

rounded-2xl, sombras suaves, visual delicado, feminino e moderno, bom contraste (verifique contraste do texto sobre #E8A598).

Skeleton em carregamentos, modais com backdrop blur, animações sutis, toasts visíveis de sucesso/erro.

Componentes reutilizáveis: Button, Input, Select, Modal, Drawer, Card, Badge, Table, MetricCard, Skeleton, Toast, ConfirmDialog, EmptyState, LoadingState.

Layout: cabeçalho com marca, menu hambúrguer no celular, ícone do carrinho com contador, rodapé informativo, página 404 personalizada.

ROTAS

Públicas: /, /produtos, /produto/:id, /categorias/:slug, /carrinho, /checkout, * (404).

Admin (todas protegidas): /admin/login, /admin, /admin/produtos, /admin/produtos/novo, /admin/produtos/:id/editar, /admin/categorias, /admin/cores, /admin/estoque, /admin/pedidos, /admin/pedidos/:id, /admin/clientes, /admin/financeiro, /admin/kpis.

LOJA PÚBLICA

Identificação do cliente (primeiro acesso): modal com nome completo, WhatsApp (máscara (XX) XXXXX-XXXX), endereço completo (CEP, logradouro, número, complemento, bairro, cidade, UF), nome da loja e e-mail (opcionais). Validação com React Hook Form + Zod. Salvar no localStorage/Zustand. Cliente pode editar os dados depois (topo da página ou checkout).

Catálogo: foto, nome, descrição resumida, categoria, preço (ou "a partir de"), badge de estoque (Em estoque / Estoque baixo / Esgotado). Busca com debounce de 300 ms, pills de categoria, botão "Limpar filtros", grid 1 coluna no celular e 3–4 no desktop, zoom suave na imagem, atualização em tempo real (Realtime) quando produto for alterado ou desativado. Mostrar só produtos e categorias ativos.

Página do produto: galeria, descrição, preço, seletor visual de cor (com nome e HEX), estoque por cor, seletor de quantidade (−/+, campo numérico, atalhos ±10, ±30, ±50, limitado ao estoque). Cor obrigatória se o produto tiver variações. Produto/cor sem estoque não pode ser adicionado.

Carrinho (Zustand, persistido no localStorage): addItem, removeItem, updateQuantity, clearCart, calculateTotal. Cada item: produto, foto, cor, quantidade, preço unitário, subtotal. Estado vazio amigável. Ao abrir o carrinho/checkout, revalide preços e estoque no servidor e avise o cliente se algo mudou.

Checkout e WhatsApp: exibir itens, dados do cliente e campo de observações. Ao confirmar:

Validar dados.

Chamar uma única função segura no banco (RPC, em transação) que: faz upsert do cliente (chave: WhatsApp), grava/atualiza endereço, cria o pedido e os itens, recalcula preços e total no servidor (nunca confiar no valor vindo do navegador), confere estoque e registra a movimentação de estoque.

Só após sucesso, abrir wa.me/<numero da empresa>?text=<mensagem> com encodeURIComponent. O número da empresa vem de variável de ambiente.

Em caso de erro, não abrir o WhatsApp e mostrar mensagem clara.

Modelo da mensagem:

*Novo Pedido - ArteRosa* (#[número do pedido])

*Cliente:* [Nome]
*Tel:* [WhatsApp]
*End:* [Endereço]
*Loja:* [Nome da loja]

*Itens:*
- [Qtd]x [Produto] (Cor: [Cor]) - R$ [Subtotal]

*Total:* R$ [Total]

_Pagamento a combinar pelo WhatsApp._


BANCO DE DADOS (PostgreSQL / Supabase)

Normalizado até a 3FN, sem listas em campos. Use uuid (ou bigint) como PK, numeric(12,2) para dinheiro, timestamptz para datas, CHECK para status e quantidades (≥ 0), FKs com ON DELETE RESTRICT por padrão (cascata só onde fizer sentido, ex.: itens de um produto em rascunho). Índices em todas as FKs, data_transacao, status e criado_em de pedidos.

Tabelas:

categorias (id, nome, slug único, ativo, criada_em)

cores (id, nome, codigo_hex, ativo) — catálogo reutilizável

produtos (id, categoria_id, nome, slug único, descricao, preco_base, ativo, criado_em, atualizado_em)

variacoes_cor (id, produto_id, cor_id, foto_url, estoque_atual, estoque_minimo, ativo; único por produto+cor)

produto_imagens (id, produto_id, url, ordem) — galeria

clientes (id, nome, nome_loja, whatsapp único normalizado, email, ativo, criado_em, atualizado_em)

enderecos (id, cliente_id, cep, logradouro, numero, complemento, bairro, cidade, estado, principal)

pedidos (id, numero sequencial legível, cliente_id, endereco_id, valor_total, status, observacoes, criado_em, atualizado_em)

pedido_status_historico (id, pedido_id, status_anterior, status_novo, alterado_por, criado_em)

itens_pedido (id, pedido_id, produto_id, variacao_cor_id, quantidade > 0, preco_unitario, subtotal) — o preço é um retrato do momento da compra

transacoes_financeiras (id, tipo entrada/saída, categoria_id, descricao, valor > 0, data_transacao, data_vencimento, data_pagamento, status_pagamento pendente/pago/cancelado, pedido_id opcional, criado_em)

categorias_financeiras (Compra de Materiais, Frete, Venda Direta, Custos Operacionais, Outros)

movimentacoes_estoque (id, variacao_cor_id, tipo entrada/saída/ajuste, quantidade, motivo, pedido_id opcional, criado_em)

instagram_metricas (id, mes/ano único, visitas_perfil, alcance, visualizacoes, interacoes)

perfis_admin (user_id do Supabase Auth, papel) — define quem é administradora

Status do pedido: pendente, em_producao, pronto_envio, concluido, cancelado.

Dados de pagamento ficam em transacoes_financeiras (vencimento, pagamento, valor pago), não duplicados em pedidos. Ao concluir/receber um pedido, gere a entrada financeira correspondente.

REGRAS DE NEGÓCIO

Padrão de estoque: o estoque é reservado (baixado) quando o pedido é criado; se o pedido for cancelado, o estoque volta e isso é registrado em movimentacoes_estoque. Toda mudança de estoque gera movimentação.

Estoque nunca fica negativo; a checagem e a baixa ocorrem no banco, de forma atômica, para evitar dois clientes comprando a última unidade.

Total = soma de (quantidade × preço unitário), sempre calculado no servidor.

Pedido sempre ligado a um cliente; item ligado a produto e (se houver) variação de cor.

Produtos/clientes com histórico não são apagados: use desativar (soft delete).

Categoria com produtos: oferecer desativar, transferir produtos ou bloquear a exclusão com explicação.

Exclusões e cancelamentos exigem ConfirmDialog; toda ação mostra feedback de sucesso ou erro.

Faturamento ≠ fluxo de caixa: venda a prazo só entra no caixa quando recebida.

SEGURANÇA (RLS)

Leitura pública: apenas categorias, produtos, cores e variações ativos, sem expor dados internos.

Clientes, endereços, pedidos, itens, estoque e financeiro: sem acesso público. Criação de pedido só pela RPC/Edge Function.

Admin: acesso total, validado por perfis_admin (não apenas "estar logado").

Bucket produtos-midia: leitura pública; escrita só admin; redimensionar/comprimir imagens no upload (drag and drop) e remover imagens antigas ao trocar.

Realtime habilitado em produtos, variações, estoque e pedidos.

Login com Supabase Auth (e-mail/usuário + senha, validação, estado de carregamento, mensagem de erro, logout, sessão persistente, redirecionamento de não autenticados). Usuário de teste apenas via seed/variável de ambiente.

PAINEL ADMIN

Dashboard: total de produtos, clientes ativos, pedidos pendentes no mês, faturamento do mês, despesas, lucro líquido, saldo de caixa, estoque baixo, esgotados, atalhos rápidos. Filtros: mês, ano, período personalizado.

Produtos: listar (thumbnail, nome, categoria, preço, variações, estoque, status, criação, ações), buscar, paginar, filtrar por categoria/status; formulário com dados, imagens, várias cores (HEX, foto, estoque inicial e mínimo).

Categorias e cores: CRUD completo; slug automático; cores reutilizáveis e associáveis a vários produtos.

Estoque: tabela por produto+cor (atual, mínimo, última movimentação, status), edição rápida, filtros (todos, baixo, esgotado, categoria, produto). Regra visual: > mínimo normal; ≤ 5 badge amarela "Estoque baixo"; 0 badge vermelha "Esgotado".

Pedidos: tabela (nº, cliente, loja, data/hora, total, status), busca por nome/ID, filtros por período e status, detalhe completo (cliente, endereço, itens com foto/cor/qtd/preço, observações, histórico de status, botão WhatsApp), alteração de status com atualização em tempo real.

Clientes: tabela (nome, loja, WhatsApp, e-mail, endereço principal, nº de pedidos, total gasto, último pedido, cadastro), busca e ordenação, CRUD com desativação, botão "Iniciar conversa" (wa.me/55...).

Financeiro: lançamento de entradas/saídas, histórico, filtros (mês, ano, período, tipo, pago/pendente/em atraso) e rodapé com total de entradas, saídas, saldo, pendentes e em atraso.

KPIs (calcular no banco com views ou funções SQL)

Operacionais: produtos mais vendidos por mês (quantidade), pedidos por mês, métricas do Instagram (lançamento manual). Clientes: nº de pedidos por cliente, frequência (intervalo médio entre compras, sinalizando quem reduziu), valor total e LTV. Financeiros: vendas mensais, despesas mensais, margem de lucro ((faturamento − despesas) / faturamento) × 100 (proteger divisão por zero), fluxo de caixa (recebido − pago), prazo médio de recebimento vs. pagamento, inadimplência (vencido não pago e % sobre o faturamento).

Gráficos: top 5 produtos (barras horizontais), faturamento × despesas, lucro líquido, rosca de despesas por categoria, pedidos por mês, fluxo de caixa, ranking de clientes. Todos com estado vazio e loading.

PLANO DE ENTREGA

Fase 0 — Planejamento (sem código de tela): arquitetura, estrutura de pastas, modelo de dados (diagrama textual), script SQL completo (tabelas, índices, RLS, RPC, storage, realtime), telas principais, fluxo do cliente, fluxo admin, decisões assumidas e perguntas. Aguarde aprovação.

Fase 1 — Base: projeto, tema Tailwind, componentes base, layout, rotas, Supabase, Auth e proteção de rotas. (US01 + US02)

Fase 2 — Loja pública: identificação, catálogo com filtros e realtime, página do produto, carrinho, checkout + RPC + WhatsApp. (US03–US06)

Fase 3 — Admin operacional: produtos, categorias, cores, estoque, pedidos, clientes. (US07, US08, US11, US12)

Fase 4 — Financeiro e KPIs: lançamentos, dashboard, gráficos, métricas do Instagram. (US09, US10)

Fase 5 — Acabamento: seed de demonstração, testes, README, documentação, revisão de acessibilidade e responsividade.

TESTES MÍNIMOS

Total do carrinho; bloqueio acima do estoque; corrida pela última unidade; cancelamento devolvendo estoque; pedido só abre WhatsApp após sucesso; RLS (anônimo não lê clientes/pedidos/financeiro); fórmulas de margem, fluxo de caixa e inadimplência.

ENTREGÁVEIS

Aplicação funcional; scripts SQL (schema, RLS, RPC, seed); .env.example; README (instalação e execução); admin de teste; dados de exemplo (produtos, categorias, cores, clientes, pedidos, financeiro); documentação das rotas e do banco.

CRITÉRIOS DE ACEITE

Login e rotas admin protegidas; CRUD de produtos com categorias e cores; loja mostra só itens ativos; busca/filtro funcionando; cor e quantidade escolhidas respeitando o estoque; carrinho correto; cliente, pedido e itens salvos antes do WhatsApp; mensagem completa no link; admin consulta e altera pedidos e clientes; alertas de estoque; lançamentos financeiros; KPIs corretos; layout responsivo; RLS ativo; nenhuma chave sensível no frontend.

Comece agora pela Fase 0.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/44ef8b5c-0733-4613-9406-ccbcf36b2a74).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
