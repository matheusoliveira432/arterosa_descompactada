import { Badge } from "@/components/ui/badge";
import { situacaoEstoque } from "@/lib/loja";

export function EstoqueBadge({ quantidade, minimo = 5 }: { quantidade: number; minimo?: number }) {
  const situacao = situacaoEstoque(quantidade, minimo);
  if (situacao === "esgotado") {
    return (
      <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">
        Esgotado
      </Badge>
    );
  }
  if (situacao === "baixo") {
    return (
      <Badge className="bg-warning text-warning-foreground hover:bg-warning">Estoque baixo</Badge>
    );
  }
  return <Badge className="bg-success text-success-foreground hover:bg-success">Em estoque</Badge>;
}
