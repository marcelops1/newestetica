import type { BeforeAfterCase } from "../../domain/entities/before-after-case.entity";
import type { BeforeAfterCaseRepository } from "../../domain/ports/before-after-case.repository";

/* A invariante "nada sem consentimento" vive na porta (`findConsented`) e na validação de
   saída da Presentation; filtrar de novo em memória aqui traria dados proibidos para dentro
   do processo sem necessidade (design decisão 5). */
export class ListBeforeAfterUseCase {
  constructor(private readonly cases: BeforeAfterCaseRepository) {}

  async execute(): Promise<BeforeAfterCase[]> {
    return this.cases.findConsented();
  }
}
