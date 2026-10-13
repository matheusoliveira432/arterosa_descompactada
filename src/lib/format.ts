export const moeda = (valor: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(valor ?? 0),
  );

export const numero = (valor: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(valor ?? 0));

export const dataHora = (valor: string | Date | null | undefined) => {
  if (!valor) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(valor));
};

export const dataCurta = (valor: string | Date | null | undefined) => {
  if (!valor) return "—";
  const d = typeof valor === "string" && valor.length === 10 ? new Date(valor + "T12:00:00") : new Date(valor);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(d);
};

export const somenteDigitos = (v: string) => v.replace(/\D/g, "");

export const mascaraWhatsapp = (v: string) => {
  const d = somenteDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const mascaraCep = (v: string) => {
  const d = somenteDigitos(v).slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
};

export const linkWhatsapp = (telefone: string, texto?: string) => {
  const d = somenteDigitos(telefone);
  const numeroCompleto = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${numeroCompleto}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
};

export const slugify = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const WHATSAPP_EMPRESA = "12992443207";
