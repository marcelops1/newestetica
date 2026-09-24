import type { Procedure as ProcedureRecord } from "../../../../generated/prisma/client";
import {
  Procedure,
  TREATMENT_CATEGORIES,
  type TreatmentCategory,
} from "../../../domain/entities/procedure.entity";
import { InvalidProcedure } from "../../../domain/errors/errors";

function toCategories(values: string[]): TreatmentCategory[] {
  return values.map((value) => {
    if (!TREATMENT_CATEGORIES.includes(value as TreatmentCategory)) {
      throw new InvalidProcedure(`categoria desconhecida vinda do banco: ${value}`);
    }
    return value as TreatmentCategory;
  });
}

/* Data Mapper (docs/architecture/04-decisoes-tecnicas.md §5): o registro do ORM nunca
   cruza para o domínio. Direção de escrita nasce com o CRUD administrativo (fora deste
   change — a porta é só de leitura). */
export function toProcedureDomain(record: ProcedureRecord): Procedure {
  return Procedure.restore({
    id: record.id,
    name: record.name,
    description: record.description,
    duration: record.duration,
    categories: toCategories(record.categories),
    isActive: record.isActive,
  });
}
