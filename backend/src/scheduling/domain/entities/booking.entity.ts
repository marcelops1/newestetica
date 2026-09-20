import { InvalidBooking } from "../errors";
import type { Slot } from "./slot.entity";

export type BookingStatus = "pending" | "confirmed";

export type BookingProps = {
  id: string;
  slotId: string;
  patientName: string;
  patientPhone: string;
  treatment?: string;
  notes?: string;
};

export type BookingSnapshot = BookingProps & {
  status: BookingStatus;
};

export class Booking {
  private constructor(private readonly props: BookingSnapshot) {}

  static create(props: BookingProps): Booking {
    const snapshot: BookingSnapshot = { ...props, status: "pending" };
    Booking.validate(snapshot);
    return new Booking(snapshot);
  }

  static restore(snapshot: BookingSnapshot): Booking {
    Booking.validate(snapshot);
    return new Booking(snapshot);
  }

  private static validate(props: BookingSnapshot): void {
    if (props.id.trim().length === 0) {
      throw new InvalidBooking("id não pode ser vazio");
    }
    if (props.slotId.trim().length === 0) {
      throw new InvalidBooking("slotId não pode ser vazio");
    }
    if (props.patientName.trim().length === 0) {
      throw new InvalidBooking("nome da paciente não pode ser vazio");
    }
    if (props.patientPhone.trim().length === 0) {
      throw new InvalidBooking("telefone da paciente não pode ser vazio");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get slotId(): string {
    return this.props.slotId;
  }

  get patientName(): string {
    return this.props.patientName;
  }

  get patientPhone(): string {
    return this.props.patientPhone;
  }

  get treatment(): string | undefined {
    return this.props.treatment;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get status(): BookingStatus {
    return this.props.status;
  }

  confirm(slot: Slot): void {
    if (this.props.status !== "pending") {
      throw new InvalidBooking("booking já confirmada");
    }
    slot.occupy();
    this.props.status = "confirmed";
  }
}
