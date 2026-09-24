import { Procedure } from "../../src/catalog/domain/entities/procedure.entity";
import type { TreatmentCategory } from "../../src/catalog/domain/entities/procedure.entity";
import type { ProcedureRepository } from "../../src/catalog/domain/ports/procedure.repository";

export class InMemoryProcedureRepository implements ProcedureRepository {
  private readonly procedures: Procedure[];

  constructor(initial: Procedure[] = []) {
    this.procedures = [...initial];
  }

  async findActive(): Promise<Procedure[]> {
    return this.procedures.filter((procedure) => procedure.isActive);
  }

  async findActiveByCategory(
    category: TreatmentCategory,
  ): Promise<Procedure[]> {
    return this.procedures.filter(
      (procedure) =>
        procedure.isActive && procedure.categories.includes(category),
    );
  }

  async findActiveBySlug(slug: string): Promise<Procedure | null> {
    return (
      this.procedures.find(
        (procedure) => procedure.id === slug && procedure.isActive,
      ) ?? null
    );
  }
}
