import type { SummaryEntry } from "../../../domain/summary";

type SummaryEntryRecord = {
  amountCents: number | null;
  performedAt: Date;
};

/* Data Mapper (docs/architecture/04-decisoes-tecnicas.md §5): o registro do ORM nunca
   cruza para o domínio; a leitura expõe SÓ os dois campos do agregado — nenhum nome,
   vínculo ou resumo sai daqui (design decisão 3). */
export function toSummaryEntry(record: SummaryEntryRecord): SummaryEntry {
  return {
    amountCents: record.amountCents,
    performedAt: record.performedAt,
  };
}
