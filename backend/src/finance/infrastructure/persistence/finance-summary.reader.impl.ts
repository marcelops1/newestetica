import type { PrismaClient } from "../../../generated/prisma/client";
import type { FinanceSummaryReader } from "../../domain/ports/finance-summary-reader";
import type { SummaryEntry } from "../../domain/summary";
import { toSummaryEntry } from "./mappers/summary-entry.mapper";

/* Implementação Prisma da porta (design decisões 3 e 5): a invariante de visibilidade
   herdada vive na QUERY (`patient: { status: "active" }` — mesma 2ª camada do
   Atendimento), não em filtro de memória; `amountCents: null` não compõe o agregado
   e a janela é aplicada no banco (bounded). Sem UnitOfWork: só leitura. */
export class PrismaFinanceSummaryReader implements FinanceSummaryReader {
  constructor(private readonly prisma: PrismaClient) {}

  async readVisibleEntries(from: Date, to: Date): Promise<SummaryEntry[]> {
    const records = await this.prisma.attendance.findMany({
      where: {
        performedAt: { gte: from, lte: to },
        amountCents: { not: null },
        patient: { status: "active" },
      },
      select: { amountCents: true, performedAt: true },
      orderBy: [{ performedAt: "asc" }, { id: "asc" }],
    });
    return records.map(toSummaryEntry);
  }
}
