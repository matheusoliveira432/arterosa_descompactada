import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ClipboardList, Package, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { numero } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel | Arte Rosa Artesanatos" },
      { name: "description", content: "Resumo de produtos, pedidos e clientes da Arte Rosa." },
      { property: "og:title", content: "Painel | Arte Rosa Artesanatos" },
      { property: "og:description", content: "Resumo de produtos, pedidos e clientes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PainelInicio,
});

async function carregarResumo() {
  const [produtos, clientes, pedidos, estoqueBaixo] = await Promise.all([
    supabase.from("produtos").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("clientes").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    supabase.from("variacoes_cor").select("id, estoque_atual").eq("ativo", true),
  ]);

  const baixo = (estoqueBaixo.data ?? []).filter((v) => v.estoque_atual <= 5).length;

  return {
    produtos: produtos.count ?? 0,
    clientes: clientes.count ?? 0,
    pedidosPendentes: pedidos.count ?? 0,
    estoqueBaixo: baixo,
  };
}

function PainelInicio() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-resumo"], queryFn: carregarResumo });

  const cartoes = [
    { rotulo: "Produtos ativos", valor: data?.produtos, icone: Package },
    { rotulo: "Clientes ativos", valor: data?.clientes, icone: Users },
    { rotulo: "Pedidos pendentes", valor: data?.pedidosPendentes, icone: ClipboardList },
    { rotulo: "Cores com estoque baixo", valor: data?.estoqueBaixo, icone: AlertTriangle },
  ];

  return (
    <AdminLayout titulo="Início">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cartoes.map((c) =>
          isLoading ? (
            <Skeleton key={c.rotulo} className="h-28 rounded-2xl" />
          ) : (
            <div
              key={c.rotulo}
              className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{c.rotulo}</p>
                <c.icone className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <p className="mt-3 font-display text-3xl">{numero(c.valor ?? 0)}</p>
            </div>
          ),
        )}
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold">Atalhos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          As telas de produtos, pedidos, estoque e financeiro chegam nas próximas etapas.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="secondary" className="rounded-xl">
            <Link to="/">Ver a loja</Link>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
