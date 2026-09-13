import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PROCEDURE,
  parseQuoteInput,
  submitQuoteRequest,
} from "../quote";

describe("parseQuoteInput (contrato da fronteira UI ↔ submissão mockada)", () => {
  it("payload válido com nome, WhatsApp, procedimento e mensagem passa no schema", () => {
    const parsed = parseQuoteInput({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      procedure: "Limpeza de pele",
      message: "Gostaria de saber o valor do procedimento.",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.input.name).toBe("Maria Exemplo");
      expect(parsed.input.phone).toBe("(00) 00000-0000");
      expect(parsed.input.procedure).toBe("Limpeza de pele");
      expect(parsed.input.message).toBe(
        "Gostaria de saber o valor do procedimento.",
      );
    }
  });

  it("payload sem campos opcionais passa no schema", () => {
    const parsed = parseQuoteInput({
      name: "Maria Exemplo",
      phone: "00000000000",
    });
    expect(parsed.ok).toBe(true);
  });

  it("campo ausente retorna erro acolhedor sem vazar detalhes internos", () => {
    const parsed = parseQuoteInput({ name: "Maria Exemplo" });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.message.length).toBeGreaterThan(0);
      expect(parsed.message).not.toMatch(/undefined|TypeError|stack|schema/i);
    }
  });

  it("tipo errado retorna erro acolhedor sem vazar detalhes internos", () => {
    const parsed = parseQuoteInput({
      name: 123 as unknown as string,
      phone: "(00) 00000-0000",
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.message).not.toMatch(/undefined|TypeError|stack|schema/i);
    }
  });

  it("procedure presente mas não-string é rejeitado com erro acolhedor", () => {
    const parsed = parseQuoteInput({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      procedure: 42 as unknown as string,
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.message.length).toBeGreaterThan(0);
      expect(parsed.message).not.toMatch(/undefined|TypeError|stack|schema/i);
    }
  });

  it("message presente mas não-string é rejeitado com erro acolhedor", () => {
    const parsed = parseQuoteInput({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      message: 123 as unknown as string,
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.message.length).toBeGreaterThan(0);
      expect(parsed.message).not.toMatch(/undefined|TypeError|stack|schema/i);
    }
  });

  it("entrada nula retorna erro acolhedor", () => {
    expect(parseQuoteInput(null).ok).toBe(false);
  });

  it("procedimento desconhecido é rejeitado pelo contrato", () => {
    const parsed = parseQuoteInput({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      procedure: "Procedimento Inventado",
    });
    expect(parsed.ok).toBe(false);
  });

  it("procedimento vazio é aceito (padrão acolhedor entra depois)", () => {
    const parsed = parseQuoteInput({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      procedure: "   ",
    });
    expect(parsed.ok).toBe(true);
  });
});

describe("submitQuoteRequest (mock)", () => {
  it("retorna sucesso com o procedimento solicitado", async () => {
    const result = await submitQuoteRequest({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      procedure: "Limpeza de pele",
      message: "Quero saber o valor.",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.procedure).toBe("Limpeza de pele");
    }
  });

  it("usa o padrão acolhedor quando o procedimento vem vazio", async () => {
    const result = await submitQuoteRequest({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.procedure).toBe(DEFAULT_PROCEDURE);
    }
  });

  it("erro forçado traz mensagem acolhedora sem culpa", async () => {
    const result = await submitQuoteRequest(
      { name: "Maria Exemplo", phone: "(00) 00000-0000" },
      { forceError: true },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it("payload malformado retorna erro acolhedor sem chamada de rede", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await submitQuoteInputMalformed();
    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("não faz nenhuma chamada de rede", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await submitQuoteRequest({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      procedure: "Limpeza de pele",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

function submitQuoteInputMalformed() {
  return submitQuoteRequest(null);
}
