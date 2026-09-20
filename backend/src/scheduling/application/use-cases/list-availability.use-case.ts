import type { Slot } from "../../domain/entities/slot.entity";
import type { SlotRepository } from "../../domain/ports/slot.repository";

export class ListAvailabilityUseCase {
  constructor(private readonly slots: SlotRepository) {}

  async execute(): Promise<Slot[]> {
    return this.slots.findAvailable();
  }
}
