# Fase 0 — Planejamento: Arte Rosa Artesanatos

## Decisões já fechadas

- WhatsApp da empresa: **(12) 99244-3207** (guardado em configuração segura, não no código visível).
- Estoque baixado **ao criar o pedido**; cancelamento devolve o estoque automaticamente.
- Login do painel por **usuário e senha** cadastrados no sistema (sem e-mail obrigatório).
- O sistema virá com **dados de exemplo** (produtos, cores, clientes, pedidos, financeiro), que podem ser apagados depois.

## Ajustes de tecnologia (uma linha cada)

- Navegação: o projeto já usa TanStack Router em vez de React Router — mesma função, é o padrão fixo desta plataforma.
- Backend: Lovable Cloud (banco Postgres, login, arquivos e funções de servidor já integrados), sem contas externas a criar.
- Login por usuário: como o sistema de contas exige um e-mail interno, cada usuário vira um endereço interno automático — você só digita usuário e senha.

## Identidade visual

Fundo branco, rosa principal #E8A598, rosa claro #F7EBE8, escuro #2D2727, claro #FAFAFA. Cantos arredondados, sombras suaves, animações discretas, avisos de sucesso/erro sempre visíveis. Botões grandes, ícone sempre com texto, tudo em português e em reais.

## O que o cliente vê (loja)

1. Primeira visita: uma janela pede nome, WhatsApp, endereço completo, nome da loja e e-mail (os dois últimos opcionais). Fica salvo no aparelho e pode ser editado depois.
2. Catálogo com foto, preço, categoria e aviso de estoque (Em estoque / Estoque baixo / Esgotado), busca e filtros por categoria, atualizando sozinho quando algo muda.
3. Página do produto: galeria, escolha de cor (com estoque por cor) e quantidade com atalhos +10 / +30 / +50, limitada ao estoque.
4. Carrinho salvo no aparelho, com conferência de preço e estoque ao abrir.
5. Finalizar: o pedido é gravado primeiro no sistema e só então abre o WhatsApp com a mensagem pronta. Se der erro, o WhatsApp não abre e aparece um aviso claro.

## O que a administradora vê (painel)

Login protegido e, dentro: painel com números do mês, produtos, categorias, cores, estoque, pedidos, clientes, financeiro e indicadores com gráficos.

## Detalhes técnicos

**Banco (todas as tabelas pedidas):** categorias, cores, produtos, variacoes_cor, produto_imagens, clientes, enderecos, pedidos, pedido_status_historico, itens_pedido, categorias_financeiras, transacoes_financeiras, movimentacoes_estoque, instagram_metricas, perfis_admin. Chaves uuid, dinheiro em numeric(12,2), datas timestamptz, CHECK em status e quantidades, FKs com ON DELETE RESTRICT, índices em FKs, status, datas e criado_em.

**Segurança (RLS):** leitura pública só de categorias/produtos/cores/variações ativos. Clientes, endereços, pedidos, itens, estoque e financeiro sem acesso público. Acesso administrativo validado por papel em perfis_admin (função security definer `has_role`), nunca por "estar logado".

**Pedido:** uma única função transacional no banco (`criar_pedido`) que faz upsert do cliente pelo WhatsApp normalizado, grava endereço, recalcula preços e total no servidor, confere e baixa estoque de forma atômica, cria pedido + itens + movimentações e devolve o número do pedido. Cancelamento estorna via função `cancelar_pedido`.

**KPIs:** views/funções SQL para top produtos, pedidos por mês, faturamento × despesas, margem (com proteção contra divisão por zero), fluxo de caixa, prazo médio de recebimento/pagamento, inadimplência, LTV e frequência de compra.

**Arquivos:** bucket `produtos-midia`, leitura pública, escrita só admin, imagens comprimidas no upload e antigas removidas na troca.

**Tempo real:** produtos, variações, estoque e pedidos.

**Rotas:** públicas `/`, `/produtos`, `/produto/:id`, `/categorias/:slug`, `/carrinho`, `/checkout`, 404. Admin: `/admin/login`, `/admin`, produtos (lista/novo/editar), categorias, cores, estoque, pedidos (lista/detalhe), clientes, financeiro, kpis.

## Fases seguintes

- Fase 1: base visual, componentes, layout, rotas, banco ativado, login e proteção do painel.
- Fase 2: loja pública completa até o envio do pedido pelo WhatsApp.
- Fase 3: painel operacional (produtos, categorias, cores, estoque, pedidos, clientes).
- Fase 4: financeiro, indicadores e gráficos, métricas do Instagram.
- Fase 5: dados de exemplo, testes, documentação, acessibilidade e responsividade.

Ao fim de cada fase eu digo o que foi feito, como testar e o que ficou pendente, e espero seu "ok".

## Perguntas em aberto (pode responder depois)

1. Quais categorias e cores iniciais reais devo cadastrar?
2. Qual usuário e senha você quer para entrar no painel?
