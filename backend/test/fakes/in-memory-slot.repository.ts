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
      .map((record) => Slot.restore(this.copy(record)));
  }

  async findById(id: string): Promise<Slot | null> {
    const record = this.slots.get(id);
    return record ? Slot.restore(this.copy(record)) : null;
  }

  async save(slot: Slot): Promise<void> {
    this.store(slot);
  }

  snapshot(): SlotSnapshot[] {
    return [...this.slots.values()].map((record) => ({
      ...record,
      start: new Date(record.start),
    }));
  }

  restore(snapshot: unknown): void {
    const records = snapshot as SlotSnapshot[];
    this.slots.clear();
    for (const record of records) {
      this.slots.set(record.id, { ...record, start: new Date(record.start) });
    }
  }

  private copy(record: SlotSnapshot): SlotSnapshot {
    return { ...record, start: new Date(record.start) };
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
