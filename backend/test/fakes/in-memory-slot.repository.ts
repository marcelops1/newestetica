import {
  Slot,
  type SlotSnapshot,
} from "../../src/scheduling/domain/entities/slot.entity";
import type { SlotRepository } from "../../src/scheduling/domain/ports/slot.repository";

export class InMemorySlotRepository implements SlotRepository {
  private readonly slots = new Map<string, SlotSnapshot>();

  constructor(initial: Slot[] = []) {
    for (const slot of initial) {
      this.store(slot);
    }
  }

  async findAvailable(): Promise<Slot[]> {
    return [...this.slots.values()]
      .filter((record) => record.available)
      .map((record) => Slot.restore(record));
  }

  async findById(id: string): Promise<Slot | null> {
    const record = this.slots.get(id);
    return record ? Slot.restore(record) : null;
  }

  async save(slot: Slot): Promise<void> {
    this.store(slot);
  }

  private store(slot: Slot): void {
    this.slots.set(slot.id, {
      id: slot.id,
      start: new Date(slot.start),
      durationMinutes: slot.durationMinutes,
      available: slot.available,
    });
  }
}
