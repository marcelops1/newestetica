export type DomainErrorCode =
  | "INVALID_SLOT"
  | "INVALID_BOOKING"
  | "SLOT_NOT_FOUND"
  | "SLOT_ALREADY_BOOKED";

export class DomainError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

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
