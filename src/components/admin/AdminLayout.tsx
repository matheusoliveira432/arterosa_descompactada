import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  Tags,
  Users,
  Wallet,
  X,
} from "lucide-react";

import logo from "@/assets/logo-arte-rosa.png.asset.json";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { perfilAtual, sairDoPainel } from "@/lib/admin";

const menu = [
  { to: "/admin", rotulo: "Início", icone: LayoutDashboard },
  { to: "/admin/produtos", rotulo: "Produtos", icone: Package },
  { to: "/admin/categorias", rotulo: "Categorias", icone: Tags },
  { to: "/admin/cores", rotulo: "Cores", icone: Palette },
  { to: "/admin/estoque", rotulo: "Estoque", icone: Boxes },
  { to: "/admin/pedidos", rotulo: "Pedidos", icone: ClipboardList },
  { to: "/admin/clientes", rotulo: "Clientes", icone: Users },
  { to: "/admin/financeiro", rotulo: "Financeiro", icone: Wallet },
  { to: "/admin/kpis", rotulo: "Indicadores", icone: BarChart3 },
] as const;

export function AdminLayout({ titulo, children }: { titulo: string; children: ReactNode }) {
  const navigate = useNavigate();
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState<string>("");
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    let ativo = true;
    perfilAtual()
      .then((perfil) => {
        if (!ativo) return;
        if (!perfil) {
          navigate({ to: "/admin/login", replace: true });
          return;
        }
        setNome(perfil.nome ?? perfil.usuario);
        setCarregando(false);
      })
      .catch(() => navigate({ to: "/admin/login", replace: true }));
    return () => {
      ativo = false;
    };
  }, [navigate]);

  const sair = async () => {
    await sairDoPainel();
    navigate({ to: "/admin/login", replace: true });
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-secondary/40 p-8">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const navegacao = (
    <nav className="flex flex-col gap-1">
      {menu.map((item) => {
        const ativo = caminho === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMenuAberto(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
              ativo
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icone className="h-5 w-5" aria-hidden />
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 shrink-0 border-r bg-background p-4 lg:block">
        <img src={logo.url} alt="Logo Arte Rosa" className="mx-auto mb-2 h-24 w-24 rounded-full object-cover" />
        <p className="px-3 text-center font-display text-xl">Arte Rosa</p>
        <p className="mb-6 px-3 text-xs uppercase tracking-widest text-muted-foreground">Painel</p>
        {navegacao}
        <Button variant="ghost" className="mt-6 w-full justify-start rounded-xl" onClick={sair}>
          <LogOut className="mr-3 h-5 w-5" aria-hidden />
          Sair
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl lg:hidden"
              aria-label="Abrir menu"
              onClick={() => setMenuAberto((v) => !v)}
            >
              {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="font-display text-xl">{titulo}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">Olá, {nome}</span>
            <Button variant="outline" className="rounded-xl lg:hidden" onClick={sair}>
              Sair
            </Button>
          </div>
        </header>

        {menuAberto ? (
          <div className="border-b bg-background p-4 lg:hidden">{navegacao}</div>
        ) : null}

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
