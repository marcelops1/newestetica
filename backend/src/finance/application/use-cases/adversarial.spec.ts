import { describe, expect, it } from "vitest";
import { InMemoryFinanceSummaryReader } from "../../../../test/fakes/in-memory-finance-summary.reader";
import { InvalidFinanceWindow } from "../../domain/errors/errors";
import { GetFinanceSummaryUseCase } from "./get-finance-summary.use-case";

/* Adversarial (docs/07 §16d): entradas hostis REAIS contra a superfície do caso de
   uso, como defesa em profundidade — mesmo que a fronteira HTTP valide antes, o
   núcleo não confia no chamador (tipo confundido vira erro de domínio, nunca
   TypeError). Sondas: agregado sem PII/breakdown e sem contribuição de nulo. */

const validWindow = { from: "2026-09-01", to: "2026-09-30" };

function makeUseCase(): {
  useCase: GetFinanceSummaryUseCase;
  reader: InMemoryFinanceSummaryReader;
} {
  const reader = new InMemoryFinanceSummaryReader([
    { amountCents: 15_000, performedAt: new Date("2026-09-10T10:00:00.000Z") },
    { amountCents: null, performedAt: new Date("2026-09-11T10:00:00.000Z") },
  ]);
  return { useCase: new GetFinanceSummaryUseCase(reader), reader };
}

describe("adversarial — janela hostil contra o caso de uso", () => {
  it("janela com tipo confundido é rejeitada como erro de domínio, sem TypeError", async () => {
    const { useCase, reader } = makeUseCase();

    for (const hostile of [
      null,
      123_456,
      { toString: () => "2026-09-01" },
      Number.MAX_SAFE_INTEGER,
      true,
    ]) {
      await expect(
        useCase.execute({ from: hostile as never, to: validWindow.to }),
        `from hostil: ${String(hostile)}`,
      ).rejects.toThrow(InvalidFinanceWindow);
      await expect(
        useCase.execute({ from: validWindow.from, to: hostile as never }),
        `to hostil: ${String(hostile)}`,
      ).rejects.toThrow(InvalidFinanceWindow);
    }

    expect(reader.calls).toHaveLength(0);
  });

  it("janela gigante, com injeção ou com lixo é rejeitada sem tocar a leitura", async () => {
    const { useCase, reader } = makeUseCase();

    const hostiles = [
      { from: "x".repeat(100_000), to: validWindow.to },
      { from: validWindow.from, to: "y".repeat(100_000) },
      { from: "2026-09-01' OR '1'='1", to: validWindow.to },
      { from: validWindow.from, to: '2026-09-30"; DROP TABLE "Attendance"; --' },
      { from: "2026-09-01T00:00:00Z", to: validWindow.to },
      { from: " 2026-09-01", to: validWindow.to },
      { from: "2026-09-01 ", to: validWindow.to },
    ];

    for (const window of hostiles) {
      await expect(
        useCase.execute(window),
        `janela hostil: ${JSON.stringify(window).slice(0, 80)}`,
      ).rejects.toThrow(InvalidFinanceWindow);
    }

    expect(reader.calls).toHaveLength(0);
  });

  it("janela invertida e span acima do teto continuam rejeitados no núcleo", async () => {
    const { useCase, reader } = makeUseCase();

    await expect(
      useCase.execute({ from: "2026-12-31", to: "2026-01-01" }),
    ).rejects.toThrow(InvalidFinanceWindow);
    await expect(
      useCase.execute({ from: "2026-01-01", to: "2027-01-03" }),
    ).rejects.toThrow(InvalidFinanceWindow);

    expect(reader.calls).toHaveLength(0);
  });
});

describe("adversarial — superfície do agregado (sem PII, sem breakdown)", () => {
  it("a resposta tem exatamente janela/moeda/total/contagem — sem campo para PII", async () => {
    const { useCase } = makeUseCase();

    const result = await useCase.execute(validWindow);

    expect(Object.keys(result).sort()).toEqual([
      "count",
      "currency",
      "from",
      "to",
      "totalCents",
    ]);
    expect(JSON.stringify(result)).not.toContain("patient");
    expect(JSON.stringify(result)).not.toContain("name");
  });

  it("sonda: entrada sem valor nunca compõe total nem contagem", async () => {
    const { useCase } = makeUseCase();

    const result = await useCase.execute(validWindow);

    expect(result.totalCents).toBe(15_000);
    expect(result.count).toBe(1);
  });
});
