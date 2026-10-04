import { z } from "zod";

/* Contrato do resumo financeiro (UC 4.2.6), desenhado do zero na skill
   api-and-interface-design (decisão 2 do design): janela obrigatória — auditável e
   com teto de varredura —, moeda literal (só existe BRL no MVP) e agregado sem PII
   por construção: não há campo de paciente para vazar, nem breakdown para filtrar. */

/** Teto do span da janela (`to` − `from`) em dias: bound do contrato e da varredura. */
export const MAX_FINANCE_WINDOW_DAYS = 366;

const MS_PER_DAY = 86_400_000;

/* Dias corridos entre as duas datas (UTC): 0 = mesmo dia; 366 = teto. `z.iso.date()`
   já garante a forma `YYYY-MM-DD` e a data real antes das refinações. */
function daysBetween(from: string, to: string): number {
  const fromTime = Date.parse(`${from}T00:00:00.000Z`);
  const toTime = Date.parse(`${to}T00:00:00.000Z`);
  return Math.round((toTime - fromTime) / MS_PER_DAY);
}

/** Consulta do resumo: `from`/`to` obrigatórios em data ISO, `from` ≤ `to` e span de
 *  no máximo 366 dias. Janela ausente, malformada, invertida ou acima do teto reprova. */
export const FinanceSummaryQuerySchema = z
  .object({
    from: z.iso.date(),
    to: z.iso.date(),
  })
  .refine((window) => daysBetween(window.from, window.to) >= 0, {
    message: "from não pode ser posterior a to",
    path: ["from"],
  })
  .refine(
    (window) => daysBetween(window.from, window.to) <= MAX_FINANCE_WINDOW_DAYS,
    {
      message: `janela não pode exceder ${MAX_FINANCE_WINDOW_DAYS} dias`,
      path: ["to"],
    },
  );

/** Resumo agregado: a janela consultada, `currency: "BRL"` literal, total e contagem
 *  de atendimentos COM valor (o denominador é declarado). Sem PII, sem breakdown. */
export const FinanceSummarySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
  currency: z.literal("BRL"),
  totalCents: z.number().int().min(0),
  count: z.number().int().min(0),
});

export type FinanceSummaryQuery = z.infer<typeof FinanceSummaryQuerySchema>;
export type FinanceSummary = z.infer<typeof FinanceSummarySchema>;
