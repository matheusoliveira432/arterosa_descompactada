/** Fundo da bolinha de cor: uma cor sólida ou metade/metade para cores duplas. */
export const fundoCor = (hex?: string | null, hex2?: string | null) => {
  const a = hex ?? "#E8A598";
  return hex2
    ? { background: `linear-gradient(135deg, ${a} 50%, ${hex2} 50%)` }
    : { backgroundColor: a };
};
