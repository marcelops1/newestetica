/* Agregação pura do resumo financeiro (design decisão 3): zero import externo —
   sem framework, sem ORM, sem outro contexto. Recebe pares já lidos (somente de
   pacientes visíveis — responsabilidade da porta) e devolve o agregado essencial. */

/** Par mínimo lido pelo reader: valor em centavos (nulo = sem valor fechado) e data. */
export type SummaryEntry = {
  amountCents: number | null;
  performedAt: Date;
};

/** Agregado essencial: total em centavos e contagem de atendimentos COM valor. */
export type SummaryTotals = {
  totalCents: number;
  count: number;
};

/* Janela inclusiva nas duas bordas (`from` e `to` são os limites do dia já resolvidos
   pelo caso de uso); soma em centavos inteiros — nunca float. Atendimento sem valor
   não entra no total NEM na contagem (denominador declarado, design decisão 2). */
export function summarize(
  entries: readonly SummaryEntry[],
  from: Date,
  to: Date,
): SummaryTotals {
  let totalCents = 0;
  let count = 0;
  const fromTime = from.getTime();
  const toTime = to.getTime();

  for (const entry of entries) {
    if (entry.amountCents === null) {
      continue;
    }
    const performedTime = entry.performedAt.getTime();
    if (performedTime < fromTime || performedTime > toTime) {
      continue;
    }
    totalCents += entry.amountCents;
    count += 1;
  }

  return { totalCents, count };
}
