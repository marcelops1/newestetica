import { Module } from "@nestjs/common";
import type { PrismaClient } from "../generated/prisma/client";
import { IdentityPendingGuard } from "../shared/http/identity-pending.guard";
import { createPrismaClientFromEnv } from "../shared/prisma/client-factory";
import { GetFinanceSummaryUseCase } from "./application/use-cases/get-finance-summary.use-case";
import { PrismaFinanceSummaryReader } from "./infrastructure/persistence/finance-summary.reader.impl";

export const FINANCE_PRISMA_CLIENT = Symbol("FINANCE_PRISMA_CLIENT");
export const FINANCE_SUMMARY_READER = Symbol("FINANCE_SUMMARY_READER");

/* Cliente próprio do módulo (sexto pool consciente — design decisão 4): a factory é
   compartilhada (kernel), a instância não; nenhum import do módulo de Atendimento —
   a leitura do Financeiro é a sua própria porta sobre a tabela. Sem UnitOfWork: o
   módulo só lê. O `IdentityPendingGuard` vem do kernel (uma única definição). */
@Module({
  providers: [
    {
      provide: FINANCE_PRISMA_CLIENT,
      useFactory: createPrismaClientFromEnv,
    },
    {
      provide: FINANCE_SUMMARY_READER,
      useFactory: (prisma: PrismaClient) =>
        new PrismaFinanceSummaryReader(prisma),
      inject: [FINANCE_PRISMA_CLIENT],
    },
    {
      provide: GetFinanceSummaryUseCase,
      useFactory: (reader: PrismaFinanceSummaryReader) =>
        new GetFinanceSummaryUseCase(reader),
      inject: [FINANCE_SUMMARY_READER],
    },
    IdentityPendingGuard,
  ],
})
export class FinanceModule {}
