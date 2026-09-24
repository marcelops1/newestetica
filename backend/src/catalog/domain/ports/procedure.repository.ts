import type {
  Procedure,
  TreatmentCategory,
} from "../entities/procedure.entity";

export interface ProcedureRepository {
  findActive(): Promise<Procedure[]>;
  findActiveByCategory(category: TreatmentCategory): Promise<Procedure[]>;
  findActiveBySlug(slug: string): Promise<Procedure | null>;
}
