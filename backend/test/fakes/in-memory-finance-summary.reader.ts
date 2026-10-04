import type { FinanceSummaryReader } from "../../src/finance/domain/ports/finance-summary-reader";
import type { SummaryEntry } from "../../src/finance/domain/summary";

/* Fake manual em memória (docs/07 §15: application testa contra fakes, nunca banco).
   Registra as chamadas para provar que janela inválida NÃO toca a porta e devolve
   entradas filtradas pela janela — o mesmo contrato da implementação real. */
export class InMemoryFinanceSummaryReader implements FinanceSummaryReader {
  public readonly calls: Array<{ from: Date; to: Date }> = [];

  constructor(private readonly entries: readonly SummaryEntry[] = []) {}

  async readVisibleEntries(from: Date, to: Date): Promise<SummaryEntry[]> {
    this.calls.push({ from, to });
    return this.entries
      .filter(
        (entry) =>
          entry.performedAt.getTime() >= from.getTime() &&
          entry.performedAt.getTime() <= to.getTime(),
      )
      .map((entry) => ({ ...entry }));
  }
}
