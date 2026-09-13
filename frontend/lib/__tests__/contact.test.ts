import { describe, expect, it, vi } from "vitest";
import { parseContactInput, submitContactRequest } from "../contact";

describe("parseContactInput (contrato da fronteira UI ↔ submissão mockada)", () => {
  it("payload válido com e-mail passa no schema", () => {
    const parsed = parseContactInput({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: "Gostaria de tirar uma dúvida sobre os procedimentos.",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.input.name).toBe("Maria Exemplo");
      expect(parsed.input.contact).toBe("maria@exemplo.com");
      expect(parsed.input.message).toBe(
        "Gostaria de tirar uma dúvida sobre os procedimentos.",
      );
    }
  });

  it("payload válido com WhatsApp passa no schema", () => {
    const parsed = parseContactInput({
      name: "Maria Exemplo",
      contact: "(11) 98765-4321",
      message: "Prefiro conversar por WhatsApp.",
    });
    expect(parsed.ok).toBe(true);
  });

  it("campo contato ausente retorna erro acolhedor sem vazar detalhes internos", () => {
    const parsed = parseContactInput({
      name: "Maria Exemplo",
      message: "Olá!",
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.message.length).toBeGreaterThan(0);
      expect(parsed.message).not.toMatch(/undefined|TypeError|stack|schema/i);
    }
  });

  it("tipo errado em name retorna erro acolhedor", () => {
    const parsed = parseContactInput({
      name: 123 as unknown as string,
      contact: "maria@exemplo.com",
      message: "Olá!",
    });
    expect(parsed.ok).toBe(false);
  });

  it("tipo errado em contact retorna erro acolhedor", () => {
    const parsed = parseContactInput({
      name: "Maria Exemplo",
      contact: 42 as unknown as string,
      message: "Olá!",
    });
    expect(parsed.ok).toBe(false);
  });

  it("tipo errado em message retorna erro acolhedor", () => {
    const parsed = parseContactInput({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: null as unknown as string,
    });
    expect(parsed.ok).toBe(false);
  });

  it("entrada nula retorna erro acolhedor", () => {
    expect(parseContactInput(null).ok).toBe(false);
  });

  it("contato fora dos dois formatos é rejeitado pelo contrato", () => {
    const parsed = parseContactInput({
      name: "Maria Exemplo",
      contact: "abcdef",
      message: "Olá!",
    });
    expect(parsed.ok).toBe(false);
  });

  it("mensagem só de espaços é rejeitada (conteúdo é obrigatório)", () => {
    const parsed = parseContactInput({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: "   ",
    });
    expect(parsed.ok).toBe(false);
  });
});

describe("submitContactRequest (mock)", () => {
  it("retorna sucesso com payload válido", async () => {
    const result = await submitContactRequest({
      name: "Maria Exemplo",
      contact: "maria@exemplo.com",
      message: "Quero tirar uma dúvida.",
    });
    expect(result.ok).toBe(true);
  });

  it("erro forçado traz mensagem acolhedora sem culpa", async () => {
    const result = await submitContactRequest(
      { name: "Maria Exemplo", contact: "maria@exemplo.com", message: "Olá!" },
      { forceError: true },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it("payload malformado retorna erro acolhedor sem chamada de rede", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await submitContactRequest(null);
    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("contato fora dos dois formatos é rejeitado na fronteira sem rede", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await submitContactRequest({
      name: "Maria Exemplo",
      contact: "abcdef",
      message: "Olá!",
    });
    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("não faz nenhuma chamada de rede", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await submitContactRequest({
      name: "Maria Exemplo",
      contact: "(11) 98765-4321",
      message: "Olá!",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
