import { describe, expect, it, vi } from "vitest";
import { submitContactRequest, validateContactFields } from "../contact";

describe("validateContactFields (duas faces do campo flexível)", () => {
  it("e-mail válido não gera erro de contato", () => {
    const errors = validateContactFields({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: "Olá!",
    });
    expect(errors.contact).toBeUndefined();
    expect(errors.name).toBeUndefined();
    expect(errors.message).toBeUndefined();
  });

  it("WhatsApp válido com DDD não gera erro de contato", () => {
    const errors = validateContactFields({
      name: "Maria Exemplo",
      contact: "(11) 98765-4321",
      message: "Olá!",
    });
    expect(errors.contact).toBeUndefined();
  });

  it("texto que não é e-mail nem WhatsApp gera erro acolhedor", () => {
    const errors = validateContactFields({
      name: "Maria Exemplo",
      contact: "abcdef",
      message: "Olá!",
    });
    expect(errors.contact).toBeTruthy();
    expect(errors.contact).not.toMatch(/undefined|TypeError|stack/i);
  });

  it("WhatsApp sem DDD (menos de 10 dígitos) gera erro acolhedor", () => {
    const errors = validateContactFields({
      name: "Maria Exemplo",
      contact: "(1) 234-5678",
      message: "Olá!",
    });
    expect(errors.contact).toBeTruthy();
  });

  it("nome com menos de 2 caracteres gera erro acolhedor", () => {
    const errors = validateContactFields({
      name: "A",
      contact: "maria@exemplo.com",
      message: "Olá!",
    });
    expect(errors.name).toBeTruthy();
  });

  it("mensagem vazia gera erro acolhedor", () => {
    const errors = validateContactFields({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: "",
    });
    expect(errors.message).toBeTruthy();
  });

  it("mensagem só de espaços gera erro acolhedor", () => {
    const errors = validateContactFields({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: "   ",
    });
    expect(errors.message).toBeTruthy();
  });

  it("entrada não-string nos três campos gera erro nos três", () => {
    const errors = validateContactFields({
      name: 123 as unknown as string,
      contact: 456 as unknown as string,
      message: null as unknown as string,
    });
    expect(errors.name).toBeTruthy();
    expect(errors.contact).toBeTruthy();
    expect(errors.message).toBeTruthy();
  });
});

describe("segurança de entrada (OWASP — texto nunca vira HTML)", () => {
  it("tentativa de script no nome é tratada como texto opaco", async () => {
    const result = await submitContactRequest({
      name: "<script>alert(1)</script>",
      contact: "maria@exemplo.com",
      message: "Olá!",
    });
    expect(result.ok).toBe(true);
  });

  it("manipulador de evento em mensagem é tratado como texto opaco", async () => {
    const result = await submitContactRequest({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: '<img src=x onerror="alert(1)">',
    });
    expect(result.ok).toBe(true);
  });

  it("marcação HTML no nome passa pela validação de campo como texto", () => {
    const errors = validateContactFields({
      name: "<b>Maria</b> & 'co'",
      contact: "maria@exemplo.com",
      message: "Olá!",
    });
    expect(errors.name).toBeUndefined();
  });

  it("aspas e & na mensagem não quebram a submissão", async () => {
    const result = await submitContactRequest({
      name: "Maria Exemplo",
      contact: "(11) 98765-4321",
      message: 'Dúvida sobre "values" & procedimentos',
    });
    expect(result.ok).toBe(true);
  });

  it("mensagem muito longa é aceita como texto sem travar", async () => {
    const result = await submitContactRequest({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: "gostaria de saber ".repeat(500),
    });
    expect(result.ok).toBe(true);
  });

  it("payload com nome curto é rejeitado na fronteira da submissão", async () => {
    const result = await submitContactRequest({
      name: "A",
      contact: "maria@exemplo.com",
      message: "Olá!",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.message).not.toMatch(/undefined|TypeError|stack/i);
    }
  });

  it("payload com contato malformado é rejeitado na fronteira sem rede", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await submitContactRequest({
      name: "Maria Exemplo",
      contact: "abcd",
      message: "Olá!",
    });
    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
