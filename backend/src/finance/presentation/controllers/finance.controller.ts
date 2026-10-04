import { Controller, Get, Query, UseFilters, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { FinanceSummaryQuerySchema } from "@newestetica/contracts";
import { GetFinanceSummaryUseCase } from "../../application/use-cases/get-finance-summary.use-case";
import {
  IdentityPendingGuard,
} from "../../../shared/http/identity-pending.guard";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";

type FinanceSummaryScaffoldResponse = {
  currency: "BRL";
  totalCents: number;
  count: number;
};

/* Scaffold frágil PLANEJADO (docs/07 §14.8): a janela ecoada e os decorators
   completos de Swagger fecham na task 5.6; o RED da task 5.3 provou que o guard
   (aplicado na 5.4) é a barreira real do acesso. */
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
  @ApiUnprocessableEntityResponse({ description: "Janela inválida." })
  async summary(
    @Query(new ZodValidationPipe(FinanceSummaryQuerySchema))
    query: { from: string; to: string },
  ): Promise<FinanceSummaryScaffoldResponse> {
    const result = await this.getFinanceSummary.execute(query);
    return {
      currency: result.currency,
      totalCents: result.totalCents,
      count: result.count,
    };
  }
}
