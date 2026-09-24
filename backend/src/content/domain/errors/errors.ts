import { DomainError as SharedDomainError } from "../../../shared/errors/domain-error";

export type DomainErrorCode = "INVALID_CONTENT" | "POST_NOT_FOUND";

/* Subclasse fina local sobre o kernel compartilhado (docs/architecture/02-arquitetura.md
   §3, exceção do kernel): plumbing técnico é compartilhado; o union de códigos e as
   classes concretas continuam do módulo. */
export class DomainError extends SharedDomainError<DomainErrorCode> {}

export class InvalidContent extends DomainError {
  constructor(reason: string) {
    super("INVALID_CONTENT", `Conteúdo inválido: ${reason}`);
  }
}

export class PostNotFound extends DomainError {
  /* Mensagem genérica por decisão de domínio: não enumera slugs existentes
     (anti-enumeração — spec backend-content). */
  constructor() {
    super("POST_NOT_FOUND", "Post não encontrado.");
  }
}
