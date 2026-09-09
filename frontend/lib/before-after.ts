/* Casos da página pública /antes-depois.
   Contrato da rota: somente casos COM consentimento explícito.
   Trocar mocks pela API real = alterar a camada lib/ (ver data.ts). */
import { getVisibleResults } from "./data";
import type { BeforeAfter } from "./types";

/** Retorna os casos exibidos em /antes-depois (sempre com consentimento). */
export function getBeforeAfterPageCases(): BeforeAfter[] {
  return getVisibleResults();
}
