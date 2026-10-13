import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ItemCarrinho = {
  variacaoId: string;
  produtoId: string;
  produtoNome: string;
  corNome: string;
  corHex: string;
  fotoUrl: string | null;
  precoUnitario: number;
  quantidade: number;
};

type CarrinhoState = {
  itens: ItemCarrinho[];
  addItem: (item: ItemCarrinho) => void;
  removeItem: (variacaoId: string) => void;
  updateQuantity: (variacaoId: string, quantidade: number) => void;
  updatePrice: (variacaoId: string, preco: number) => void;
  clearCart: () => void;
};

export const useCarrinho = create<CarrinhoState>()(
  persist(
    (set) => ({
      itens: [],
      addItem: (item) =>
        set((estado) => {
          const existente = estado.itens.find((i) => i.variacaoId === item.variacaoId);
          if (existente) {
            return {
              itens: estado.itens.map((i) =>
                i.variacaoId === item.variacaoId
                  ? { ...i, quantidade: i.quantidade + item.quantidade }
                  : i,
              ),
            };
          }
          return { itens: [...estado.itens, item] };
        }),
      removeItem: (variacaoId) =>
        set((estado) => ({ itens: estado.itens.filter((i) => i.variacaoId !== variacaoId) })),
      updateQuantity: (variacaoId, quantidade) =>
        set((estado) => ({
          itens: estado.itens
            .map((i) => (i.variacaoId === variacaoId ? { ...i, quantidade } : i))
            .filter((i) => i.quantidade > 0),
        })),
      updatePrice: (variacaoId, preco) =>
        set((estado) => ({
          itens: estado.itens.map((i) =>
            i.variacaoId === variacaoId ? { ...i, precoUnitario: preco } : i,
          ),
        })),
      clearCart: () => set({ itens: [] }),
    }),
    { name: "arterosa-carrinho" },
  ),
);

export const calculateTotal = (itens: ItemCarrinho[]) =>
  itens.reduce((soma, i) => soma + i.precoUnitario * i.quantidade, 0);
