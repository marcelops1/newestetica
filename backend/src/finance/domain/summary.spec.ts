import { describe, expect, it } from "vitest";
import { summarize, type SummaryEntry } from "./summary";

/* Agregação pura (design decisão 3): função sem banco, sem NestJS e sem float —
   filtra a janela (bordas inclusivas) e ignora atendimentos sem valor. */

const FROM = new Date("2026-09-01T00:00:00.000Z");
const TO = new Date("2026-09-30T23:59:59.999Z");

function entry(amountCents: number | null, performedAt: string): SummaryEntry {
  return { amountCents, performedAt: new Date(performedAt) };
}

describe("summarize (agregação pura do domínio)", () => {
  it("soma só entradas COM valor dentro da janela e conta os contribuintes", () => {
    const entries = [
      entry(15_000, "2026-09-01T00:00:00.000Z" /* borda from, inclusiva */),
      entry(2_500, "2026-09-15T12:00:00.000Z"),
      entry(1, "2026-09-30T23:59:59.999Z" /* borda to, inclusiva */),
      entry(null, "2026-09-15T12:00:00.000Z" /* sem valor: fora da soma */),
      entry(999, "2026-08-31T23:59:59.999Z" /* antes da janela */),
      entry(888, "2026-10-01T00:00:00.000Z" /* depois da janela */),
    ];

    const result = summarize(entries, FROM, TO);

    expect(result).toEqual({ totalCents: 17_501, count: 3 });
  });

  it("janela vazia (ou só com nulos/fora) retorna zeros exatos", () => {
    expect(summarize([], FROM, TO)).toEqual({ totalCents: 0, count: 0 });
    expect(
      summarize(
        [
          entry(null, "2026-09-15T12:00:00.000Z"),
          entry(500, "2026-08-01T10:00:00.000Z"),
        ],
        FROM,
        TO,
      ),
    ).toEqual({ totalCents: 0, count: 0 });
  });

  it("soma em centavos inteiros sem erro de ponto flutuante", () => {
    const entries = Array.from({ length: 100 }, () =>
      entry(10, "2026-09-10T10:00:00.000Z"),
    );

    const result = summarize(entries, FROM, TO);

    expect(result.totalCents).toBe(1_000);
    expect(Number.isInteger(result.totalCents)).toBe(true);
  });

  it("não altera o array de entrada (função pura)", () => {
    const entries = [entry(100, "2026-09-10T10:00:00.000Z")];
    const before = [...entries];

    summarize(entries, FROM, TO);

    expect(entries).toEqual(before);
  });
});
