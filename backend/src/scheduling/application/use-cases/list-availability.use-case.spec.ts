import { describe, expect, it } from "vitest";
import { ListAvailabilityUseCase } from "./list-availability.use-case";
import { Slot } from "../../domain/entities/slot.entity";
import { InMemorySlotRepository } from "../../../../test/fakes/in-memory-slot.repository";

function makeSlot(id: string, available: boolean): Slot {
  const base = {
    id,
    start: new Date("2026-10-01T10:00:00-03:00"),
    durationMinutes: 60,
  };
  return available ? Slot.create(base) : Slot.restore({ ...base, available });
}

describe("ListAvailabilityUseCase", () => {
  it("retorna somente os slots disponíveis", async () => {
    const slots = new InMemorySlotRepository([
      makeSlot("slot-1", true),
      makeSlot("slot-2", false),
      makeSlot("slot-3", true),
    ]);
    const useCase = new ListAvailabilityUseCase(slots);

    const result = await useCase.execute();

    expect(result.map((slot) => slot.id)).toEqual(["slot-1", "slot-3"]);
    expect(result.every((slot) => slot.available)).toBe(true);
  });

  it("retorna lista vazia quando não há disponibilidade", async () => {
    const slots = new InMemorySlotRepository([makeSlot("slot-2", false)]);
    const useCase = new ListAvailabilityUseCase(slots);

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
