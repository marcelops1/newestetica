import { describe, expect, it } from "vitest";
import { BookingInputSchema } from "./booking";

describe("contrato de BookingInput (solicitação de agendamento)", () => {
  it("aceita solicitação válida com tratamento e observações (payload do modal)", () => {
    const result = BookingInputSchema.safeParse({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      treatment: "Limpeza de pele",
      notes: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Maria Exemplo");
      expect(result.data.treatment).toBe("Limpeza de pele");
    }
  });

  it("aceita solicitação sem campos opcionais", () => {
    expect(
      BookingInputSchema.safeParse({
        name: "Maria Exemplo",
        phone: "00000000000",
      }).success,
    ).toBe(true);
  });

  it("rejeita nome com menos de 2 caracteres após trim (mesma regra do mock de orçamento)", () => {
    expect(
      BookingInputSchema.safeParse({
        name: " A ",
        phone: "(00) 00000-0000",
      }).success,
    ).toBe(false);
  });

  it("rejeita telefone sem DDD (menos de 10 dígitos)", () => {
    expect(
      BookingInputSchema.safeParse({
        name: "Maria Exemplo",
        phone: "123456789",
      }).success,
    ).toBe(false);
  });

  it("rejeita tipos errados e payload nulo", () => {
    expect(
      BookingInputSchema.safeParse({
        name: 123,
        phone: "(00) 00000-0000",
      }).success,
    ).toBe(false);
    expect(
      BookingInputSchema.safeParse({ name: "Maria Exemplo", phone: 42 })
        .success,
    ).toBe(false);
    expect(
      BookingInputSchema.safeParse({
        name: "Maria Exemplo",
        phone: "(00) 00000-0000",
        notes: 42,
      }).success,
    ).toBe(false);
    expect(BookingInputSchema.safeParse(null).success).toBe(false);
  });

  it("aceita tratamento como texto livre opcional (pré-seleção resolvida antes do envio)", () => {
    expect(
      BookingInputSchema.safeParse({
        name: "Maria Exemplo",
        phone: "(00) 00000-0000",
        treatment: "Avaliação Geral",
      }).success,
    ).toBe(true);
  });
});
