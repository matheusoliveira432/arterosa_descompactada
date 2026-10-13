import { supabase } from "@/integrations/supabase/client";
import { emailDoUsuario } from "@/lib/schemas";

export async function entrarComUsuario(usuario: string, senha: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailDoUsuario(usuario),
    password: senha,
  });
  if (error) throw new Error("Usuário ou senha incorretos.");

  const { data: ehAdmin, error: erroAdmin } = await supabase.rpc("is_admin");
  if (erroAdmin || !ehAdmin) {
    await supabase.auth.signOut();
    throw new Error("Este acesso não tem permissão para entrar no painel.");
  }
  return true;
}

export async function sairDoPainel() {
  await supabase.auth.signOut();
}

export async function perfilAtual() {
  const { data: sessao } = await supabase.auth.getUser();
  if (!sessao.user) return null;
  const { data } = await supabase
    .from("perfis_admin")
    .select("user_id, usuario, nome, papel")
    .eq("user_id", sessao.user.id)
    .maybeSingle();
  return data ?? null;
}
