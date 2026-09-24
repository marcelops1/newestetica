import { describe, expect, it } from "vitest";
import { InvalidContent } from "../errors/errors";
import { BeforeAfterCase } from "./before-after-case.entity";

const base = {
  id: "resultado-1",
  title: "Bioestimulação com Rejuvenescimento Natural",
  summary: "Caso 100% fictício para teste.",
  sessions: "2 sessões (intervalo de 30 dias)",
  recovery: "Imediato (sem downtime)",
  goal: "Firmeza e contorno sutil",
};

describe("BeforeAfterCase (entidade de domínio)", () => {
  it("cria caso válido com consentimento fail-closed (default falso)", () => {
    const beforeAfter = BeforeAfterCase.create(base);

    expect(beforeAfter.id).toBe("resultado-1");
    expect(beforeAfter.title).toContain("Bioestimulação");
    expect(beforeAfter.hasConsent).toBe(false);
  });

  it("rejeita campos obrigatórios vazios ou só com espaços", () => {
    for (const field of [
      "id",
      "title",
      "summary",
      "sessions",
      "recovery",
      "goal",
    ] as const) {
      expect(() => BeforeAfterCase.create({ ...base, [field]: "  " })).toThrow(
        InvalidContent,
      );
    }
  });

  it("restore preserva o consentimento concedido", () => {
    const beforeAfter = BeforeAfterCase.restore({
      ...base,
      hasConsent: true,
    });

    expect(beforeAfter.hasConsent).toBe(true);
  });

  it("restore preserva o consentimento negado", () => {
    const beforeAfter = BeforeAfterCase.restore({
      ...base,
      hasConsent: false,
    });

    expect(beforeAfter.hasConsent).toBe(false);
  });

  it("restore também valida o snapshot (defesa na entrada vinda do banco)", () => {
    expect(() =>
      BeforeAfterCase.restore({ ...base, hasConsent: true, summary: "  " }),
    ).toThrow(InvalidContent);
  });
});
