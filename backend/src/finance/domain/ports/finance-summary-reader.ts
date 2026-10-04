import type { SummaryEntry } from "../summary";

/* Porta do consumidor definida no domínio de Financeiro (design decisões 3 e 4):
   leitura agregada com a visibilidade no nome — o reader devolve SOMENTE pares
   `{ amountCents, performedAt }` de atendimentos de pacientes visíveis (nunca
   entidades, nunca PII). Zero implementação aqui; cada fake/impl fica fora do
   domain/. A porta não conhece o cliente Prisma (a unificação de provider não a
   toca). */
export interface FinanceSummaryReader {
  readVisibleEntries(from: Date, to: Date): Promise<SummaryEntry[]>;
}
