export type DomainErrorCode = "INVALID_PROCEDURE" | "PROCEDURE_NOT_FOUND";

/* Base local do módulo Catálogo: módulos são bounded contexts independentes e não
   importam o domínio um do outro (docs/architecture/02-arquitetura.md §3) — o formato
   do erro é o mesmo do módulo Agendamento, a classe não é compartilhada. */
export class DomainError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidProcedure extends DomainError {
  constructor(reason: string) {
    super("INVALID_PROCEDURE", `Procedimento inválido: ${reason}`);
  }
}

export class ProcedureNotFound extends DomainError {
  constructor(slug: string) {
    super("PROCEDURE_NOT_FOUND", `Procedimento não encontrado: ${slug}`);
  }
}
