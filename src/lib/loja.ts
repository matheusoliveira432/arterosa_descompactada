import { supabase } from "@/integrations/supabase/client";
import { urlDaFoto } from "@/lib/fotos";

export type VariacaoLoja = {
  id: string;
  estoque_atual: number;
  estoque_minimo: number;
  foto_url: string | null;
  cores: { id: string; nome: string; codigo_hex: string; codigo_hex_2: string | null } | null;
};

export type ProdutoLoja = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco_base: number;
  categoria_id: string;
  categorias: { id: string; nome: string; slug: string } | null;
  produto_imagens: { id: string; url: string; ordem: number }[];
  variacoes_cor: VariacaoLoja[];
};

const SELECT_PRODUTO = `
  id, nome, slug, descricao, preco_base, categoria_id,
  categorias ( id, nome, slug ),
  produto_imagens ( id, url, ordem ),
  variacoes_cor ( id, estoque_atual, estoque_minimo, foto_url, cores ( id, nome, codigo_hex, codigo_hex_2 ) )
`;

export async function listarProdutos(): Promise<ProdutoLoja[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select(SELECT_PRODUTO)
    .eq("ativo", true)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return Promise.all(((data ?? []) as unknown as ProdutoLoja[]).map(prepararFotos));
}

async function prepararFotos(produto: ProdutoLoja): Promise<ProdutoLoja> {
  return {
    ...produto,
    produto_imagens: await Promise.all(produto.produto_imagens.map(async (img) => ({ ...img, url: await urlDaFoto(img.url) ?? img.url }))),
    variacoes_cor: await Promise.all(produto.variacoes_cor.map(async (v) => ({ ...v, foto_url: await urlDaFoto(v.foto_url) }))),
  };
}

export async function buscarProduto(id: string): Promise<ProdutoLoja | null> {
  const { data, error } = await supabase
    .from("produtos")
    .select(SELECT_PRODUTO)
    .eq("ativo", true)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? prepararFotos(data as unknown as ProdutoLoja) : null;
}

export async function listarCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nome, slug")
    .eq("ativo", true)
    .order("nome");
  if (error) throw error;
  return data ?? [];
}

export const estoqueTotal = (p: ProdutoLoja) =>
  p.variacoes_cor.reduce((s, v) => s + v.estoque_atual, 0);

export const fotoPrincipal = (p: ProdutoLoja) =>
  p.produto_imagens?.slice().sort((a, b) => a.ordem - b.ordem)[0]?.url ??
  p.variacoes_cor.find((v) => v.foto_url)?.foto_url ??
  null;

export type SituacaoEstoque = "em_estoque" | "baixo" | "esgotado";

export const situacaoEstoque = (quantidade: number, minimo = 5): SituacaoEstoque => {
  if (quantidade <= 0) return "esgotado";
  if (quantidade <= Math.max(minimo, 5)) return "baixo";
  return "em_estoque";
};
