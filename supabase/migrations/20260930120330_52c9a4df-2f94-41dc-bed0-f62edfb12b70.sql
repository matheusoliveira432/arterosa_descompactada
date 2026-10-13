ALTER TABLE public.cores ADD COLUMN codigo_hex_2 text;
ALTER TABLE public.cores ADD CONSTRAINT cores_hex2_formato CHECK (codigo_hex_2 IS NULL OR codigo_hex_2 ~ '^#[0-9A-Fa-f]{6}$');