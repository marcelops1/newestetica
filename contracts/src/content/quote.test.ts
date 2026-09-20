import { describe, expect, it } from "vitest";
import { treatmentOptionsMock } from "../../../frontend/lib/mocks/quiz";
import { createQuoteInputSchema } from "./quote";

const QuoteInputSchema = createQuoteInputSchema(treatmentOptionsMock);

describe("contrato de QuoteInput (solicitação de orçamento)", () => {
  it("aceita payload válido com procedimento das opções vigentes", () => {
    const result = QuoteInputSchema.safeParse({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      procedure: "Limpeza de pele",
      message: "Gostaria de saber o valor do procedimento.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.procedure).toBe("Limpeza de pele");
    }
  });

  it("aceita payload sem campos opcionais", () => {
    expect(
      QuoteInputSchema.safeParse({
        name: "Maria Exemplo",
        phone: "00000000000",
      }).success,
    ).toBe(true);
  });

  it("aceita procedimento vazio (padrão acolhedor entra depois, como no mock)", () => {
    expect(
      QuoteInputSchema.safeParse({
        name: "Maria Exemplo",
        phone: "(00) 00000-0000",
        procedure: "   ",
      }).success,
    ).toBe(true);
  });

  it("rejeita procedimento desconhecido (espelha parseQuoteInput)", () => {
    expect(
      QuoteInputSchema.safeParse({
        name: "Maria Exemplo",
        phone: "(00) 00000-0000",
        procedure: "Procedimento Inventado",
      }).success,
    ).toBe(false);
  });

  it("rejeita nome curto e telefone sem DDD", () => {
    expect(
      QuoteInputSchema.safeParse({ name: " A ", phone: "(00) 00000-0000" })
        .success,
    ).toBe(false);
    expect(
      QuoteInputSchema.safeParse({ name: "Maria Exemplo", phone: "123456789" })
        .success,
    ).toBe(false);
  });

  it("rejeita tipos errados, campos não-string e payload nulo", () => {
    const rejected = [
      { name: 123, phone: "(00) 00000-0000" },
      { name: "Maria Exemplo", phone: 42 },
      { name: "Maria Exemplo", phone: "(00) 00000-0000", procedure: 42 },
      { name: "Maria Exemplo", phone: "(00) 00000-0000", message: 123 },
      null,
    ];
    for (const payload of rejected) {
      expect(QuoteInputSchema.safeParse(payload).success).toBe(false);
    }
  });
});
