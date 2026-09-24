import type { PrismaClient } from "../../../generated/prisma/client";
import type {
  Procedure,
  TreatmentCategory,
} from "../../domain/entities/procedure.entity";
import type { ProcedureRepository } from "../../domain/ports/procedure.repository";
import { toProcedureDomain } from "./mappers/procedure.mapper";

/* Sem UnitOfWork: o módulo só lê entidade única (design decisão 2). Ordem estável
   por nome para a listagem pública ser determinística. */
export class PrismaProcedureRepository implements ProcedureRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActive(): Promise<Procedure[]> {
    const records = await this.prisma.procedure.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return records.map(toProcedureDomain);
  }

  async findActiveByCategory(
    category: TreatmentCategory,
  ): Promise<Procedure[]> {
    const records = await this.prisma.procedure.findMany({
      where: { isActive: true, categories: { has: category } },
      orderBy: { name: "asc" },
    });
    return records.map(toProcedureDomain);
  }

  async findActiveBySlug(slug: string): Promise<Procedure | null> {
    const record = await this.prisma.procedure.findUnique({
      where: { id: slug },
    });
    if (!record || !record.isActive) {
      return null;
    }
    return toProcedureDomain(record);
  }
}
