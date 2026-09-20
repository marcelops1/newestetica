import type { Slot as SlotRecord } from "../../../../generated/prisma/client";
import { Slot, type SlotSnapshot } from "../../../domain/entities/slot.entity";

export function toSlotDomain(record: SlotRecord): Slot {
  return Slot.restore({
    id: record.id,
    start: record.start,
    durationMinutes: record.durationMinutes,
    available: record.available,
  });
}

export function toSlotPersistence(slot: Slot): SlotSnapshot {
  return {
    id: slot.id,
    start: slot.start,
    durationMinutes: slot.durationMinutes,
    available: slot.available,
  };
}
