import { InvalidFinanceWindow } from "../../domain/errors/errors";
import type { FinanceSummaryReader } from "../../domain/ports/finance-summary-reader";
import { summarize } from "../../domain/summary";

/** Teto do span da janela no núcleo: espelha o contrato (assertado em teste). */
export const MAX_FINANCE_WINDOW_DAYS = 366;

const MS_PER_DAY = 86_400_000;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type GetFinanceSummaryInput = {
  from: string;
  to: string;
};

export type FinanceSummaryResult = {
  from: string;
  to: string;
  currency: "BRL";
  totalCents: number;
  count: number;
};

/* O núcleo não confia no chamador (mesmo com o Zod na fronteira): data ISO no formato
   do contrato e data de calendário REAL — `Date.UTC` sozinho rolaria 2026-02-30 para
   março. O roundtrip na ISO corta datas inexistentes. */
function parseDay(value: string, label: "from" | "to"): Date {
  /* Tipo confundido (null, número, objeto) vira erro de domínio, NUNCA TypeError:
     o núcleo não confia no chamador (adversarial — docs/07 §16d). */
  if (typeof value !== "string") {
    throw new InvalidFinanceWindow(
      `${label} deve ser uma data ISO no formato YYYY-MM-DD`,
    );
  }
  const parts = value.split("-");
  if (parts.length !== 3 || !DAY_PATTERN.test(value)) {
    throw new InvalidFinanceWindow(
      `${label} deve ser uma data ISO no formato YYYY-MM-DD`,
    );
  }
  const [year, month, day] = parts.map(Number);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  if (Number.isNaN(time) || date.toISOString().slice(0, 10) !== value) {
    throw new InvalidFinanceWindow(
      `${label} não é uma data de calendário válida`,
    );
  }
  return date;
}

type FinanceWindow = {
  start: Date;
  end: Date;
};

/* Janela do resumo: `from` ≤ `to` e span máximo de 366 dias (bound de varredura);
   a borda `to` é o FIM do dia — janela inclusiva nas duas pontas. */
function parseWindow(from: string, to: string): FinanceWindow {
  const start = parseDay(from, "from");
  const endDay = parseDay(to, "to");
  if (start.getTime() > endDay.getTime()) {
    throw new InvalidFinanceWindow("from não pode ser posterior a to");
  }
  const spanDays = Math.round(
    (endDay.getTime() - start.getTime()) / MS_PER_DAY,
  );
  if (spanDays > MAX_FINANCE_WINDOW_DAYS) {
    throw new InvalidFinanceWindow(
      `janela não pode exceder ${MAX_FINANCE_WINDOW_DAYS} dias`,
    );
  }
  return { start, end: new Date(endDay.getTime() + MS_PER_DAY - 1) };
}

/* Caso de uso do resumo (design decisão 3): valida a janela no núcleo, delega a
   leitura visível à porta e a agregação à função pura — devolve o formato essencial
   com moeda literal. Sem UnitOfWork: só leitura. */
export class GetFinanceSummaryUseCase {
  constructor(private readonly reader: FinanceSummaryReader) {}

  async execute(input: GetFinanceSummaryInput): Promise<FinanceSummaryResult> {
    const { start, end } = parseWindow(input.from, input.to);
    const entries = await this.reader.readVisibleEntries(start, end);
    const totals = summarize(entries, start, end);
    return {
      from: input.from,
      to: input.to,
      currency: "BRL",
      ...totals,
    };
  }
}
