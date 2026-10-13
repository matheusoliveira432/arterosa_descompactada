import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState } from "@/components/EmptyState";
import { EstoqueBadge } from "@/components/EstoqueBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { fundoCor } from "@/lib/cor";

export const Route = createFileRoute("/admin/estoque")({ ssr: false, head: () => ({ meta: [
  { title: "Estoque | Painel Arte Rosa" }, { name: "description", content: "Controle de estoque dos produtos Arte Rosa." },
  { property: "og:title", content: "Estoque | Painel Arte Rosa" }, { property: "og:description", content: "Controle de estoque dos produtos Arte Rosa." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" },
] }), component: Pagina });

type Linha = { id: string; estoque_atual: number; estoque_minimo: number; cores: { nome: string; codigo_hex: string; codigo_hex_2: string | null } | null; produtos: { nome: string; categorias: { nome: string } | null } | null };
function Pagina() {
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin-estoque"], queryFn: async () => {
    const { data, error } = await supabase.from("variacoes_cor").select("id, estoque_atual, estoque_minimo, cores(nome, codigo_hex, codigo_hex_2), produtos(nome, categorias(nome))").order("estoque_atual");
    if (error) throw error;
    return data as unknown as Linha[];
  } });
  const linhas = data.filter((v) => `${v.produtos?.nome} ${v.cores?.nome}`.toLowerCase().includes(busca.toLowerCase()) && (filtro === "todos" || (filtro === "esgotado" ? v.estoque_atual === 0 : v.estoque_atual > 0 && v.estoque_atual <= Math.max(v.estoque_minimo, 5))));
  async function salvar(id: string) {
    const n = Number(valor);
    if (!Number.isInteger(n) || n < 0) { toast.error("Digite uma quantidade válida."); return; }
    setSalvando(true);
    const { error } = await supabase.rpc("ajustar_estoque", { p_variacao_id: id, p_novo_estoque: n, p_motivo: "Ajuste manual no painel" });
    setSalvando(false);
    if (error) { toast.error("Não foi possível ajustar o estoque."); return; }
    toast.success("Estoque atualizado!"); setEditando(null);
    qc.invalidateQueries({ queryKey: ["admin-estoque"] }); qc.invalidateQueries({ queryKey: ["produtos"] }); qc.invalidateQueries({ queryKey: ["admin-resumo"] });
  }
  return <AdminLayout titulo="Estoque"><div className="flex flex-wrap gap-3 mb-5"><Input aria-label="Buscar produto ou cor" placeholder="Buscar produto ou cor" value={busca} onChange={e => setBusca(e.target.value)} className="max-w-sm"/><select aria-label="Filtrar estoque" className="rounded-lg border bg-background px-3" value={filtro} onChange={e => setFiltro(e.target.value)}><option value="todos">Todos</option><option value="baixo">Estoque baixo</option><option value="esgotado">Esgotados</option></select></div>
    {error ? <p role="alert">Não foi possível carregar o estoque.</p> : isLoading ? <p>Carregando estoque...</p> : !linhas.length ? <EmptyState titulo="Nenhuma cor encontrada" descricao="Experimente outro filtro ou cadastre cores nos produtos."/> : <div className="space-y-2">{linhas.map(v => <div key={v.id} className="flex flex-wrap items-center gap-3 border-b py-4"><span className="h-7 w-7 rounded-full border" style={fundoCor(v.cores?.codigo_hex, v.cores?.codigo_hex_2)} /><div className="min-w-40 flex-1"><p className="font-semibold">{v.produtos?.nome ?? "Produto"} · {v.cores?.nome ?? "Cor"}</p><p className="text-sm text-muted-foreground">{v.produtos?.categorias?.nome} · Mínimo: {v.estoque_minimo}</p></div><EstoqueBadge quantidade={v.estoque_atual} minimo={v.estoque_minimo}/><span className="font-semibold">{v.estoque_atual} un.</span>{editando === v.id ? <div className="flex gap-2"><Input aria-label="Nova quantidade" type="number" min="0" className="w-24" value={valor} onChange={e => setValor(e.target.value)}/><Button disabled={salvando} onClick={() => salvar(v.id)}>Salvar</Button><Button variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button></div> : <Button variant="outline" onClick={() => {setEditando(v.id); setValor(String(v.estoque_atual));}}>Ajustar</Button>}</div>)}</div>}</AdminLayout>;
}
