export type DomainErrorCode = "INVALID_CONTENT" | "POST_NOT_FOUND";

/* Base local do módulo Conteúdo Público: módulos são bounded contexts independentes e não
   importam o domínio um do outro (docs/architecture/02-arquitetura.md §3) — o formato do
   erro é o mesmo dos módulos Agendamento/Catálogo, a classe não é compartilhada. */
export class DomainError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

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
