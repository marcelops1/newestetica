import { Controller, Get, Param, Query, UseFilters } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import {
  ProcedureSchema,
  TREATMENT_CATEGORIES,
  TreatmentCategorySchema,
  type Procedure,
  type TreatmentCategory,
} from "@newestetica/contracts";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { GetProcedureBySlugUseCase } from "../../application/use-cases/get-procedure-by-slug.use-case";
import { ListProceduresUseCase } from "../../application/use-cases/list-procedures.use-case";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";

class ProcedureResponseDto extends createZodDto(ProcedureSchema) {}

const ListProceduresQuerySchema = z.object({
  category: TreatmentCategorySchema.optional(),
});

const SlugSchema = z.string().min(1).max(200);

@ApiTags("Catálogo")
@Controller("procedures")
@UseFilters(DomainExceptionFilter)
export class CatalogController {
  constructor(
    private readonly listProcedures: ListProceduresUseCase,
    private readonly getProcedureBySlug: GetProcedureBySlugUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: "Lista os procedimentos ativos do catálogo" })
  @ApiQuery({
    name: "category",
    required: false,
    enum: TREATMENT_CATEGORIES,
    description: "Filtra por categoria de tratamento.",
  })
  @ApiOkResponse({
    description: "Procedimentos ativos.",
    type: ProcedureResponseDto,
    isArray: true,
  })
  @ApiUnprocessableEntityResponse({
    description: "Categoria fora do vocabulário.",
  })
  async list(
    @Query(new ZodValidationPipe(ListProceduresQuerySchema))
    query: {
      category?: TreatmentCategory;
    },
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
  @ApiOperation({ summary: "Consulta um procedimento ativo pelo slug" })
  @ApiParam({ name: "slug", description: "Identificador do procedimento." })
  @ApiOkResponse({
    description: "Procedimento ativo.",
    type: ProcedureResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Não encontrado (inexistente ou desativado, sem distinção).",
  })
  @ApiUnprocessableEntityResponse({ description: "Slug inválido." })
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
