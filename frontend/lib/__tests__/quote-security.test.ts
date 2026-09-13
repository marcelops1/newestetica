import { describe, expect, it, vi } from "vitest";
import { submitQuoteRequest, validateQuoteFields } from "../quote";

describe("validateQuoteFields (validação amigável por campo)", () => {
  it("nome com menos de 2 caracteres orienta com mensagem acolhedora", () => {
    const errors = validateQuoteFields({ name: "A", phone: "0000000000" });
    expect(errors.name).toBeTruthy();
    expect(errors.name).not.toMatch(/undefined|TypeError|stack/i);
  });

  it("nome só de espaços orienta com mensagem acolhedora", () => {
    const errors = validateQuoteFields({ name: "   ", phone: "0000000000" });
    expect(errors.name).toBeTruthy();
  });

  it("WhatsApp sem 10 dígitos orienta com mensagem acolhedora", () => {
    const errors = validateQuoteFields({
      name: "Maria Exemplo",
      phone: "(0) 0-0",
    });
    expect(errors.phone).toBeTruthy();
    expect(errors.phone).not.toMatch(/undefined|TypeError|stack/i);
  });

  it("WhatsApp com letras orienta com mensagem acolhedora", () => {
    const errors = validateQuoteFields({
      name: "Maria Exemplo",
      phone: "abcd-efgh",
    });
    expect(errors.phone).toBeTruthy();
  });

  it("campos válidos não geram erros", () => {
    const errors = validateQuoteFields({
      name: "Maria Exemplo",
      phone: "(11) 98765-4321",
    });
    expect(errors.name).toBeUndefined();
    expect(errors.phone).toBeUndefined();
  });

  it("entrada não-string em nome e WhatsApp gera erro nos dois campos", () => {
    const errors = validateQuoteFields({
      name: 123 as unknown as string,
      phone: 456 as unknown as string,
    });
    expect(errors.name).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });
});

describe("segurança de entrada (OWASP — texto nunca vira HTML)", () => {
  it("tentativa de script no nome é tratada como texto opaco", async () => {
    const result = await submitQuoteRequest({
      name: "<script>alert(1)</script>",
      phone: "0000000000",
      procedure: "Limpeza de pele",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.procedure).toBe("Limpeza de pele");
    }
  });

  it("manipulador de evento em mensagem é tratado como texto opaco", async () => {
    const result = await submitQuoteRequest({
      name: "Maria Exemplo",
      phone: "0000000000",
      procedure: "Limpeza de pele",
      message: '<img src=x onerror="alert(1)">',
    });
    expect(result.ok).toBe(true);
  });

  it("marcação HTML no nome passa pela validação de campo como texto", () => {
    const errors = validateQuoteFields({
      name: "<b>Maria</b> & 'co'",
      phone: "0000000000",
    });
    expect(errors.name).toBeUndefined();
  });

  it("aspas e & no nome não quebram a submissão", async () => {
    const result = await submitQuoteRequest({
      name: 'Maria "D\'Água" & Silva',
      phone: "0000000000",
    });
    expect(result.ok).toBe(true);
  });

  it("mensagem muito longa é aceita como texto sem travar", async () => {
    const result = await submitQuoteRequest({
      name: "Maria Exemplo",
      phone: "0000000000",
      procedure: "Limpeza de pele",
      message: "gostaria de saber ".repeat(500),
    });
    expect(result.ok).toBe(true);
  });

  it("payload com nome curto é rejeitado na fronteira da submissão", async () => {
    const result = await submitQuoteRequest({
      name: "A",
      phone: "0000000000",
      procedure: "Limpeza de pele",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.message).not.toMatch(/undefined|TypeError|stack/i);
    }
  });

  it("payload com WhatsApp malformado é rejeitado na fronteira da submissão", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await submitQuoteRequest({
      name: "Maria Exemplo",
      phone: "abcd",
      procedure: "Limpeza de pele",
    });
    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
