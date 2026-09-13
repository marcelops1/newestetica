/* Busca do blog. Pura e sem rede. A query é tratada como texto puro
   (normalizada, sem interpretação de marcação) — mesmo padrão do catálogo. */
import { normalizeText } from "./catalog";
import type { Post } from "./types";

export function searchPosts(
  items: Post[],
  query: string,
  category: string | "todos",
): Post[] {
  const term = normalizeText(query.trim());
  return items.filter((item) => {
    const inCategory = category === "todos" || item.category === category;
    if (!inCategory) return false;
    if (!term) return true;
    return normalizeText(`${item.title} ${item.excerpt}`).includes(term);
  });
}

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Data ISO (AAAA-MM-DD) em formato legível e determinístico (pt-BR); inválida volta crua. */
export function formatDateBR(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return iso;
  }
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return iso;
  }
  return `${day} de ${MONTHS[month - 1]} de ${match[1]}`;
}
