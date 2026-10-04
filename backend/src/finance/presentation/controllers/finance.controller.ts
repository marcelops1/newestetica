import { Controller, Get, Query, UseFilters, UseGuards } from "@nestjs/common";
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
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
  AUTH_NOT_IMPLEMENTED_CODE,
  AUTH_NOT_IMPLEMENTED_MESSAGE,
  IdentityPendingGuard,
} from "../../../shared/http/identity-pending.guard";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";

class FinanceSummaryResponseDto extends createZodDto(FinanceSummarySchema) {}

const FORBIDDEN_DESCRIPTION =
  "Bloqueado pelo IdentityPendingGuard: autenticação ainda não implementada para este módulo (UC 4.2.1).";
const FORBIDDEN_SCHEMA = {
  type: "object",
  properties: {
    code: { type: "string", example: AUTH_NOT_IMPLEMENTED_CODE },
    message: { type: "string", example: AUTH_NOT_IMPLEMENTED_MESSAGE },
  },
};

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

/* Guard honesto do kernel em todas as rotas (design decisão 6), sem exceção e sem
   duplicar a classe; bloqueio total até a Identidade. */
@ApiTags("Financeiro (bloqueado até a Identidade)")
@Controller("finance")
@UseGuards(IdentityPendingGuard)
@UseFilters(DomainExceptionFilter)
export class FinanceController {
  constructor(private readonly getFinanceSummary: GetFinanceSummaryUseCase) {}

  @Get("summary")
  @ApiOperation({
    summary: "Resumo financeiro essencial por janela (bloqueado até a Identidade)",
  })
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
  @ApiForbiddenResponse({
    description: FORBIDDEN_DESCRIPTION,
    schema: FORBIDDEN_SCHEMA,
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
