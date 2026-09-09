import { describe, expect, it } from "vitest";
import { getBeforeAfterPageCases } from "../before-after";
import { resultsMock } from "../mocks/results";

describe("casos da página /antes-depois", () => {
  it("nunca inclui caso sem consentimento na listagem pública", () => {
    // Garante que existe ao menos um caso sem consentimento no mock…
    expect(resultsMock.some((item) => !item.hasConsent)).toBe(true);
    // …e que ele jamais aparece nos casos da página (ex.: resultado-3).
    const cases = getBeforeAfterPageCases();
    expect(cases.length).toBeGreaterThan(0);
    expect(cases.every((item) => item.hasConsent)).toBe(true);
    expect(cases.map((item) => item.id)).not.toContain("resultado-3");
  });

  it("todo caso listado tem painel completo para exibição", () => {
    for (const item of getBeforeAfterPageCases()) {
      expect(item.title).toBeTruthy();
      expect(item.summary).toBeTruthy();
      expect(item.sessions).toBeTruthy();
      expect(item.recovery).toBeTruthy();
      expect(item.goal).toBeTruthy();
    }
  });
});
