import type { Procedure } from "../../domain/entities/procedure.entity";
import { ProcedureNotFound } from "../../domain/errors/errors";
import type { ProcedureRepository } from "../../domain/ports/procedure.repository";

export class GetProcedureBySlugUseCase {
  constructor(private readonly procedures: ProcedureRepository) {}

  async execute(slug: string): Promise<Procedure> {
    const procedure = await this.procedures.findActiveBySlug(slug);
    if (!procedure) {
      throw new ProcedureNotFound(slug);
    }
    return procedure;
  }
}
