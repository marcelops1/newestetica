import type { Procedure as ProcedureRecord } from "../../../../generated/prisma/client";
import {
  Procedure,
  type TreatmentCategory,
} from "../../../domain/entities/procedure.entity";

/* Data Mapper (docs/architecture/04-decisoes-tecnicas.md §5): o registro do ORM nunca
   cruza para o domínio. O array de categorias vem do banco como dado não confiável e é
   validado pelo `Procedure.restore` (fonte única do vocabulário) — sem revalidação aqui.
   Direção de escrita nasce com o CRUD administrativo (fora deste change — a porta é só
   de leitura). */
export function toProcedureDomain(record: ProcedureRecord): Procedure {
  return Procedure.restore({
    id: record.id,
    name: record.name,
    description: record.description,
    duration: record.duration,
    categories: record.categories as TreatmentCategory[],
    isActive: record.isActive,
  });
}
