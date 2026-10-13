import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flower2, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EstoqueBadge } from "@/components/EstoqueBadge";
import { EmptyState } from "@/components/EmptyState";
import { LojaLayout } from "@/components/loja/LojaLayout";
import { fundoCor } from "@/lib/cor";
import { buscarProduto, fotoPrincipal } from "@/lib/loja";
import { moeda } from "@/lib/format";
import { useCarrinho } from "@/store/carrinho";

export const Route = createFileRoute("/produto/$id")({
  head: () => ({
    meta: [
      { title: "Produto | Arte Rosa Artesanatos" },
      { name: "description", content: "Escolha a cor e a quantidade do seu produto artesanal." },
      { property: "og:title", content: "Produto | Arte Rosa Artesanatos" },
      { property: "og:description", content: "Escolha a cor e a quantidade do seu produto." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProdutoPagina,
});

function ProdutoPagina() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const addItem = useCarrinho((s) => s.addItem);
  const [variacaoId, setVariacaoId] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState(1);

  const { data: produto, isLoading } = useQuery({
    queryKey: ["produto", id],
    queryFn: () => buscarProduto(id),
  });

  const variacoes = produto?.variacoes_cor ?? [];
  const variacao = useMemo(
    () => variacoes.find((v) => v.id === variacaoId) ?? null,
    [variacoes, variacaoId],
  );
  const maximo = variacao?.estoque_atual ?? 0;
  const foto = variacao?.foto_url ?? (produto ? fotoPrincipal(produto) : null);

  const ajustar = (delta: number) => {
    setQuantidade((q) => Math.min(Math.max(q + delta, 1), Math.max(maximo, 1)));
  };

  const adicionar = () => {
    if (!produto) return;
    if (variacoes.length > 0 && !variacao) {
      toast.error("Escolha uma cor antes de adicionar.");
      return;
    }
    if (!variacao || variacao.estoque_atual <= 0) {
      toast.error("Esta cor está esgotada no momento.");
      return;
    }
    if (quantidade > variacao.estoque_atual) {
      toast.error(`Temos apenas ${variacao.estoque_atual} unidades desta cor.`);
      return;
    }
    addItem({
      variacaoId: variacao.id,
      produtoId: produto.id,
      produtoNome: produto.nome,
      corNome: variacao.cores?.nome ?? "Única",
      corHex: variacao.cores?.codigo_hex ?? "#E8A598",
      fotoUrl: variacao.foto_url ?? fotoPrincipal(produto),
      precoUnitario: Number(produto.preco_base),
      quantidade,
    });
    toast.success("Produto adicionado ao carrinho!");
    navigate({ to: "/carrinho" });
  };

  if (isLoading) {
    return (
      <LojaLayout>
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      </LojaLayout>
    );
  }

  if (!produto) {
    return (
      <LojaLayout>
        <div className="mx-auto w-full max-w-3xl px-4 py-16">
          <EmptyState
            titulo="Produto indisponível"
            descricao="Este produto pode ter sido desativado."
            acao={
              <Button asChild className="rounded-xl">
                <Link to="/produtos">Ver outros produtos</Link>
              </Button>
            }
          />
        </div>
      </LojaLayout>
    );
  }

  return (
    <LojaLayout>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border bg-secondary">
            {foto ? (
              <img src={foto} alt={produto.nome} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-primary">
                <Flower2 className="h-20 w-20" aria-hidden />
              </div>
            )}
          </div>
          {variacoes.some((v) => v.foto_url) ? (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {variacoes.filter((v) => v.foto_url).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => { setVariacaoId(v.id); setQuantidade(1); }}
                  className={`overflow-hidden rounded-xl border-2 ${v.id === variacaoId ? "border-primary" : "border-transparent"}`}
                  aria-label={`Ver cor ${v.cores?.nome ?? ""}`}
                >
                  <img src={v.foto_url!} alt={v.cores?.nome ?? produto.nome} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          {produto.categorias ? (
            <Link
              to="/categorias/$slug"
              params={{ slug: produto.categorias.slug }}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {produto.categorias.nome}
            </Link>
          ) : null}
          <h1 className="mt-2 font-display text-3xl">{produto.nome}</h1>
          <p className="mt-3 text-3xl font-bold">{moeda(produto.preco_base)}</p>
          {produto.descricao ? (
            <p className="mt-4 text-muted-foreground">{produto.descricao}</p>
          ) : null}

          <div className="mt-8">
            <p className="font-semibold">Escolha a cor</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {variacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Este produto ainda não tem cores cadastradas.
                </p>
              ) : (
                variacoes.map((v) => {
                  const esgotado = v.estoque_atual <= 0;
                  const ativo = v.id === variacaoId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={esgotado}
                      onClick={() => {
                        setVariacaoId(v.id);
                        setQuantidade(1);
                      }}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                        ativo ? "border-primary bg-primary-soft" : "border-border bg-card"
                      } ${esgotado ? "cursor-not-allowed opacity-50" : "hover:border-primary"}`}
                    >
                      <span
                        className="h-5 w-5 rounded-full border"
                        style={fundoCor(v.cores?.codigo_hex, v.cores?.codigo_hex_2)}
                        aria-hidden
                      />
                      <span>{v.cores?.nome ?? "Cor única"}</span>
                      <span className="text-xs text-muted-foreground">
                        {esgotado ? "esgotado" : `${v.estoque_atual} un.`}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {variacao ? (
            <div className="mt-4">
              <EstoqueBadge quantidade={variacao.estoque_atual} minimo={variacao.estoque_minimo} />
            </div>
          ) : null}

          <div className="mt-8">
            <p className="font-semibold">Quantidade</p>
            <div className="mt-3 flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl"
                aria-label="Diminuir quantidade"
                onClick={() => ajustar(-1)}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <Input
                type="number"
                inputMode="numeric"
                value={quantidade}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isNaN(v)) return;
                  setQuantidade(Math.min(Math.max(Math.trunc(v), 1), Math.max(maximo, 1)));
                }}
                className="h-12 w-24 rounded-xl text-center text-lg"
                aria-label="Quantidade"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl"
                aria-label="Aumentar quantidade"
                onClick={() => ajustar(1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[10, 30, 50].map((n) => (
                <Button
                  key={n}
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => ajustar(n)}
                >
                  +{n}
                </Button>
              ))}
              {[10, 30, 50].map((n) => (
                <Button
                  key={`m${n}`}
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => ajustar(-n)}
                >
                  −{n}
                </Button>
              ))}
            </div>
            {variacao ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Máximo disponível nesta cor: {variacao.estoque_atual} unidades.
              </p>
            ) : null}
          </div>

          <Button
            size="lg"
            className="mt-8 h-14 w-full rounded-xl text-base"
            onClick={adicionar}
            disabled={!variacao || variacao.estoque_atual <= 0}
          >
            <ShoppingBag className="mr-2 h-5 w-5" aria-hidden />
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </LojaLayout>
  );
}
