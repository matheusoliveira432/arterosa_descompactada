import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Flower2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { LojaLayout } from "@/components/loja/LojaLayout";
import { supabase } from "@/integrations/supabase/client";
import { moeda } from "@/lib/format";
import { calculateTotal, useCarrinho } from "@/store/carrinho";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho | Arte Rosa Artesanatos" },
      { name: "description", content: "Revise as peças escolhidas antes de enviar seu pedido." },
      { property: "og:title", content: "Carrinho | Arte Rosa Artesanatos" },
      { property: "og:description", content: "Revise as peças escolhidas antes de enviar o pedido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const navigate = useNavigate();
  const itens = useCarrinho((s) => s.itens);
  const removeItem = useCarrinho((s) => s.removeItem);
  const updateQuantity = useCarrinho((s) => s.updateQuantity);
  const updatePrice = useCarrinho((s) => s.updatePrice);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    const conferir = async () => {
      const atuais = useCarrinho.getState().itens;
      if (atuais.length === 0) return;
      setVerificando(true);
      const { data, error } = await supabase.rpc("revalidar_carrinho", {
        p_variacoes: atuais.map((i) => i.variacaoId),
      });
      if (cancelado) return;
      setVerificando(false);
      if (error || !data) return;
      let avisou = false;
      for (const item of atuais) {
        const atual = data.find((d) => d.variacao_cor_id === item.variacaoId);
        if (!atual || !atual.disponivel || atual.estoque <= 0) {
          removeItem(item.variacaoId);
          avisou = true;
          continue;
        }
        if (Number(atual.preco) !== item.precoUnitario) {
          updatePrice(item.variacaoId, Number(atual.preco));
          avisou = true;
        }
        if (item.quantidade > atual.estoque) {
          updateQuantity(item.variacaoId, atual.estoque);
          avisou = true;
        }
      }
      if (avisou) toast.info("Atualizamos seu carrinho com os preços e o estoque de agora.");
    };
    void conferir();
    return () => {
      cancelado = true;
    };
  }, [removeItem, updatePrice, updateQuantity]);

  const total = calculateTotal(itens);

  return (
    <LojaLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl">Meu carrinho</h1>
        {verificando ? (
          <p className="mt-2 text-sm text-muted-foreground">Conferindo preços e estoque...</p>
        ) : null}

        {itens.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              titulo="Seu carrinho está vazio"
              descricao="Escolha suas peças favoritas e volte aqui para finalizar."
              acao={
                <Button asChild size="lg" className="rounded-xl">
                  <Link to="/produtos">Ver produtos</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-4">
              {itens.map((item) => (
                <div
                  key={item.variacaoId}
                  className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    {item.fotoUrl ? (
                      <img
                        src={item.fotoUrl}
                        alt={item.produtoNome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-primary">
                        <Flower2 className="h-8 w-8" aria-hidden />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{item.produtoNome}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: item.corHex }}
                        aria-hidden
                      />
                      Cor: {item.corNome}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {moeda(item.precoUnitario)} cada
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      aria-label="Diminuir"
                      onClick={() => updateQuantity(item.variacaoId, item.quantidade - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center text-lg font-semibold">
                      {item.quantidade}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      aria-label="Aumentar"
                      onClick={() => updateQuantity(item.variacaoId, item.quantidade + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:w-40 sm:justify-end">
                    <p className="text-lg font-bold">
                      {moeda(item.precoUnitario * item.quantidade)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-destructive"
                      aria-label={`Remover ${item.produtoNome}`}
                      onClick={() => removeItem(item.variacaoId)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border bg-secondary/50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total do pedido</span>
                <span className="font-display text-3xl">{moeda(total)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                O frete e a forma de pagamento são combinados pelo WhatsApp.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-14 flex-1 rounded-xl text-base"
                  onClick={() => navigate({ to: "/checkout" })}
                >
                  Finalizar pedido
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 rounded-xl text-base">
                  <Link to="/produtos">Continuar comprando</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </LojaLayout>
  );
}
