import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";

import catalogoImagem from "@/assets/arte-rosa-catalogo.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LojaLayout } from "@/components/loja/LojaLayout";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { moeda } from "@/lib/format";
import { fotoPrincipal, listarCategorias, listarProdutos } from "@/lib/loja";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arte Rosa Artesanatos | Tiaras, arranjos e laços artesanais" },
      {
        name: "description",
        content: "Catálogo da Arte Rosa: tiarinhas, arranjos de flores e laços feitos à mão. Escolha suas peças e envie seu pedido pelo WhatsApp.",
      },
      { property: "og:title", content: "Arte Rosa Artesanatos | Tiaras, arranjos e laços artesanais" },
      { property: "og:description", content: "Conheça tiarinhas, arranjos e laços artesanais da Arte Rosa. Monte seu pedido pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [buscaDebounce, setBuscaDebounce] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounce(busca), 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const produtos = useQuery({ queryKey: ["produtos"], queryFn: listarProdutos });
  const categorias = useQuery({ queryKey: ["categorias"], queryFn: listarCategorias });

  useEffect(() => {
    const canal = supabase
      .channel("inicio-catalogo")
      .on("postgres_changes", { event: "*", schema: "public", table: "produtos" }, () => {
        queryClient.invalidateQueries({ queryKey: ["produtos"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "variacoes_cor" }, () => {
        queryClient.invalidateQueries({ queryKey: ["produtos"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "categorias" }, () => {
        queryClient.invalidateQueries({ queryKey: ["categorias"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [queryClient]);

  const lista = useMemo(() => {
    const termo = buscaDebounce.trim().toLocaleLowerCase("pt-BR");
    return (produtos.data ?? []).filter((produto) => {
      const texto = `${produto.nome} ${produto.descricao ?? ""} ${produto.categorias?.nome ?? ""}`.toLocaleLowerCase("pt-BR");
      return (!categoria || produto.categoria_id === categoria) && (!termo || texto.includes(termo));
    });
  }, [produtos.data, buscaDebounce, categoria]);

  const limparFiltros = () => { setBusca(""); setBuscaDebounce(""); setCategoria(null); };

  return (
    <LojaLayout>
      <section className="relative isolate min-h-[350px] overflow-hidden border-b bg-muted sm:min-h-[420px]">
        <img src={catalogoImagem} alt="Coleção artesanal de tiaras, laços e arranjos florais" width={1600} height={1008} fetchPriority="high" className="absolute inset-0 -z-10 h-full w-full object-cover object-center opacity-25 sm:opacity-100" />
        <div className="mx-auto flex min-h-[350px] max-w-6xl items-center px-4 py-12 sm:min-h-[420px] sm:py-16">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase text-foreground">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden /> Feito à mão, peça por peça
            </span>
            <h1 className="mt-4 font-display text-4xl leading-tight text-foreground sm:text-5xl">Arte Rosa Artesanatos</h1>
            <p className="mt-4 text-base leading-relaxed text-foreground sm:text-lg">
              Tiarinhas, arranjos de flores e laços para momentos especiais. Escolha suas peças e monte seu pedido.
            </p>
            <Button asChild className="mt-6" size="lg"><a href="#catalogo">Ver produtos</a></Button>
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-10 sm:py-14">
        <div className="mb-6">
          <h2 className="font-display text-2xl sm:text-3xl">Nossas peças</h2>
          <p className="mt-1 text-sm text-muted-foreground">Escolha suas favoritas para o seu pedido.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input className="h-12 pl-12" placeholder="Buscar por nome ou categoria..." aria-label="Buscar produtos" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filtrar por categoria">
            <Button variant={categoria === null ? "default" : "outline"} size="sm" aria-pressed={categoria === null} onClick={() => setCategoria(null)}>Todas</Button>
            {(categorias.data ?? []).map((c) => (
              <Button key={c.id} variant={categoria === c.id ? "default" : "outline"} size="sm" aria-pressed={categoria === c.id} onClick={() => setCategoria(c.id)}>{c.nome}</Button>
            ))}
            {(busca || categoria) && <Button variant="ghost" size="sm" onClick={limparFiltros}>Limpar filtros</Button>}
          </div>
        </div>

        {produtos.isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-[3/4] w-full" />)}
          </div>
        ) : produtos.isError || categorias.isError ? (
          <div className="mt-8"><EmptyState titulo="Não foi possível carregar os produtos" descricao="Tente novamente em instantes." acao={<Button onClick={() => { queryClient.invalidateQueries({ queryKey: ["produtos"] }); queryClient.invalidateQueries({ queryKey: ["categorias"] }); }}>Tentar novamente</Button>} /></div>
        ) : lista.length === 0 ? (
          <div className="mt-8"><EmptyState titulo={busca || categoria ? "Nenhum produto encontrado" : "Ainda não há produtos por aqui"} descricao={busca || categoria ? "Tente outro nome ou veja todas as categorias." : "Volte em breve para conhecer nossas peças."} acao={busca || categoria ? <Button onClick={limparFiltros}>Limpar filtros</Button> : undefined} /></div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {lista.map((produto) => {
              const foto = fotoPrincipal(produto);
              return (
                <Link key={produto.id} to="/produto/$id" params={{ id: produto.id }} className="group flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="aspect-square overflow-hidden bg-secondary">
                    {foto ? <img src={foto} alt={produto.nome} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /> : <div className="grid h-full place-items-center text-sm text-muted-foreground">Sem foto</div>}
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <p className="text-xs text-muted-foreground">{produto.categorias?.nome}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug sm:text-base">{produto.nome}</h3>
                    <p className="mt-auto pt-3 text-base font-bold text-foreground sm:text-lg">{moeda(produto.preco_base)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </LojaLayout>
  );
}