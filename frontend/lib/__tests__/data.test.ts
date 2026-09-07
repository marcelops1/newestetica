import { describe, expect, it } from "vitest";
import {
  TREATMENT_CATEGORIES,
  getAvailableSlots,
  getContactInfo,
  getPosts,
  getProcedures,
  getProceduresByCategory,
  getQuizGoals,
  getRecommendation,
  getTestimonials,
  getTreatmentOptions,
  getVisibleResults,
} from "../data";
import { resultsMock } from "../mocks/results";

describe("camada de dados mockados", () => {
  it("expõe procedimentos com os campos do contrato", () => {
    const items = getProcedures();
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.duration).toBeTruthy();
    }
  });

  it("nunca expõe resultado sem consentimento", () => {
    // Garante que existe ao menos um item sem consentimento no mock…
    expect(resultsMock.some((item) => !item.hasConsent)).toBe(true);
    // …e que ele jamais aparece no acesso público.
    const visible = getVisibleResults();
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every((item) => item.hasConsent)).toBe(true);
  });

  it("expõe somente slots disponíveis", () => {
    const slots = getAvailableSlots();
    expect(slots.every((slot) => slot.available)).toBe(true);
  });

  it("expõe depoimentos e posts com conteúdo", () => {
    expect(getTestimonials().length).toBeGreaterThan(0);
    expect(getPosts().length).toBeGreaterThan(0);
  });

  it("toda categoria de filtro possui ao menos um procedimento (abas nunca órfãs)", () => {
    for (const category of TREATMENT_CATEGORIES) {
      expect(getProceduresByCategory(category).length).toBeGreaterThan(0);
    }
  });

  it("todo objetivo do quiz possui exatamente uma recomendação", () => {
    const goals = getQuizGoals();
    expect(goals.length).toBeGreaterThan(0);
    for (const goal of goals) {
      const rec = getRecommendation(goal.id);
      expect(rec?.protocol).toBeTruthy();
      expect(rec?.description).toBeTruthy();
    }
  });

  it("retorna indefinido para objetivo inexistente", () => {
    expect(getRecommendation("inexistente")).toBeUndefined();
  });

  it("expõe opções do modal e contato visivelmente fictícios", () => {
    expect(getTreatmentOptions()).toContain("Avaliação Geral");
    const contact = getContactInfo();
    expect(contact.whatsappHref).toContain("5500000000000");
  });
});
