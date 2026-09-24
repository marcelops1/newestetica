import { DomainError as SharedDomainError } from "../../../shared/errors/domain-error";

export type DomainErrorCode =
  "INVALID_SLOT" | "INVALID_BOOKING" | "SLOT_NOT_FOUND" | "SLOT_ALREADY_BOOKED";

/* Subclasse fina local sobre o kernel compartilhado (docs/architecture/02-arquitetura.md
   §3, exceção do kernel): plumbing técnico é compartilhado; o union de códigos e as
   classes concretas continuam do módulo. */
export class DomainError extends SharedDomainError<DomainErrorCode> {}

export class InvalidSlot extends DomainError {
  constructor(reason: string) {
    super("INVALID_SLOT", `Slot inválido: ${reason}`);
  }
}

export class InvalidBooking extends DomainError {
  constructor(reason: string) {
    super("INVALID_BOOKING", `Booking inválida: ${reason}`);
  }
}

export class SlotNotFound extends DomainError {
  constructor(id: string) {
    super("SLOT_NOT_FOUND", `Slot não encontrado: ${id}`);
  }
}

export class SlotAlreadyBooked extends DomainError {
  constructor(id: string) {
    super("SLOT_ALREADY_BOOKED", `Slot já reservado: ${id}`);
  }
}
