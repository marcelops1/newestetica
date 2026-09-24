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

  it.each(["123456789", "(11) 1234"])(
    "rejeita telefone sem DDD (%s — conta dígitos, não o texto bruto)",
    (phone) => {
      expect(
        BookingInputSchema.safeParse({ name: "Maria Exemplo", phone }).success,
      ).toBe(false);
    },
  );

  it("aceita telefone com exatamente 10 dígitos (limite inferior do DDD)", () => {
    expect(
      BookingInputSchema.safeParse({
        name: "Maria Exemplo",
        phone: "1234567890",
      }).success,
    ).toBe(true);
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

  it("rejeita textos acima dos limites de tamanho (defesa em profundidade)", () => {
    const base = { name: "Maria Exemplo", phone: "(00) 00000-0000" };

    expect(
      BookingInputSchema.safeParse({ ...base, name: "a".repeat(10_000) })
        .success,
    ).toBe(false);
    expect(
      BookingInputSchema.safeParse({ ...base, phone: "1".repeat(21) }).success,
    ).toBe(false);
    expect(
      BookingInputSchema.safeParse({
        ...base,
        treatment: "t".repeat(201),
      }).success,
    ).toBe(false);
    expect(
      BookingInputSchema.safeParse({ ...base, notes: "n".repeat(501) }).success,
    ).toBe(false);
  });

  it("aceita os limites exatos de tamanho (120/20/200/500)", () => {
    const result = BookingInputSchema.safeParse({
      name: "a".repeat(120),
      phone: "1".repeat(20),
      treatment: "t".repeat(200),
      notes: "n".repeat(500),
    });

    expect(result.success).toBe(true);
  });
});
