import { describe, expect, it } from "vitest";
import { FinanceSummaryQuerySchema, FinanceSummarySchema } from "./finance";

/* Contrato desenhado do zero (design decisão 2): janela obrigatória com teto de 366
   dias (bound de varredura) e resumo sem PII por construção (sem campo para vazar). */

const validWindow = {
  from: "2026-09-01",
  to: "2026-09-30",
};

const validSummary = {
  from: "2026-09-01",
  to: "2026-09-30",
  currency: "BRL",
  totalCents: 45_000,
  count: 3,
};

describe("contrato da consulta de resumo (FinanceSummaryQuery)", () => {
  it("aceita janela válida e preserva from/to", () => {
    const result = FinanceSummaryQuerySchema.safeParse(validWindow);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validWindow);
    }
  });

  it("aceita a fronteira de 366 dias e rejeita 367", () => {
    expect(
      FinanceSummaryQuerySchema.safeParse({
        from: "2026-01-01",
        to: "2027-01-02",
      }).success,
    ).toBe(true);
    expect(
      FinanceSummaryQuerySchema.safeParse({
        from: "2026-01-01",
        to: "2027-01-03",
      }).success,
    ).toBe(false);
  });

  it("rejeita janela ausente, malformada ou invertida", () => {
    expect(FinanceSummaryQuerySchema.safeParse({}).success).toBe(false);
    expect(
      FinanceSummaryQuerySchema.safeParse({ from: "2026-09-01" }).success,
    ).toBe(false);
    expect(
      FinanceSummaryQuerySchema.safeParse({ to: "2026-09-30" }).success,
    ).toBe(false);
    expect(
      FinanceSummaryQuerySchema.safeParse({
        from: "01/09/2026",
        to: "2026-09-30",
      }).success,
    ).toBe(false);
    expect(
      FinanceSummaryQuerySchema.safeParse({
        from: "2026-02-30",
        to: "2026-09-30",
      }).success,
    ).toBe(false);
    expect(
      FinanceSummaryQuerySchema.safeParse({
        from: "2026-12-31",
        to: "2026-01-01",
      }).success,
    ).toBe(false);
  });

  /* Caracterização (comportamento já existente; sem RED): a issue aponta o campo e
     traz a mensagem da regra — é o que a fronteira HTTP devolve ao cliente. */
  it("janela invertida reprova apontando from, com a mensagem da regra", () => {
    const result = FinanceSummaryQuerySchema.safeParse({
      from: "2026-12-31",
      to: "2026-01-01",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("posterior");
      expect(result.error.issues[0]?.path).toEqual(["from"]);
    }
  });

  it("span acima do teto reprova apontando to, com a mensagem da regra", () => {
    const result = FinanceSummaryQuerySchema.safeParse({
      from: "2026-01-01",
      to: "2027-01-03",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("exceder");
      expect(result.error.issues[0]?.path).toEqual(["to"]);
    }
  });

  it("aceita janela de um único dia (from = to)", () => {
    expect(
      FinanceSummaryQuerySchema.safeParse({
        from: "2026-09-10",
        to: "2026-09-10",
      }).success,
    ).toBe(true);
  });
});

describe("contrato do resumo financeiro (FinanceSummary)", () => {
  it("aceita resumo íntegro com janela, BRL, total e contagem", () => {
    const result = FinanceSummarySchema.safeParse(validSummary);

    expect(result.success).toBe(true);
  });

  it("rejeita moeda diferente de BRL e campos ausentes ou negativos", () => {
    expect(
      FinanceSummarySchema.safeParse({ ...validSummary, currency: "USD" })
        .success,
    ).toBe(false);
    for (const field of [
      "from",
      "to",
      "currency",
      "totalCents",
      "count",
    ] as const) {
      const withoutField: Record<string, unknown> = { ...validSummary };
      delete withoutField[field];
      expect(
        FinanceSummarySchema.safeParse(withoutField).success,
        `campo ${field} ausente deveria reprovar`,
      ).toBe(false);
    }
    expect(
      FinanceSummarySchema.safeParse({ ...validSummary, totalCents: -1 })
        .success,
    ).toBe(false);
    expect(
      FinanceSummarySchema.safeParse({ ...validSummary, count: 1.5 }).success,
    ).toBe(false);
  });

  it("ignora sem efeito PII/breakdown desconhecidos (stripping padrão do Zod)", () => {
    const result = FinanceSummarySchema.safeParse({
      ...validSummary,
      patientId: "00000000-0000-4000-8000-000000000101",
      patientName: "Paciente Fictícia Ilustrativa",
      breakdown: [{ patientId: "x", totalCents: 1 }],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data).sort()).toEqual([
        "count",
        "currency",
        "from",
        "to",
        "totalCents",
      ]);
    }
  });
});
