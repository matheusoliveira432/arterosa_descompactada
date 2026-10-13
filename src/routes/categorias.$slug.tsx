import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { LojaLayout } from "@/components/loja/LojaLayout";
import { ProdutoCard } from "@/components/loja/ProdutoCard";
import { listarProdutos } from "@/lib/loja";

export const Route = createFileRoute("/categorias/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} | Arte Rosa Artesanatos` },
      { name: "description", content: `Produtos artesanais da categoria ${params.slug}.` },
      { property: "og:title", content: `${params.slug} | Arte Rosa Artesanatos` },
      { property: "og:description", content: `Produtos artesanais da categoria ${params.slug}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriaPagina,
});

function CategoriaPagina() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({ queryKey: ["produtos"], queryFn: listarProdutos });
  const produtos = (data ?? []).filter((p) => p.categorias?.slug === slug);
  const nome = produtos[0]?.categorias?.nome ?? slug;

  return (
    <LojaLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl capitalize">{nome}</h1>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : produtos.length === 0 ? (
            <EmptyState
              titulo="Nada por aqui ainda"
              descricao="Essa categoria não tem produtos disponíveis no momento."
              acao={
                <Button asChild className="rounded-xl">
                  <Link to="/produtos">Ver todos os produtos</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {produtos.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </LojaLayout>
  );
}
