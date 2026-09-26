import { DomainError as SharedDomainError } from "../../../shared/errors/domain-error";

export type DomainErrorCode =
  "INVALID_ATTENDANCE" | "PATIENT_NOT_FOUND" | "ATTENDANCE_NOT_FOUND";

/* Subclasse fina local sobre o kernel compartilhado (docs/architecture/02-arquitetura.md
   §3, exceção do kernel): o union de códigos e as classes concretas continuam do módulo. */
export class DomainError extends SharedDomainError<DomainErrorCode> {}

export class InvalidAttendance extends DomainError {
  constructor(reason: string) {
    super("INVALID_ATTENDANCE", `Atendimento inválido: ${reason}`);
  }
}

/* Mensagens genéricas por decisão de domínio: paciente inexistente e anonimizada
   respondem exatamente igual (anti-enumeração — spec backend-attendance); nunca ecoam
   id nem PII. Paciente invisível é 404 também no registro (nada se cria). */
export class PatientNotFound extends DomainError {
  constructor() {
    super("PATIENT_NOT_FOUND", "Paciente não encontrada.");
  }
}

/* Atendimento invisível cobre inexistente, de outra paciente e o cenário raro de a
   paciente ter sido anonimizada entre a checagem e a query — sempre o mesmo 404. */
export class AttendanceNotFound extends DomainError {
  constructor() {
    super("ATTENDANCE_NOT_FOUND", "Atendimento não encontrado.");
  }
}
