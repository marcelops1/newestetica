import type { BeforeAfterCase } from "../entities/before-after-case.entity";

/* O nome da porta carrega a invariante (precedente do Catálogo): não existe leitura
   pública de caso sem consentimento — `findConsented` é a única porta de listagem.
   Sem `UnitOfWork`: só leitura de entidade única (design decisão 3). */
export interface BeforeAfterCaseRepository {
  findConsented(): Promise<BeforeAfterCase[]>;
}
