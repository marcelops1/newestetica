import { Controller, Get, Param, Query, UseFilters } from "@nestjs/common";
import {
  TreatmentCategorySchema,
  type Procedure,
  type TreatmentCategory,
} from "@newestetica/contracts";
import { z } from "zod";
import { GetProcedureBySlugUseCase } from "../../application/use-cases/get-procedure-by-slug.use-case";
import { ListProceduresUseCase } from "../../application/use-cases/list-procedures.use-case";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

const ListProceduresQuerySchema = z.object({
  category: TreatmentCategorySchema.optional(),
});

const SlugSchema = z.string().min(1).max(200);

@Controller("procedures")
@UseFilters(DomainExceptionFilter)
export class CatalogController {
  constructor(
    private readonly listProcedures: ListProceduresUseCase,
    private readonly getProcedureBySlug: GetProcedureBySlugUseCase,
  ) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(ListProceduresQuerySchema))
    query: { category?: TreatmentCategory },
  ): Promise<Procedure[]> {
    const procedures = await this.listProcedures.execute(query);
    /* Allowlist explícita do contrato: `isActive` é interno e nunca cruza o wire
       (só itens ativos aparecem — spec backend-catalog). */
    return procedures.map((procedure) => ({
      id: procedure.id,
      name: procedure.name,
      description: procedure.description,
      duration: procedure.duration,
      categories: procedure.categories,
    }));
  }

  @Get(":slug")
  async bySlug(
    @Param("slug", new ZodValidationPipe(SlugSchema)) slug: string,
  ): Promise<Procedure> {
    const procedure = await this.getProcedureBySlug.execute(slug);
    return {
      id: procedure.id,
      name: procedure.name,
      description: procedure.description,
      duration: procedure.duration,
      categories: procedure.categories,
    };
  }
}
