import { InvalidSlot, SlotAlreadyBooked } from "../errors";

export type SlotProps = {
  id: string;
  start: Date;
  durationMinutes: number;
};

export type SlotSnapshot = SlotProps & {
  available: boolean;
};

export class Slot {
  private constructor(private readonly props: SlotSnapshot) {}

  static create(props: SlotProps): Slot {
    const snapshot = { ...props, available: true };
    Slot.validate(snapshot);
    return new Slot(snapshot);
  }

  static restore(snapshot: SlotSnapshot): Slot {
    Slot.validate(snapshot);
    return new Slot(snapshot);
  }

  private static validate(props: SlotSnapshot): void {
    if (props.id.trim().length === 0) {
      throw new InvalidSlot("id não pode ser vazio");
    }
    if (!(props.start instanceof Date) || Number.isNaN(props.start.getTime())) {
      throw new InvalidSlot("início precisa ser uma data válida");
    }
    if (
      !Number.isInteger(props.durationMinutes) ||
      props.durationMinutes <= 0
    ) {
      throw new InvalidSlot("duração precisa ser um inteiro positivo");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get start(): Date {
    return this.props.start;
  }

  get durationMinutes(): number {
    return this.props.durationMinutes;
  }

  get available(): boolean {
    return this.props.available;
  }

  occupy(): void {
    if (!this.props.available) {
      throw new SlotAlreadyBooked(this.id);
    }
    this.props.available = false;
  }
}
