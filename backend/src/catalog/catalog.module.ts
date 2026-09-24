import { Module } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { createPrismaClientFromEnv } from "../shared/prisma/client-factory";
import { GetProcedureBySlugUseCase } from "./application/use-cases/get-procedure-by-slug.use-case";
import { ListProceduresUseCase } from "./application/use-cases/list-procedures.use-case";
import { PrismaProcedureRepository } from "./infrastructure/persistence/procedure.repository.impl";
import { CatalogController } from "./presentation/controllers/catalog.controller";

export const PRISMA_CLIENT = Symbol("CATALOG_PRISMA_CLIENT");
export const PROCEDURE_REPOSITORY = Symbol("PROCEDURE_REPOSITORY");

/* Cliente próprio do módulo (mesmo padrão dos outros módulos): a factory é compartilhada
   (kernel), a instância não — bounded contexts não compartilham wiring; unificação de
   provider segue adiada com trigger (decisão 8 do change Conteúdo Público). */

@Module({
  controllers: [CatalogController],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: createPrismaClientFromEnv },
    {
      provide: PROCEDURE_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaProcedureRepository(prisma),
      inject: [PRISMA_CLIENT],
    },
    {
      provide: ListProceduresUseCase,
      useFactory: (procedures: PrismaProcedureRepository) =>
        new ListProceduresUseCase(procedures),
      inject: [PROCEDURE_REPOSITORY],
    },
    {
      provide: GetProcedureBySlugUseCase,
      useFactory: (procedures: PrismaProcedureRepository) =>
        new GetProcedureBySlugUseCase(procedures),
      inject: [PROCEDURE_REPOSITORY],
    },
  ],
})
export class CatalogModule {}
