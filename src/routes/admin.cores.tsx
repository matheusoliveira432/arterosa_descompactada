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
import { fundoCor } from "@/lib/cor";

export const Route = createFileRoute("/admin/cores")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cores | Painel Arte Rosa" },
      { name: "description", content: "Gestão de cores no painel da Arte Rosa Artesanatos." },
      { property: "og:title", content: "Cores | Painel Arte Rosa" },
      { property: "og:description", content: "Gestão de cores no painel da Arte Rosa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

type Cor = { id: string; nome: string; codigo_hex: string; codigo_hex_2: string | null; ativo: boolean };

function Pagina() {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [hex, setHex] = useState("#E8A598");
  const [dupla, setDupla] = useState(false);
  const [hex2, setHex2] = useState("#FFFFFF");
  const [editando, setEditando] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-cores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cores").select("id, nome, codigo_hex, codigo_hex_2, ativo").order("nome");
      if (error) throw error;
      return data as Cor[];
    },
  });

  const limpar = () => { setNome(""); setHex("#E8A598"); setDupla(false); setHex2("#FFFFFF"); setEditando(null); };

  const salvar = async () => {
    if (nome.trim().length < 2) { toast.error("Digite o nome da cor."); return; }
    const valido = (h: string) => /^#[0-9a-fA-F]{6}$/.test(h);
    if (!valido(hex) || (dupla && !valido(hex2))) { toast.error("Escolha uma cor válida."); return; }
    const payload = { nome: nome.trim(), codigo_hex: hex.toUpperCase(), codigo_hex_2: dupla ? hex2.toUpperCase() : null };
    const { error } = editando
      ? await supabase.from("cores").update(payload).eq("id", editando)
      : await supabase.from("cores").insert(payload);
    if (error) { toast.error("Não foi possível salvar. Talvez essa cor já exista."); return; }
    toast.success(editando ? "Cor atualizada!" : "Cor criada!");
    limpar();
    qc.invalidateQueries({ queryKey: ["admin-cores"] });
    qc.invalidateQueries({ queryKey: ["produtos"] });
  };

  const alternar = async (c: Cor) => {
    const { error } = await supabase.from("cores").update({ ativo: !c.ativo }).eq("id", c.id);
    if (error) { toast.error("Não foi possível alterar."); return; }
    toast.success(c.ativo ? "Cor desativada." : "Cor ativada.");
    qc.invalidateQueries({ queryKey: ["admin-cores"] });
  };

  return (
    <AdminLayout titulo="Cores">
      <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-semibold">{editando ? "Editar cor" : "Nova cor"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Para produtos de duas cores (ex.: “Verde e branco”), marque “Tem segunda cor”.</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Rosa bebê ou Verde e branco" className="h-12 rounded-xl sm:max-w-xs" />
          <label className="flex h-12 items-center gap-2 rounded-xl border px-3 text-sm">
            <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-8 w-10 cursor-pointer" aria-label="Escolher primeira cor" />
            {hex.toUpperCase()}
          </label>
          <label className="flex h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm">
            <input type="checkbox" checked={dupla} onChange={(e) => setDupla(e.target.checked)} className="h-5 w-5" />
            Tem segunda cor
          </label>
          {dupla ? (
            <label className="flex h-12 items-center gap-2 rounded-xl border px-3 text-sm">
              <input type="color" value={hex2} onChange={(e) => setHex2(e.target.value)} className="h-8 w-10 cursor-pointer" aria-label="Escolher segunda cor" />
              {hex2.toUpperCase()}
            </label>
          ) : null}
          <span className="h-12 w-12 shrink-0 rounded-full border" style={fundoCor(hex, dupla ? hex2 : null)} aria-label="Prévia" />
          <Button onClick={salvar} className="h-12 rounded-xl">
            <Plus className="mr-2 h-5 w-5" /> {editando ? "Salvar" : "Adicionar"}
          </Button>
          {editando ? <Button variant="ghost" className="h-12 rounded-xl" onClick={limpar}>Cancelar</Button> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : !data?.length ? (
          <EmptyState titulo="Nenhuma cor" descricao="Cadastre a primeira cor acima." />
        ) : (
          data.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full border" style={fundoCor(c.codigo_hex, c.codigo_hex_2)} />
                <div>
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">{c.codigo_hex}{c.codigo_hex_2 ? ` + ${c.codigo_hex_2}` : ""} · {c.ativo ? "Ativa" : "Desativada"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setEditando(c.id); setNome(c.nome); setHex(c.codigo_hex); setDupla(!!c.codigo_hex_2); setHex2(c.codigo_hex_2 ?? "#FFFFFF"); }}>
                  <Pencil className="mr-1 h-4 w-4" /> Editar
                </Button>
                <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => alternar(c)}>
                  <Power className="mr-1 h-4 w-4" /> {c.ativo ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
