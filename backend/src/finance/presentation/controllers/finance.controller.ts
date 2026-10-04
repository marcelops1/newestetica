import { Controller, Get, Query, UseFilters, UseGuards } from "@nestjs/common";
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import {
  FinanceSummaryQuerySchema,
  FinanceSummarySchema,
  type FinanceSummary as FinanceSummaryResponse,
  type FinanceSummaryQuery,
} from "@newestetica/contracts";
import { createZodDto } from "nestjs-zod";
import {
  GetFinanceSummaryUseCase,
  type FinanceSummaryResult,
} from "../../application/use-cases/get-finance-summary.use-case";
import {
  AUTH_401_DESCRIPTION,
  AUTH_401_SCHEMA,
  AUTH_403_DESCRIPTION,
  AUTH_403_SCHEMA,
} from "../../../shared/http/auth/auth-swagger";
import { Roles } from "../../../shared/http/auth/roles.decorator";
import { JwtAuthGuard } from "../../../shared/http/auth/jwt-auth.guard";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";

class FinanceSummaryResponseDto extends createZodDto(FinanceSummarySchema) {}

/* Allowlist explícita do contrato: o resultado do caso de uso nunca cruza o wire
   direto; o tipo de retorno é o do próprio `@newestetica/contracts` — divergência
   reprova no typecheck e no teste de contrato (finance.contract.int.spec). */
function toResponse(result: FinanceSummaryResult): FinanceSummaryResponse {
  return {
    from: result.from,
    to: result.to,
    currency: result.currency,
    totalCents: result.totalCents,
    count: result.count,
  };
}

/* Autenticação real (UC 4.2.1): guard do kernel — sem token válido 401, papel
   insuficiente 403 — e RBAC: rota financeira só `admin` (menor privilégio; a
   recepção não acessa o agregado monetário). */
@ApiTags("Financeiro")
@Controller("finance")
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class FinanceController {
  constructor(private readonly getFinanceSummary: GetFinanceSummaryUseCase) {}

  @Get("summary")
  @Roles("admin")
  @ApiOperation({ summary: "Resumo financeiro essencial por janela" })
  @ApiQuery({
    name: "from",
    required: true,
    description: "Início da janela (data ISO, YYYY-MM-DD).",
    schema: { type: "string", format: "date", example: "2026-09-01" },
  })
  @ApiQuery({
    name: "to",
    required: true,
    description:
      "Fim da janela (data ISO, YYYY-MM-DD; no máximo 366 dias após from).",
    schema: { type: "string", format: "date", example: "2026-09-30" },
  })
  @ApiUnauthorizedResponse({
    description: AUTH_401_DESCRIPTION,
    schema: AUTH_401_SCHEMA,
  })
  @ApiForbiddenResponse({
    description: AUTH_403_DESCRIPTION,
    schema: AUTH_403_SCHEMA,
  })
  @ApiOkResponse({
    description:
      "Resumo agregado da janela (só atendimentos com valor de pacientes visíveis).",
    type: FinanceSummaryResponseDto,
  })
  @ApiUnprocessableEntityResponse({ description: "Janela inválida." })
  async summary(
    @Query(new ZodValidationPipe(FinanceSummaryQuerySchema))
    query: FinanceSummaryQuery,
  ): Promise<FinanceSummaryResponse> {
    const result = await this.getFinanceSummary.execute(query);
    return toResponse(result);
  }
}
