import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { LojaLayout } from "@/components/loja/LojaLayout";
import { ProdutoCard } from "@/components/loja/ProdutoCard";
import { listarCategorias, listarProdutos } from "@/lib/loja";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos | Arte Rosa Artesanatos" },
      {
        name: "description",
        content: "Catálogo completo de arranjos, laços, arcos, tiaras e kits artesanais.",
      },
      { property: "og:title", content: "Produtos | Arte Rosa Artesanatos" },
      { property: "og:description", content: "Catálogo de artesanato feminino para revenda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Produtos,
});

function Produtos() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [buscaDebounce, setBuscaDebounce] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounce(busca), 300);
    return () => clearTimeout(t);
  }, [busca]);

  const { data: produtos, isLoading } = useQuery({
    queryKey: ["produtos"],
    queryFn: listarProdutos,
  });
  const { data: categorias } = useQuery({ queryKey: ["categorias"], queryFn: listarCategorias });

  useEffect(() => {
    const canal = supabase
      .channel("catalogo-publico")
      .on("postgres_changes", { event: "*", schema: "public", table: "produtos" }, () => {
        queryClient.invalidateQueries({ queryKey: ["produtos"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "variacoes_cor" }, () => {
        queryClient.invalidateQueries({ queryKey: ["produtos"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [queryClient]);

  const filtrados = useMemo(() => {
    const termo = buscaDebounce.trim().toLowerCase();
    return (produtos ?? []).filter((p) => {
      const combinaCategoria = !categoria || p.categoria_id === categoria;
      const combinaTermo =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        (p.descricao ?? "").toLowerCase().includes(termo);
      return combinaCategoria && combinaTermo;
    });
  }, [produtos, buscaDebounce, categoria]);

  return (
    <LojaLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl">Nossos produtos</h1>
        <p className="mt-2 text-muted-foreground">
          Escolha as peças, as cores e a quantidade que você precisa.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome do produto"
              className="h-12 rounded-xl pl-10"
              aria-label="Buscar produtos"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoria === null ? "default" : "secondary"}
              className="rounded-full"
              onClick={() => setCategoria(null)}
            >
              Todas
            </Button>
            {(categorias ?? []).map((c) => (
              <Button
                key={c.id}
                variant={categoria === c.id ? "default" : "secondary"}
                className="rounded-full"
                onClick={() => setCategoria(c.id)}
              >
                {c.nome}
              </Button>
            ))}
            {busca || categoria ? (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setBusca("");
                  setCategoria(null);
                }}
              >
                Limpar filtros
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <EmptyState
              titulo="Nenhum produto encontrado"
              descricao="Tente outro nome ou limpe os filtros para ver tudo."
              acao={
                <Button
                  className="rounded-xl"
                  onClick={() => {
                    setBusca("");
                    setCategoria(null);
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filtrados.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </LojaLayout>
  );
}
