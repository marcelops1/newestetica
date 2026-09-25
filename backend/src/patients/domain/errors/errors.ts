import { DomainError as SharedDomainError } from "../../../shared/errors/domain-error";

export type DomainErrorCode = "INVALID_PATIENT" | "PATIENT_NOT_FOUND";

/* Subclasse fina local sobre o kernel compartilhado (docs/architecture/02-arquitetura.md
   §3, exceção do kernel): plumbing técnico é compartilhado; o union de códigos e as
   classes concretas continuam do módulo. */
export class DomainError extends SharedDomainError<DomainErrorCode> {}

export class InvalidPatient extends DomainError {
  constructor(reason: string) {
    super("INVALID_PATIENT", `Paciente inválida: ${reason}`);
  }
}

export class PatientNotFound extends DomainError {
  /* Mensagem genérica por decisão de domínio: inexistente e anonimizada respondem
     exatamente igual (anti-enumeração — spec backend-patients); nunca ecoa id nem PII. */
  constructor() {
    super("PATIENT_NOT_FOUND", "Paciente não encontrada.");
  }
}
