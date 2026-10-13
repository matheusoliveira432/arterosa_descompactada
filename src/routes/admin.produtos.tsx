import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { moeda, slugify } from "@/lib/format";
import { fundoCor } from "@/lib/cor";
import { enviarFoto, removerFoto, urlDaFoto } from "@/lib/fotos";

export const Route = createFileRoute("/admin/produtos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Produtos | Painel Arte Rosa" },
      { name: "description", content: "Cadastro de produtos no painel da Arte Rosa Artesanatos." },
      { property: "og:title", content: "Produtos | Painel Arte Rosa" },
      { property: "og:description", content: "Cadastro de produtos no painel da Arte Rosa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

type Variacao = { id?: string; cor_id: string; estoque_atual: number; estoque_minimo: number; foto_url?: string | null | undefined };
type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_base: number;
  categoria_id: string;
  ativo: boolean;
  categorias: { nome: string } | null;
  variacoes_cor: (Variacao & { id: string; cores: { nome: string; codigo_hex: string; codigo_hex_2: string | null } | null })[];
  produto_imagens: { id: string; url: string; ordem: number }[];
};

type Form = { id?: string; nome: string; descricao: string; preco: string; categoria_id: string; variacoes: Variacao[] };
const vazio: Form = { nome: "", descricao: "", preco: "", categoria_id: "", variacoes: [] };

