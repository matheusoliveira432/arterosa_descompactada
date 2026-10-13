import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { moeda } from "@/lib/format";

export const Route = createFileRoute("/admin/kpis")({ ssr: false, head: () => ({ meta: [ { title: "Indicadores | Painel Arte Rosa" }, { name: "description", content: "Vendas, clientes e resultados da Arte Rosa." }, { property: "og:title", content: "Indicadores | Painel Arte Rosa" }, { property: "og:description", content: "Vendas, clientes e resultados da Arte Rosa." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" } ] }), component: Pagina });
const mesAtual = () => new Date().toLocaleDateString("en-CA",{timeZone:"America/Sao_Paulo"}).slice(0,7);
function Pagina() {
  const qc = useQueryClient(); const [mes, setMes] = useState(mesAtual()); const [metricas, setMetricas] = useState({visitas_perfil:"0", alcance:"0", visualizacoes:"0", interacoes:"0"});
  const {data, isLoading, error} = useQuery({queryKey:["admin-kpis",mes],queryFn:async () => {
    const [pedidos, itens, clientes, transacoes, insta] = await Promise.all([
      supabase.from("pedidos").select("id,cliente_id,criado_em,valor_total,status"),
      supabase.from("itens_pedido").select("quantidade,produto_id,produtos(nome),pedidos(criado_em,status)"),
      supabase.from("clientes").select("id,nome"),
      supabase.from("transacoes_financeiras").select("tipo,valor,status_pagamento,data_transacao,data_pagamento,data_vencimento"),
      supabase.from("instagram_metricas").select("id,visitas_perfil,alcance,visualizacoes,interacoes").eq("ano",Number(mes.slice(0,4))).eq("mes",Number(mes.slice(5,7))).maybeSingle(),
    ]);
    const falha = [pedidos.error,itens.error,clientes.error,transacoes.error,insta.error].find(Boolean); if(falha) throw falha;
    return {pedidos:pedidos.data ?? [],itens:itens.data ?? [],clientes:clientes.data ?? [],transacoes:transacoes.data ?? [],insta:insta.data};
  }});
  useEffect(() => {
    setMetricas({visitas_perfil:String(data?.insta?.visitas_perfil ?? 0), alcance:String(data?.insta?.alcance ?? 0), visualizacoes:String(data?.insta?.visualizacoes ?? 0), interacoes:String(data?.insta?.interacoes ?? 0)});
  }, [data?.insta,mes]);
  const pedidos = (data?.pedidos ?? []).filter(p => p.criado_em.startsWith(mes) && p.status !== "cancelado");
  const tx = (data?.transacoes ?? []).filter(t => t.data_transacao.startsWith(mes) && t.status_pagamento !== "cancelado");
  const faturamento = pedidos.reduce((s,p) => s + Number(p.valor_total),0);
  const despesas = tx.filter(t => t.tipo === "saida").reduce((s,t) => s + Number(t.valor),0);
  const caixa = (data?.transacoes ?? []).filter(t => t.status_pagamento === "pago" && t.data_pagamento?.startsWith(mes)).reduce((s,t) => s + (t.tipo === "entrada" ? 1 : -1) * Number(t.valor),0);
  const inadimplencia = (data?.transacoes ?? []).filter(t => t.tipo === "entrada" && t.status_pagamento === "pendente" && t.data_vencimento && t.data_vencimento < new Date().toISOString().slice(0,10)).reduce((s,t) => s + Number(t.valor),0);
  const top = Object.values((data?.itens ?? []).filter(i => i.pedidos?.criado_em.startsWith(mes) && i.pedidos.status !== "cancelado").reduce<Record<string,{nome:string,quantidade:number}>>((acc,i) => {const id=i.produto_id;const item=acc[id] ?? {nome:i.produtos?.nome ?? "Produto",quantidade:0};item.quantidade+=i.quantidade;acc[id]=item;return acc;},{})).sort((a,b)=>b.quantidade-a.quantidade).slice(0,5);
  const ranking = Object.values(pedidos.reduce<Record<string,{id:string,nome:string,total:number,pedidos:number}>>((acc,p) => {const item=acc[p.cliente_id] ?? {id:p.cliente_id,nome:data?.clientes.find(c=>c.id===p.cliente_id)?.nome ?? "Cliente",total:0,pedidos:0};item.total+=Number(p.valor_total);item.pedidos++;acc[p.cliente_id]=item;return acc;},{})).sort((a,b)=>b.total-a.total).slice(0,5);
  async function salvarInstagram() {
    const valores = Object.fromEntries(Object.entries(metricas).map(([k,v])=>[k,Math.max(0,Number(v) || 0)]));
    const {error} = await supabase.from("instagram_metricas").upsert({mes:Number(mes.slice(5,7)),ano:Number(mes.slice(0,4)),...valores},{onConflict:"mes,ano"});
    if(error){toast.error("Não foi possível salvar as métricas.");return;}toast.success("Métricas salvas!");qc.invalidateQueries({queryKey:["admin-kpis"]});
  }
  return <AdminLayout titulo="Indicadores"><Input aria-label="Mês dos indicadores" type="month" value={mes} onChange={e => setMes(e.target.value)} className="mb-6 w-44"/>{error ? <p role="alert">Não foi possível carregar os indicadores.</p> : isLoading ? <p>Carregando indicadores...</p> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Pedidos",String(pedidos.length)],["Vendas",moeda(faturamento)],["Despesas",moeda(despesas)],["Margem",faturamento ? `${(((faturamento-despesas)/faturamento)*100).toFixed(1)}%` : "—"],["Lucro estimado",moeda(faturamento-despesas)],["Fluxo de caixa",moeda(caixa)],["Em atraso",moeda(inadimplencia)],["Clientes compradores",String(new Set(pedidos.map(p=>p.cliente_id)).size)]].map(([label,value])=><div key={label} className="border-b py-4"><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>)}</div><div className="mt-8 grid gap-8 lg:grid-cols-2"><section><h2 className="mb-4 text-lg font-semibold">Produtos mais vendidos</h2>{top.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={top} layout="vertical" margin={{left:10,right:20}}><CartesianGrid strokeDasharray="3 3"/><XAxis type="number"/><YAxis dataKey="nome" type="category" width={105} tick={{fontSize:11}}/><Tooltip/><Bar dataKey="quantidade" fill="var(--color-chart-1)" name="Unidades"/></BarChart></ResponsiveContainer></div> : <p className="text-muted-foreground">Sem vendas neste mês.</p>}</section><section><h2 className="mb-4 text-lg font-semibold">Vendas e despesas</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{nome:"Mês",vendas:faturamento,despesas}]}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="nome"/><YAxis/><Tooltip formatter={value=>moeda(Number(value))}/><Legend/><Bar dataKey="vendas" fill="var(--color-chart-1)"/><Bar dataKey="despesas" fill="var(--color-chart-2)"/></BarChart></ResponsiveContainer></div></section></div><section className="mt-8"><h2 className="mb-3 text-lg font-semibold">Clientes que mais compraram</h2>{ranking.length ? ranking.map((c,i)=><div key={c.id} className="flex justify-between border-b py-2"><span>{i+1}. {c.nome} · {c.pedidos} pedidos</span><strong>{moeda(c.total)}</strong></div>) : <p className="text-muted-foreground">Sem compras neste mês.</p>}</section><section className="mt-8"><h2 className="mb-3 text-lg font-semibold">Instagram · {mes}</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{([ ["visitas_perfil","Visitas ao perfil"],["alcance","Alcance"],["visualizacoes","Visualizações"],["interacoes","Interações"] ] as const).map(([campo,rotulo])=><label key={campo} className="block text-sm">{rotulo}<Input type="number" min="0" value={metricas[campo]} onChange={e=>setMetricas({...metricas,[campo]:e.target.value})}/></label>)}</div><Button className="mt-4" onClick={salvarInstagram}>Salvar métricas</Button></section></>}</AdminLayout>;
}
