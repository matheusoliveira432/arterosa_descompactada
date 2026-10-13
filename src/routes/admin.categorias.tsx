import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Power } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/admin/categorias")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Categorias | Painel Arte Rosa" },
      { name: "description", content: "Gestão de categorias no painel da Arte Rosa Artesanatos." },
      { property: "og:title", content: "Categorias | Painel Arte Rosa" },
      { property: "og:description", content: "Gestão de categorias no painel da Arte Rosa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

type Categoria = { id: string; nome: string; slug: string; ativo: boolean };

function Pagina() {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categorias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, nome, slug, ativo")
        .order("nome");
      if (error) throw error;
      return data as Categoria[];
    },
  });

  const salvar = async () => {
    const n = nome.trim();
    if (n.length < 2) { toast.error("Digite o nome da categoria."); return; }
    setSalvando(true);
    const payload = { nome: n, slug: slugify(n) };
    const { error } = editando
      ? await supabase.from("categorias").update(payload).eq("id", editando)
      : await supabase.from("categorias").insert(payload);
    setSalvando(false);
    if (error) { toast.error("Não foi possível salvar. Talvez esse nome já exista."); return; }
    toast.success(editando ? "Categoria atualizada!" : "Categoria criada!");
    setNome("");
    setEditando(null);
    qc.invalidateQueries({ queryKey: ["admin-categorias"] });
    qc.invalidateQueries({ queryKey: ["categorias"] });
  };

  const alternar = async (c: Categoria) => {
    const { error } = await supabase.from("categorias").update({ ativo: !c.ativo }).eq("id", c.id);
    if (error) { toast.error("Não foi possível alterar."); return; }
    toast.success(c.ativo ? "Categoria desativada." : "Categoria ativada.");
    qc.invalidateQueries({ queryKey: ["admin-categorias"] });
    qc.invalidateQueries({ queryKey: ["categorias"] });
  };

  return (
    <AdminLayout titulo="Categorias">
      <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-semibold">{editando ? "Editar categoria" : "Nova categoria"}</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Laços infantis"
            className="h-12 rounded-xl"
          />
          <Button onClick={salvar} disabled={salvando} className="h-12 rounded-xl">
            <Plus className="mr-2 h-5 w-5" /> {editando ? "Salvar" : "Adicionar"}
          </Button>
          {editando ? (
            <Button variant="ghost" className="h-12 rounded-xl" onClick={() => { setEditando(null); setNome(""); }}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
        ) : !data?.length ? (
          <EmptyState titulo="Nenhuma categoria" descricao="Cadastre a primeira categoria acima." />
        ) : (
          data.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
              <div>
                <p className="font-semibold">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{c.ativo ? "Ativa na loja" : "Desativada"}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => { setEditando(c.id); setNome(c.nome); }}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button variant="secondary" className="rounded-xl" onClick={() => alternar(c)}>
                  <Power className="mr-2 h-4 w-4" /> {c.ativo ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
