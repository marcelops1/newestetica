import { describe, expect, it } from "vitest";
import { resultsMock } from "../../../frontend/lib/mocks/results";
import {
  BeforeAfterSchema,
  PublicBeforeAfterListSchema,
  PublicBeforeAfterSchema,
  selectPublicResults,
} from "./before-after";

describe("consentimento nos casos de antes/depois (regra de domínio)", () => {
  it("o mock contém ao menos um caso sem consentimento — base da prova", () => {
    expect(resultsMock.some((item) => !item.hasConsent)).toBe(true);
  });

  it("a listagem pública nunca inclui caso sem consentimento", () => {
    const publicCases = selectPublicResults(resultsMock);
    expect(publicCases.length).toBeGreaterThan(0);
    expect(publicCases.every((item) => item.hasConsent)).toBe(true);
    expect(publicCases.map((item) => item.id)).not.toContain("resultado-3");
  });

  it("todo item da listagem pública passa no contrato público e na lista", () => {
    const publicCases = selectPublicResults(resultsMock);
    for (const item of publicCases) {
      const result = PublicBeforeAfterSchema.safeParse(item);
      expect(result.success, `caso público ${item.id}`).toBe(true);
    }
    expect(PublicBeforeAfterListSchema.safeParse(publicCases).success).toBe(
      true,
    );
  });

  it("o consentimento é campo obrigatório — ausente ou não-booleano reprova", () => {
    const withoutConsentField = {
      id: "resultado-sem-consentimento",
      title: "Caso fictício",
      summary: "Resumo fictício.",
      sessions: "1 sessão",
      recovery: "Imediato",
      goal: "Firmeza",
    };
    expect(BeforeAfterSchema.safeParse(withoutConsentField).success).toBe(false);
    expect(
      BeforeAfterSchema.safeParse({
        ...withoutConsentField,
        hasConsent: "sim",
      }).success,
    ).toBe(false);
  });

  it("o contrato público rejeita caso com consentimento falso", () => {
    const base = resultsMock[0];
    expect(
      PublicBeforeAfterSchema.safeParse({ ...base, hasConsent: true }).success,
    ).toBe(true);
    expect(
      PublicBeforeAfterSchema.safeParse({ ...base, hasConsent: false }).success,
    ).toBe(false);
    expect(
      PublicBeforeAfterListSchema.safeParse([
        { ...base, hasConsent: true },
        { ...base, hasConsent: false },
      ]).success,
    ).toBe(false);
  });

  it("todo caso com consentimento do mock é compatível com o contrato", () => {
    for (const item of resultsMock.filter((entry) => entry.hasConsent)) {
      const result = BeforeAfterSchema.safeParse(item);
      expect(result.success, `caso mockado ${item.id}`).toBe(true);
    }
  });
});
