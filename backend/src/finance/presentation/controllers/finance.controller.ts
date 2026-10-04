import { Controller, Get, Query, UseFilters } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { FinanceSummaryQuerySchema } from "@newestetica/contracts";
import { GetFinanceSummaryUseCase } from "../../application/use-cases/get-finance-summary.use-case";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";

type FinanceSummaryScaffoldResponse = {
  currency: "BRL";
  totalCents: number;
  count: number;
};

/* Scaffold frágil PLANEJADO (docs/07 §14.8): a rota nasce sem o guard e com o formato
   de saída parcial — o guard entra na task 5.4 e a janela ecoada + decorators de
   Swagger fecham na task 5.6; os REDs de 5.3 e 5.5 provam que proteção e contrato são
   barreiras reais, não presumidas. */
@ApiTags("Financeiro (bloqueado até a Identidade)")
@Controller("finance")
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
