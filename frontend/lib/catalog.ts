/* Busca e normalização do catálogo. Pura e sem rede. */
import type { Procedure, TreatmentCategory } from "./types";

/** Minúsculas sem diacríticos para busca tolerante a acentos e caixa. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchProcedures(
  items: Procedure[],
  query: string,
  category: TreatmentCategory | "todos",
): Procedure[] {
  const term = normalizeText(query.trim());
  return items.filter((item) => {
    const inCategory =
      category === "todos" || item.categories.includes(category);
    if (!inCategory) return false;
    if (!term) return true;
    return normalizeText(`${item.name} ${item.description}`).includes(term);
  });
}
