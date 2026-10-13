import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MessageCircle, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyState";
import { LojaLayout } from "@/components/loja/LojaLayout";
import { ClienteDialog } from "@/components/loja/ClienteDialog";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_EMPRESA, linkWhatsapp, moeda, somenteDigitos } from "@/lib/format";
import { calculateTotal, useCarrinho } from "@/store/carrinho";
import { useClienteStore } from "@/store/cliente";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido | Arte Rosa Artesanatos" },
      { name: "description", content: "Confirme seus dados e envie o pedido pelo WhatsApp." },
      { property: "og:title", content: "Finalizar pedido | Arte Rosa Artesanatos" },
      { property: "og:description", content: "Confirme seus dados e envie o pedido pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

type RespostaPedido = { pedido_id: string; numero: number; total: number };

function Checkout() {
  const navigate = useNavigate();
  const itens = useCarrinho((s) => s.itens);
  const clearCart = useCarrinho((s) => s.clearCart);
  const dados = useClienteStore((s) => s.dados);
  const [observacoes, setObservacoes] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const total = calculateTotal(itens);

  const enderecoTexto = dados
    ? `${dados.logradouro}, ${dados.numero}${dados.complemento ? ` - ${dados.complemento}` : ""} - ${dados.bairro}, ${dados.cidade}/${dados.estado} - CEP ${dados.cep}`
    : "";

  const enviar = async () => {
    if (!dados) {
      setDialogAberto(true);
      toast.error("Preencha seus dados antes de enviar o pedido.");
      return;
    }
    if (itens.length === 0) return;

    setEnviando(true);
    const { data, error } = await supabase.rpc("criar_pedido", {
      p_cliente: {
        nome: dados.nome,
        whatsapp: somenteDigitos(dados.whatsapp),
        nome_loja: dados.nome_loja ?? "",
        email: dados.email ?? "",
      },
      p_endereco: {
        cep: somenteDigitos(dados.cep),
        logradouro: dados.logradouro,
        numero: dados.numero,
        complemento: dados.complemento ?? "",
        bairro: dados.bairro,
        cidade: dados.cidade,
        estado: dados.estado,
      },
      p_itens: itens.map((i) => ({ variacao_cor_id: i.variacaoId, quantidade: i.quantidade })),
      p_observacoes: observacoes,
    });
    setEnviando(false);

    if (error || !data) {
      toast.error(
        error?.message?.includes("Estoque insuficiente")
          ? "Algum item ficou sem estoque. Volte ao carrinho e ajuste a quantidade."
          : "Não conseguimos registrar seu pedido agora. Tente de novo em instantes.",
      );
      return;
    }

    const pedido = data as unknown as RespostaPedido;

    const linhas = itens
      .map(
        (i) =>
          `- ${i.quantidade}x ${i.produtoNome} (Cor: ${i.corNome}) - ${moeda(i.precoUnitario * i.quantidade)}`,
      )
      .join("\n");

    const mensagem = [
      `*Novo Pedido - ArteRosa* (#${pedido.numero})`,
      "",
      `*Cliente:* ${dados.nome}`,
      `*Tel:* ${dados.whatsapp}`,
      `*End:* ${enderecoTexto}`,
      `*Loja:* ${dados.nome_loja || "—"}`,
      "",
      "*Itens:*",
      linhas,
      "",
      `*Total:* ${moeda(pedido.total)}`,
      observacoes ? `\n*Observações:* ${observacoes}` : "",
      "",
      "_Pagamento a combinar pelo WhatsApp._",
    ].join("\n");

    clearCart();
    toast.success(`Pedido #${pedido.numero} registrado! Abrindo o WhatsApp...`);
    window.open(linkWhatsapp(WHATSAPP_EMPRESA, mensagem), "_blank", "noopener");
    navigate({ to: "/" });
  };

  if (itens.length === 0) {
    return (
      <LojaLayout>
        <div className="mx-auto w-full max-w-3xl px-4 py-16">
          <EmptyState
            titulo="Nenhum item para finalizar"
            descricao="Adicione produtos ao carrinho para enviar um pedido."
            acao={
              <Button asChild size="lg" className="rounded-xl">
                <Link to="/produtos">Ver produtos</Link>
              </Button>
            }
          />
        </div>
      </LojaLayout>
    );
  }

  return (
    <LojaLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl">Finalizar pedido</h1>
        <p className="mt-2 text-muted-foreground">
          Confira tudo antes de enviar. O pagamento é combinado na conversa do WhatsApp.
        </p>

        <section className="mt-8 rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold">Seus dados</h2>
            <Button variant="ghost" className="rounded-xl" onClick={() => setDialogAberto(true)}>
              <Pencil className="mr-2 h-4 w-4" aria-hidden />
              {dados ? "Alterar" : "Preencher"}
            </Button>
          </div>
          {dados ? (
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p className="text-base font-medium text-foreground">{dados.nome}</p>
              <p>WhatsApp: {dados.whatsapp}</p>
              {dados.nome_loja ? <p>Loja: {dados.nome_loja}</p> : null}
              {dados.email ? <p>E-mail: {dados.email}</p> : null}
              <p>{enderecoTexto}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Ainda não temos seus dados. Toque em “Preencher” para cadastrar.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-semibold">Itens do pedido</h2>
          <ul className="mt-3 divide-y">
            {itens.map((i) => (
              <li key={i.variacaoId} className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm">
                  {i.quantidade}x {i.produtoNome}{" "}
                  <span className="text-muted-foreground">(Cor: {i.corNome})</span>
                </span>
                <span className="font-semibold">{moeda(i.precoUnitario * i.quantidade)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="font-display text-2xl">{moeda(total)}</span>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]">
          <label htmlFor="observacoes" className="text-lg font-semibold">
            Observações (opcional)
          </label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value.slice(0, 500))}
            placeholder="Ex.: preciso para o dia 20, prefiro tons claros..."
            className="mt-3 min-h-28 rounded-xl"
          />
        </section>

        <Button
          size="lg"
          className="mt-8 h-14 w-full rounded-xl text-base"
          onClick={enviar}
          disabled={enviando}
        >
          <MessageCircle className="mr-2 h-5 w-5" aria-hidden />
          {enviando ? "Registrando seu pedido..." : "Enviar pedido pelo WhatsApp"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          O WhatsApp só abre depois que o pedido é salvo com segurança.
        </p>
      </div>

      <ClienteDialog aberto={dialogAberto} aoFechar={() => setDialogAberto(false)} />
    </LojaLayout>
  );
}
