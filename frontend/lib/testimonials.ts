/* Depoimentos da página pública /depoimentos.
   Contrato da rota: todos os depoimentos fictícios; nomes completos reais nunca.
   Trocar mocks pela API real = alterar a camada lib/ (ver data.ts). */
import { getTestimonials } from "./data";
import type { Testimonial } from "./types";

/** Iniciais fictícias da autora (até 2 partes, sem expor nome completo real). */
export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Retorna os depoimentos exibidos em /depoimentos (sempre fictícios). */
export function getTestimonialsPageCases(): Testimonial[] {
  return getTestimonials();
}