function Pagina() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const produtos = useQuery({
    queryKey: ["admin-produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, descricao, preco_base, categoria_id, ativo, categorias(nome), produto_imagens(id, url, ordem), variacoes_cor(id, cor_id, estoque_atual, estoque_minimo, foto_url, cores(nome, codigo_hex, codigo_hex_2))")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return Promise.all((data as unknown as Produto[]).map(async p => ({ ...p, produto_imagens: await Promise.all(p.produto_imagens.map(async img => ({...img, preview: await urlDaFoto(img.url)}))), variacoes_cor: await Promise.all(p.variacoes_cor.map(async v => ({...v, preview: await urlDaFoto(v.foto_url)}))) })));
    },
  });
  const categorias = useQuery({
    queryKey: ["admin-categorias"],
    queryFn: async () => (await supabase.from("categorias").select("id, nome, slug, ativo").order("nome")).data ?? [],
  });
  const cores = useQuery({
    queryKey: ["admin-cores"],
    queryFn: async () => (await supabase.from("cores").select("id, nome, codigo_hex, ativo").order("nome")).data ?? [],
  });

  const recarregar = () => {
    qc.invalidateQueries({ queryKey: ["admin-produtos"] });
    qc.invalidateQueries({ queryKey: ["produtos"] });
  };

  const abrirEdicao = (p: Produto) =>
    setForm({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao ?? "",
      preco: String(p.preco_base),
      categoria_id: p.categoria_id,
      variacoes: p.variacoes_cor.map((v) => ({ id: v.id, cor_id: v.cor_id, estoque_atual: v.estoque_atual, estoque_minimo: v.estoque_minimo, foto_url: v.foto_url })),
    });

  const salvar = async () => {
    if (!form) return;
    const preco = Number(form.preco.replace(",", "."));
    if (form.nome.trim().length < 2) { toast.error("Digite o nome do produto."); return; }
    if (!form.categoria_id) { toast.error("Escolha uma categoria."); return; }
    if (!(preco > 0)) { toast.error("Digite um preço maior que zero."); return; }
    if (form.variacoes.some((v) => !v.cor_id)) { toast.error("Escolha a cor de cada variação."); return; }
    if (new Set(form.variacoes.map((v) => v.cor_id)).size !== form.variacoes.length) { toast.error("Há cores repetidas."); return; }

    setSalvando(true);
    try {
      const dados = {
        nome: form.nome.trim(),
        slug: slugify(form.nome) + (form.id ? "" : "-" + Math.random().toString(36).slice(2, 6)),
        descricao: form.descricao.trim() || null,
        preco_base: preco,
        categoria_id: form.categoria_id,
      };
      let produtoId = form.id;
      if (produtoId) {
        const { slug: _s, ...semSlug } = dados;
        const { error } = await supabase.from("produtos").update(semSlug).eq("id", produtoId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("produtos").insert(dados).select("id").single();
        if (error) throw error;
        produtoId = data.id;
      }
      for (const v of form.variacoes) {
        const linha = { produto_id: produtoId!, cor_id: v.cor_id, estoque_minimo: Math.max(0, v.estoque_minimo) };
        const { error } = v.id
          ? await supabase.from("variacoes_cor").update(linha).eq("id", v.id)
          : await supabase.from("variacoes_cor").insert({ ...linha, estoque_atual: Math.max(0, v.estoque_atual) });
        if (error) throw error;
        if (v.id && v.estoque_atual !== produtos.data?.find(p => p.id === produtoId)?.variacoes_cor.find(x => x.id === v.id)?.estoque_atual) {
          const { error: ajusteErro } = await supabase.rpc("ajustar_estoque", { p_variacao_id: v.id, p_novo_estoque: Math.max(0, v.estoque_atual), p_motivo: "Ajuste no cadastro do produto" });
          if (ajusteErro) throw ajusteErro;
        }
      }
      toast.success(form.id ? "Produto atualizado!" : "Produto criado!");
      setForm(null);
      recarregar();
    } catch {
      toast.error("Não foi possível salvar o produto. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const alternar = async (p: Produto) => {
    const { error } = await supabase.from("produtos").update({ ativo: !p.ativo }).eq("id", p.id);
    if (error) { toast.error("Não foi possível alterar."); return; }
    toast.success(p.ativo ? "Produto escondido da loja." : "Produto visível na loja.");
    recarregar();
  };

  const lista = (produtos.data ?? []).filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));
  const setV = (i: number, parte: Partial<Variacao>) =>
    setForm((f) => f && { ...f, variacoes: f.variacoes.map((v, j) => (j === i ? { ...v, ...parte } : v)) });

  async function subirFoto(arquivo: File, variacao?: Variacao) {
    if (!form?.id) return;
    setEnviando(true);
    let caminho: string | undefined;
    try {
      caminho = await enviarFoto(arquivo, form.id);
      if (variacao?.id) {
        const { error } = await supabase.from("variacoes_cor").update({foto_url:caminho}).eq("id",variacao.id);
        if (error) throw error;
        if (variacao.foto_url) await removerFoto(variacao.foto_url);
        setForm(f => f && ({...f,variacoes:f.variacoes.map(v => v.id === variacao.id ? {...v,foto_url:caminho} : v)}));
      } else {
        const ordem = (produtos.data?.find(p => p.id === form.id)?.produto_imagens.reduce((maior,img) => Math.max(maior,img.ordem),-1) ?? -1);
        const { error } = await supabase.from("produto_imagens").insert({produto_id:form.id,url:caminho,ordem:ordem+1});
        if (error) throw error;
      }
      caminho = undefined;
      toast.success("Foto enviada!"); recarregar();
    } catch { if(caminho) await removerFoto(caminho).catch(()=>{}); toast.error("Não foi possível enviar a foto. Use JPG, PNG ou WebP de até 10 MB."); }
    finally {setEnviando(false);}
  }

  async function excluirFoto(img: {id:string;url:string}) {
    if (!window.confirm("Remover esta foto do produto?")) return;
    const {error} = await supabase.from("produto_imagens").delete().eq("id",img.id);
    if(error){toast.error("Não foi possível remover a foto.");return;}
    await removerFoto(img.url).catch(()=>{});
    toast.success("Foto removida."); recarregar();
  }

  return (
    <AdminLayout titulo="Produtos">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto..." className="h-12 rounded-xl" />
        <Button className="h-12 rounded-xl" onClick={() => setForm({ ...vazio })}>
          <Plus className="mr-2 h-5 w-5" /> Novo produto
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {produtos.isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : !lista.length ? (
          <EmptyState titulo="Nenhum produto" descricao="Clique em “Novo produto” para cadastrar." />
        ) : (
          lista.map((p) => {
            const total = p.variacoes_cor.reduce((s, v) => s + v.estoque_atual, 0);
            return (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                {p.produto_imagens[0]?.preview && <img src={p.produto_imagens[0].preview} alt="" className="h-16 w-16 rounded-xl object-cover"/>}
                <div className="min-w-0">
                  <p className="font-semibold">{p.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.categorias?.nome ?? "Sem categoria"} · {moeda(p.preco_base)} · {total} em estoque · {p.ativo ? "Na loja" : "Escondido"}
                  </p>
                  <div className="mt-2 flex gap-1">
                    {p.variacoes_cor.map((v) => (
                      <span key={v.id} title={v.cores?.nome} className="h-5 w-5 rounded-full border" style={fundoCor(v.cores?.codigo_hex, v.cores?.codigo_hex_2)} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => abrirEdicao(p)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button variant="secondary" className="rounded-xl" onClick={() => alternar(p)}>
                    <Power className="mr-2 h-4 w-4" /> {p.ativo ? "Esconder" : "Mostrar"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          {form ? (
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input className="mt-1 h-12 rounded-xl" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Preço (R$)</Label>
                  <Input className="mt-1 h-12 rounded-xl" inputMode="decimal" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="12,90" />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <select className="mt-1 h-12 w-full rounded-xl border bg-background px-3" value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}>
                    <option value="">Escolha...</option>
                    {(categorias.data ?? []).filter((c) => c.ativo || c.id === form.categoria_id).map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea className="mt-1 rounded-xl" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div>
                <Label>Fotos do produto</Label>
                {form.id ? <><div className="mt-2 flex flex-wrap gap-2">{produtos.data?.find(p => p.id === form.id)?.produto_imagens.sort((a,b) => a.ordem-b.ordem).map(img => <div key={img.id} className="relative"><img src={img.preview ?? undefined} alt="Foto do produto" className="h-20 w-20 rounded-xl object-cover"/><Button size="sm" variant="destructive" className="mt-1 w-full" onClick={() => excluirFoto(img)}>Remover</Button></div>)}</div><Input aria-label="Adicionar fotos do produto" type="file" accept="image/*" multiple disabled={enviando} className="mt-2" onChange={async e => {for(const file of Array.from(e.target.files ?? [])) await subirFoto(file);e.target.value="";}}/><p className="text-xs text-muted-foreground">Até 10 MB por foto. A primeira foto aparece na vitrine.</p></> : <p className="mt-1 text-sm text-muted-foreground">Salve o produto primeiro para adicionar fotos.</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Cores e estoque</Label>
                  <Button type="button" size="sm" variant="outline" className="rounded-xl"
                    onClick={() => setForm({ ...form, variacoes: [...form.variacoes, { cor_id: "", estoque_atual: 0, estoque_minimo: 5 }] })}>
                    <Plus className="mr-1 h-4 w-4" /> Adicionar cor
                  </Button>
                </div>
                {!form.variacoes.length ? <p className="mt-2 text-sm text-muted-foreground">Nenhuma cor adicionada.</p> : null}
                <div className="mt-2 space-y-2">
                  {form.variacoes.map((v, i) => (
                    <div key={i} className="grid grid-cols-[1fr_70px_70px_auto] items-end gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Cor</span>
                        <select className="h-11 w-full rounded-xl border bg-background px-2" value={v.cor_id} disabled={!!v.id} onChange={(e) => setV(i, { cor_id: e.target.value })}>
                          <option value="">Escolha...</option>
                          {(cores.data ?? []).filter((c) => c.ativo || c.id === v.cor_id).map((c) => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Estoque</span>
                        <Input type="number" min={0} className="h-11 rounded-xl" value={v.estoque_atual} onChange={(e) => setV(i, { estoque_atual: Number(e.target.value) })} />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Mínimo</span>
                        <Input type="number" min={0} className="h-11 rounded-xl" value={v.estoque_minimo} onChange={(e) => setV(i, { estoque_minimo: Number(e.target.value) })} />
                      </div>
                      {!v.id ? (
                        <Button type="button" variant="ghost" size="icon" aria-label="Remover cor"
                          onClick={() => setForm({ ...form, variacoes: form.variacoes.filter((_, j) => j !== i) })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : <span className="w-9" />}
                      {v.id && <div className="col-span-full flex items-center gap-2"><span className="text-xs">Foto da cor:</span>{produtos.data?.find(p => p.id === form.id)?.variacoes_cor.find(x => x.id === v.id)?.preview && <img src={produtos.data?.find(p => p.id === form.id)?.variacoes_cor.find(x => x.id === v.id)?.preview ?? undefined} alt={`Foto da cor ${cores.data?.find(c => c.id === v.cor_id)?.nome ?? ""}`} className="h-12 w-12 rounded-lg object-cover"/>}<Input aria-label="Enviar foto da cor" type="file" accept="image/*" disabled={enviando} onChange={async e => {if(e.target.files?.[0]) await subirFoto(e.target.files[0],v);e.target.value="";}}/></div>}
                    </div>
                  ))}
                </div>
              </div>

              <Button className="h-12 w-full rounded-xl text-base" disabled={salvando} onClick={salvar}>
                {salvando ? "Salvando..." : "Salvar produto"}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
