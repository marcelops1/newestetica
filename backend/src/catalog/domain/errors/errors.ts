import { DomainError as SharedDomainError } from "../../../shared/errors/domain-error";

export type DomainErrorCode = "INVALID_PROCEDURE" | "PROCEDURE_NOT_FOUND";

/* Subclasse fina local sobre o kernel compartilhado (docs/architecture/02-arquitetura.md
   §3, exceção do kernel): plumbing técnico é compartilhado; o union de códigos e as
   classes concretas continuam do módulo. */
export class DomainError extends SharedDomainError<DomainErrorCode> {}

export class InvalidProcedure extends DomainError {
  constructor(reason: string) {
    super("INVALID_PROCEDURE", `Procedimento inválido: ${reason}`);
  }
}

export class ProcedureNotFound extends DomainError {
  /* Mensagem genérica por decisão de domínio: inexistente e inativo respondem
     exatamente igual (anti-enumeração — spec backend-catalog). */
  constructor() {
    super("PROCEDURE_NOT_FOUND", "Procedimento não encontrado.");
  }
}
