import { describe, expect, it } from "vitest";
import { ContactInputSchema } from "./contact";

describe("contrato de ContactInput (mensagem de contato)", () => {
  it("aceita payload válido com e-mail", () => {
    const result = ContactInputSchema.safeParse({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: "Gostaria de tirar uma dúvida sobre os procedimentos.",
    });
    expect(result.success).toBe(true);
  });

  it("aceita payload válido com WhatsApp", () => {
    const result = ContactInputSchema.safeParse({
      name: "Maria Exemplo",
      contact: "(11) 98765-4321",
      message: "Prefiro conversar por WhatsApp.",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita os mesmos exemplos que o mock rejeita (espelha parseContactInput)", () => {
    const rejected = [
      { name: "Maria Exemplo", message: "Olá!" },
      { name: 123, contact: "maria@exemplo.com", message: "Olá!" },
      { name: "Maria Exemplo", contact: 42, message: "Olá!" },
      { name: "Maria Exemplo", contact: "maria@exemplo.com", message: null },
      { name: "Maria Exemplo", contact: "abcdef", message: "Olá!" },
      { name: "Maria Exemplo", contact: "maria@exemplo.com", message: "   " },
    ];
    for (const payload of rejected) {
      expect(
        ContactInputSchema.safeParse(payload).success,
        `payload rejeitado ${JSON.stringify(payload)}`,
      ).toBe(false);
    }
  });

  it("rejeita nome curto após trim e payload nulo", () => {
    expect(
      ContactInputSchema.safeParse({
        name: " A ",
        contact: "maria@exemplo.com",
        message: "Olá!",
      }).success,
    ).toBe(false);
    expect(ContactInputSchema.safeParse(null).success).toBe(false);
  });
});
