CREATE TABLE public.categorias_material (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.unidades_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria_material_id uuid REFERENCES public.categorias_material(id) ON DELETE RESTRICT,
  unidade_compra_id uuid REFERENCES public.unidades_compra(id) ON DELETE RESTRICT,
  conteudo_quantidade numeric(12,2) CHECK (conteudo_quantidade IS NULL OR conteudo_quantidade > 0),
  conteudo_unidade text,
  preco_compra numeric(12,2) NOT NULL DEFAULT 0 CHECK (preco_compra >= 0),
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.materiais(categoria_material_id);
CREATE INDEX ON public.materiais(unidade_compra_id);
CREATE TABLE public.produto_materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.materiais(id) ON DELETE RESTRICT,
  rendimento numeric(12,2) NOT NULL CHECK (rendimento > 0),
  UNIQUE (produto_id, material_id)
);
CREATE INDEX ON public.produto_materiais(material_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias_material, public.unidades_compra, public.materiais, public.produto_materiais TO authenticated;
GRANT ALL ON public.categorias_material, public.unidades_compra, public.materiais, public.produto_materiais TO service_role;

ALTER TABLE public.categorias_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_materiais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin categorias material" ON public.categorias_material FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin unidades compra" ON public.unidades_compra FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin materiais" ON public.materiais FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin produto materiais" ON public.produto_materiais FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());