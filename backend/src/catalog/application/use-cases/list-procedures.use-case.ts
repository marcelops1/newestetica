import {
  TREATMENT_CATEGORIES,
  type Procedure,
  type TreatmentCategory,
} from "../../domain/entities/procedure.entity";
import { InvalidProcedure } from "../../domain/errors/errors";
import type { ProcedureRepository } from "../../domain/ports/procedure.repository";

export type ListProceduresInput = {
  category?: TreatmentCategory;
};

export class ListProceduresUseCase {
  constructor(private readonly procedures: ProcedureRepository) {}

  async execute(input: ListProceduresInput): Promise<Procedure[]> {
    if (input.category === undefined) {
      return this.procedures.findActive();
    }
    if (!TREATMENT_CATEGORIES.includes(input.category)) {
      throw new InvalidProcedure(`categoria desconhecida: ${input.category}`);
    }
    return this.procedures.findActiveByCategory(input.category);
  }
}
