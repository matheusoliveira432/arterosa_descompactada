import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

export function EmptyState({
  titulo,
  descricao,
  acao,
  icone,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  icone?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-secondary/40 px-6 py-14 text-center">
      <div className="mb-3 text-muted-foreground">
        {icone ?? <PackageOpen className="h-10 w-10" aria-hidden />}
      </div>
      <h3 className="text-lg font-semibold">{titulo}</h3>
      {descricao ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descricao}</p> : null}
      {acao ? <div className="mt-5">{acao}</div> : null}
    </div>
  );
}
