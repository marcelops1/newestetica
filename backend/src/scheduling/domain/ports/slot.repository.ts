import type { Slot } from "../entities/slot.entity";

export interface SlotRepository {
  findAvailable(): Promise<Slot[]>;
  findById(id: string): Promise<Slot | null>;
  save(slot: Slot): Promise<void>;
}
