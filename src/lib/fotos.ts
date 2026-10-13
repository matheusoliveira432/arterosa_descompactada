import { supabase } from "@/integrations/supabase/client";

const bucket = "produtos-midia";

export async function urlDaFoto(caminho: string | null | undefined) {
  if (!caminho) return null;
  if (/^https?:\/\//.test(caminho)) return caminho;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(caminho, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function enviarFoto(arquivo: File, produtoId: string) {
  if (!arquivo.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  if (arquivo.size > 10 * 1024 * 1024) throw new Error("A foto deve ter até 10 MB.");
  const imagem = await createImageBitmap(arquivo);
  const fator = Math.min(1, 1600 / Math.max(imagem.width, imagem.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(imagem.width * fator);
  canvas.height = Math.round(imagem.height * fator);
  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("Não foi possível preparar a foto.");
  contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  imagem.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((valor) => valor ? resolve(valor) : reject(new Error("Não foi possível preparar a foto.")), "image/jpeg", 0.82));
  const caminho = `${produtoId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(bucket).upload(caminho, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return caminho;
}

export async function removerFoto(caminho: string) {
  if (/^https?:\/\//.test(caminho)) return;
  const { error } = await supabase.storage.from(bucket).remove([caminho]);
  if (error) throw error;
}
