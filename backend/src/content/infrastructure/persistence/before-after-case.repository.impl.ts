import type { PrismaClient } from "../../../generated/prisma/client";
import type { BeforeAfterCase } from "../../domain/entities/before-after-case.entity";
import type { BeforeAfterCaseRepository } from "../../domain/ports/before-after-case.repository";
import { toBeforeAfterCaseDomain } from "./mappers/before-after-case.mapper";

/* Camada 2 da invariante de consentimento: o filtro vive na QUERY (`where: hasConsent:
   true`) — o caso sem consentimento não sai do banco, não chega ao processo. O nome da
   porta carrega a regra; não existe leitura pública sem consentimento (design decisão 5). */
export class PrismaBeforeAfterCaseRepository implements BeforeAfterCaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findConsented(): Promise<BeforeAfterCase[]> {
    const records = await this.prisma.beforeAfterCase.findMany({
      where: { hasConsent: true },
      orderBy: { id: "asc" },
    });
    return records.map(toBeforeAfterCaseDomain);
  }
}
