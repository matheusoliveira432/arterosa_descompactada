import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-arte-rosa.png.asset.json";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClienteDialog } from "@/components/loja/ClienteDialog";
import { useCarrinho } from "@/store/carrinho";
import { useClienteStore } from "@/store/cliente";

const links = [
  { to: "/", rotulo: "Início" },
  { to: "/produtos", rotulo: "Produtos" },
  { to: "/carrinho", rotulo: "Carrinho" },
] as const;

export function LojaLayout({ children }: { children: ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);
  const itens = useCarrinho((s) => s.itens);
  const dados = useClienteStore((s) => s.dados);
  const quantidadeTotal = itens.reduce((s, i) => s + i.quantidade, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo.url} alt="Logo Arte Rosa" className="h-12 w-12 rounded-full object-cover" />
            <span className="font-display text-xl leading-tight">
              Arte Rosa
              <span className="block text-[11px] font-sans tracking-widest text-muted-foreground">
                ARTESANATOS
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {l.rotulo}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hidden rounded-xl sm:inline-flex"
              onClick={() => setDialogAberto(true)}
            >
              <UserRound className="mr-2 h-4 w-4" aria-hidden />
              {dados ? "Meus dados" : "Identificar-se"}
            </Button>

            <Button asChild variant="secondary" className="relative rounded-xl">
              <Link to="/carrinho">
                <ShoppingBag className="mr-2 h-4 w-4" aria-hidden />
                Carrinho
                {quantidadeTotal > 0 ? (
                  <span className="ml-2 grid h-6 min-w-6 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                    {quantidadeTotal}
                  </span>
                ) : null}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl md:hidden"
              aria-label="Abrir menu"
              onClick={() => setMenuAberto((v) => !v)}
            >
              {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuAberto ? (
          <div className="border-t bg-background px-4 py-3 md:hidden">
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuAberto(false)}
                  className="rounded-xl px-3 py-3 text-base font-semibold hover:bg-secondary"
                >
                  {l.rotulo}
                </Link>
              ))}
              <button
                type="button"
                className="rounded-xl px-3 py-3 text-left text-base font-semibold hover:bg-secondary"
                onClick={() => {
                  setMenuAberto(false);
                  setDialogAberto(true);
                }}
              >
                {dados ? "Meus dados" : "Identificar-se"}
              </button>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t bg-secondary/50">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl">Arte Rosa Artesanatos</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Arranjos, laços, tiaras e kits feitos à mão, com carinho, para revenda.
            </p>
          </div>
          <div>
            <p className="font-semibold">Atendimento</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pedidos e pagamento combinados pelo WhatsApp.
            </p>
          </div>
          <div>
            <p className="font-semibold">Navegue</p>
            <div className="mt-2 flex flex-col text-sm text-muted-foreground">
              <Link to="/produtos" className="py-1 hover:text-foreground">
                Produtos
              </Link>
              <Link to="/carrinho" className="py-1 hover:text-foreground">
                Carrinho
              </Link>
            </div>
          </div>
        </div>
        <p className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Arte Rosa Artesanatos
        </p>
      </footer>

      <ClienteDialog aberto={dialogAberto} aoFechar={() => setDialogAberto(false)} />
    </div>
  );
}
