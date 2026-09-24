import { Module } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { GetProcedureBySlugUseCase } from "./application/use-cases/get-procedure-by-slug.use-case";
import { ListProceduresUseCase } from "./application/use-cases/list-procedures.use-case";
import { PrismaProcedureRepository } from "./infrastructure/persistence/procedure.repository.impl";
import { CatalogController } from "./presentation/controllers/catalog.controller";

export const PRISMA_CLIENT = Symbol("CATALOG_PRISMA_CLIENT");
export const PROCEDURE_REPOSITORY = Symbol("PROCEDURE_REPOSITORY");

/* Cliente próprio do módulo (mesmo padrão do SchedulingModule): bounded contexts não
   compartilham wiring. Trade-off registrado: dois pools de conexão até um provider
   compartilhado de cliente no AppModule (candidato a change quando o 3º módulo chegar). */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada para o backend");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

@Module({
  controllers: [CatalogController],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: createPrismaClient },
    {
      provide: PROCEDURE_REPOSITORY,
      useFactory: (prisma: PrismaClient) => new PrismaProcedureRepository(prisma),
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
