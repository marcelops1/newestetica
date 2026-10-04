import { describe, expect, it } from "vitest";
import { MAX_FINANCE_WINDOW_DAYS as CONTRACT_MAX_WINDOW_DAYS } from "@newestetica/contracts";
import { InMemoryFinanceSummaryReader } from "../../../../test/fakes/in-memory-finance-summary.reader";
import { InvalidFinanceWindow } from "../../domain/errors/errors";
import {
  GetFinanceSummaryUseCase,
  MAX_FINANCE_WINDOW_DAYS,
} from "./get-finance-summary.use-case";

/* Caso de uso do resumo (design decisão 3): depende SÓ da porta (fake em memória) e
   rejeita janela inválida no núcleo sem tocar a leitura. */

function entry(
  amountCents: number | null,
  performedAt: string,
): { amountCents: number | null; performedAt: Date } {
  return { amountCents, performedAt: new Date(performedAt) };
}

describe("GetFinanceSummaryUseCase", () => {
  it("janela válida retorna janela, moeda literal, total e contagem via porta", async () => {
    const reader = new InMemoryFinanceSummaryReader([
      entry(15_000, "2026-09-01T00:00:00.000Z"),
      entry(2_500, "2026-09-15T12:00:00.000Z"),
      entry(null, "2026-09-15T12:00:00.000Z"),
      entry(999, "2026-08-31T23:59:59.999Z"),
    ]);
    const useCase = new GetFinanceSummaryUseCase(reader);

    const result = await useCase.execute({
      from: "2026-09-01",
      to: "2026-09-30",
    });

    expect(result).toEqual({
      from: "2026-09-01",
      to: "2026-09-30",
      currency: "BRL",
      totalCents: 17_500,
      count: 2,
    });
    expect(reader.calls).toHaveLength(1);
    expect(reader.calls[0]?.from.toISOString()).toBe(
      "2026-09-01T00:00:00.000Z",
    );
    expect(reader.calls[0]?.to.toISOString()).toBe("2026-09-30T23:59:59.999Z");
  });

  it("janela sem contribuintes retorna zeros sem erro", async () => {
    const useCase = new GetFinanceSummaryUseCase(
      new InMemoryFinanceSummaryReader([
        entry(500, "2026-08-01T10:00:00.000Z"),
        entry(null, "2026-09-10T10:00:00.000Z"),
      ]),
    );

    const result = await useCase.execute({
      from: "2026-09-01",
      to: "2026-09-30",
    });

    expect(result.totalCents).toBe(0);
    expect(result.count).toBe(0);
  });

  it("janela ausente/malformada/invertida e span acima do teto rejeitam sem tocar a porta", async () => {
    const reader = new InMemoryFinanceSummaryReader();
    const useCase = new GetFinanceSummaryUseCase(reader);

    for (const window of [
      { from: "01/09/2026", to: "2026-09-30" },
      { from: "2026-02-30", to: "2026-09-30" },
      { from: "2026-12-31", to: "2026-01-01" },
      { from: "2026-01-01", to: "2027-01-03" },
      { from: "", to: "" },
    ]) {
      await expect(
        useCase.execute(window),
        `janela hostil: ${JSON.stringify(window)}`,
      ).rejects.toThrow(InvalidFinanceWindow);
    }

    expect(reader.calls).toHaveLength(0);
  });

  it("aceita a fronteira de exatamente 366 dias", async () => {
    const reader = new InMemoryFinanceSummaryReader();
    const useCase = new GetFinanceSummaryUseCase(reader);

    await expect(
      useCase.execute({ from: "2026-01-01", to: "2027-01-02" }),
    ).resolves.toBeDefined();
  });

  /* Testes de caracterização (comportamento já existente; sem RED — registrados como
     tal no verification.md): âncoras do formato, data de calendário, from = to e as
     mensagens que distinguem cada regra de janela. */
  it("rejeita lixo nas âncoras e data parcial com a mensagem do formato correto", async () => {
    const reader = new InMemoryFinanceSummaryReader();
    const useCase = new GetFinanceSummaryUseCase(reader);

    for (const from of [
      "x2026-09-01",
      "2026-09-01x",
      " 2026-09-01",
      "2026-9-1",
      "2026-09",
    ]) {
      await expect(
        useCase.execute({ from, to: "2026-09-30" }),
        `from malformado: ${from}`,
      ).rejects.toThrow(/from.*YYYY-MM-DD/);
    }
    await expect(
      useCase.execute({ from: "2026-09-01", to: "2026-9-30" }),
    ).rejects.toThrow(/to.*YYYY-MM-DD/);
    expect(reader.calls).toHaveLength(0);
  });

  it("rejeita data de calendário inexistente com a mensagem própria", async () => {
    const useCase = new GetFinanceSummaryUseCase(
      new InMemoryFinanceSummaryReader(),
    );

    await expect(
      useCase.execute({ from: "2026-02-30", to: "2026-09-30" }),
    ).rejects.toThrow(/from.*calendário/);
    await expect(
      useCase.execute({ from: "2026-09-01", to: "2026-13-01" }),
    ).rejects.toThrow(/to.*calendário/);
  });

  it("aceita janela de um único dia (from = to)", async () => {
    const useCase = new GetFinanceSummaryUseCase(
      new InMemoryFinanceSummaryReader(),
    );

    await expect(
      useCase.execute({ from: "2026-09-10", to: "2026-09-10" }),
    ).resolves.toBeDefined();
  });

  it("janela invertida e span acima do teto trazem a mensagem da regra", async () => {
    const useCase = new GetFinanceSummaryUseCase(
      new InMemoryFinanceSummaryReader(),
    );

    await expect(
      useCase.execute({ from: "2026-12-31", to: "2026-01-01" }),
    ).rejects.toThrow(/posterior/);
    await expect(
      useCase.execute({ from: "2026-01-01", to: "2027-01-03" }),
    ).rejects.toThrow(/exceder/);
  });

  it("o erro de janela traz a mensagem de tipo/ISO e o código do contrato de erro, sem eco", async () => {
    const useCase = new GetFinanceSummaryUseCase(
      new InMemoryFinanceSummaryReader(),
    );

    const typeConfused = await useCase
      .execute({ from: null as never, to: "2026-09-30" })
      .catch((error: unknown) => error);

    expect(typeConfused).toBeInstanceOf(InvalidFinanceWindow);
    expect((typeConfused as InvalidFinanceWindow).message).toMatch(
      /from.*YYYY-MM-DD/,
    );
    expect((typeConfused as InvalidFinanceWindow).code).toBe(
      "INVALID_FINANCE_WINDOW",
    );

    const inverted = await useCase
      .execute({ from: "2026-12-31", to: "2026-01-01" })
      .catch((error: unknown) => error);
    expect((inverted as InvalidFinanceWindow).code).toBe(
      "INVALID_FINANCE_WINDOW",
    );
  });

  it("o teto do núcleo é o teto do contrato (nunca um literal duplicado)", () => {
    expect(MAX_FINANCE_WINDOW_DAYS).toBe(CONTRACT_MAX_WINDOW_DAYS);
  });
});
