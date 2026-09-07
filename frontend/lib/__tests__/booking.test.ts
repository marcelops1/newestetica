import { describe, expect, it, vi } from "vitest";
import { resolveTreatment, submitBookingRequest } from "../booking";

describe("submitBookingRequest (mock)", () => {
  it("retorna sucesso com o tratamento solicitado", async () => {
    const result = await submitBookingRequest({
      name: "Maria Exemplo",
      phone: "(00) 00000-0000",
      treatment: "Limpeza de pele",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.treatment).toBe("Limpeza de pele");
    }
  });

  it("erro forçado traz mensagem acolhedora", async () => {
    const result = await submitBookingRequest(
      { name: "Maria Exemplo", phone: "(00) 00000-0000" },
      { forceError: true },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message.length).toBeGreaterThan(0);
    }
  });

  it("não faz nenhuma chamada de rede", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await submitBookingRequest({ name: "A", phone: "000" });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

describe("resolveTreatment (pré-seleção por origem)", () => {
  const options = ["Avaliação Geral", "Toxina Botulínica", "Limpeza de pele"];

  it("mantém match exato", () => {
    expect(resolveTreatment("Limpeza de pele", options)).toBe(
      "Limpeza de pele",
    );
  });

  it("resolve protocolo do quiz por inclusão", () => {
    expect(
      resolveTreatment("Toxina Botulínica Preventiva e mais", options),
    ).toBe("Toxina Botulínica");
  });

  it("usa o padrão quando nada combina", () => {
    expect(resolveTreatment("Caso desconhecido", options)).toBe(
      "Avaliação Geral",
    );
  });
});
