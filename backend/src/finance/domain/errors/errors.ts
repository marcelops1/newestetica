import { DomainError as SharedDomainError } from "../../../shared/errors/domain-error";

/* Vocabulário de erro local sobre o kernel compartilhado (docs/architecture/02 §3):
   Financeiro só tem erro de validação de janela — mensagens fixas, sem eco. */
export type DomainErrorCode = "INVALID_FINANCE_WINDOW";

export class DomainError extends SharedDomainError<DomainErrorCode> {}

export class InvalidFinanceWindow extends DomainError {
  constructor(reason: string) {
    super("INVALID_FINANCE_WINDOW", `Janela financeira inválida: ${reason}`);
  }
}
