import { z } from "zod";
import { somenteDigitos } from "./format";

export const clienteSchema = z.object({
  nome: z.string().trim().min(3, "Digite o nome completo").max(120),
  whatsapp: z
    .string()
    .trim()
    .refine((v) => somenteDigitos(v).length >= 10, "Digite o WhatsApp com DDD"),
  nome_loja: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(255).optional().or(z.literal("")),
  cep: z.string().trim().refine((v) => somenteDigitos(v).length === 8, "CEP deve ter 8 números"),
  logradouro: z.string().trim().min(3, "Digite a rua").max(160),
  numero: z.string().trim().min(1, "Digite o número").max(20),
  complemento: z.string().trim().max(80).optional().or(z.literal("")),
  bairro: z.string().trim().min(2, "Digite o bairro").max(80),
  cidade: z.string().trim().min(2, "Digite a cidade").max(80),
  estado: z.string().trim().length(2, "Use a sigla, ex.: SP"),
});

export type ClienteForm = z.infer<typeof clienteSchema>;

export const loginSchema = z.object({
  usuario: z.string().trim().min(3, "Digite seu usuário").max(40),
  senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres").max(72),
});

export const emailDoUsuario = (usuario: string) =>
  `${usuario.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "")}@arterosa.app`;
