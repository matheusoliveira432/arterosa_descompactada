import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ClienteForm } from "@/lib/schemas";

type ClienteState = {
  dados: ClienteForm | null;
  salvar: (dados: ClienteForm) => void;
  limpar: () => void;
};

export const useClienteStore = create<ClienteState>()(
  persist(
    (set) => ({
      dados: null,
      salvar: (dados) => set({ dados }),
      limpar: () => set({ dados: null }),
    }),
    { name: "arterosa-cliente" },
  ),
);
