import { Link } from "@tanstack/react-router";
import { Flower2 } from "lucide-react";

import { EstoqueBadge } from "@/components/EstoqueBadge";
import { moeda } from "@/lib/format";
import { estoqueTotal, fotoPrincipal, type ProdutoLoja } from "@/lib/loja";

export function ProdutoCard({ produto }: { produto: ProdutoLoja }) {
  const foto = fotoPrincipal(produto);
  const estoque = estoqueTotal(produto);

  return (
    <Link
      to="/produto/$id"
      params={{ id: produto.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-secondary">
        {foto ? (
          <img
            src={foto}
            alt={produto.nome}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-primary">
            <Flower2 className="h-14 w-14" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug">{produto.nome}</h3>
          <EstoqueBadge quantidade={estoque} />
        </div>
        {produto.categorias ? (
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {produto.categorias.nome}
          </p>
        ) : null}
        {produto.descricao ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{produto.descricao}</p>
        ) : null}
        <p className="mt-auto pt-2 text-lg font-bold text-foreground">
          {moeda(produto.preco_base)}
        </p>
      </div>
    </Link>
  );
}
