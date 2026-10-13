import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/schemas";
import { entrarComUsuario } from "@/lib/admin";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar no painel | Arte Rosa Artesanatos" },
      { name: "description", content: "Acesso restrito ao painel administrativo da Arte Rosa." },
      { property: "og:title", content: "Entrar no painel | Arte Rosa" },
      { property: "og:description", content: "Acesso restrito ao painel administrativo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginAdmin,
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginAdmin() {
  const navigate = useNavigate();
  const [entrando, setEntrando] = useState(false);
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { usuario: "", senha: "" },
  });

  const onSubmit = async (valores: LoginForm) => {
    setEntrando(true);
    try {
      await entrarComUsuario(valores.usuario, valores.senha);
      toast.success("Bem-vinda de volta!");
      navigate({ to: "/admin", replace: true });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível entrar.");
    } finally {
      setEntrando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Lock className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-2xl">Painel Arte Rosa</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre com seu usuário e senha.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="usuario">Usuário</Label>
            <Input
              id="usuario"
              autoComplete="username"
              className="mt-1 h-12 rounded-xl"
              {...form.register("usuario")}
            />
            {form.formState.errors.usuario ? (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.usuario.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              className="mt-1 h-12 rounded-xl"
              {...form.register("senha")}
            />
            {form.formState.errors.senha ? (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.senha.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl text-base"
            disabled={entrando}
          >
            {entrando ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
