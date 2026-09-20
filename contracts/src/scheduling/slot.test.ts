import { describe, expect, it } from "vitest";
import { slotsMock } from "../../../frontend/lib/mocks/schedule";
import { SlotSchema } from "./slot";

describe("contrato de Slot (agendamento)", () => {
  it("todo slot mockado do frontend é compatível", () => {
    for (const item of slotsMock) {
      const result = SlotSchema.safeParse(item);
      expect(result.success, `slot mockado ${item.id}`).toBe(true);
    }
  });

  it("aceita slot válido com data-hora ISO com offset", () => {
    const result = SlotSchema.safeParse({
      id: "slot-exemplo",
      start: "2026-10-01T10:00:00-03:00",
      durationMinutes: 50,
      available: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita duração zero ou negativa", () => {
    expect(
      SlotSchema.safeParse({ ...slotsMock[0], durationMinutes: 0 }).success,
    ).toBe(false);
    expect(
      SlotSchema.safeParse({ ...slotsMock[0], durationMinutes: -30 }).success,
    ).toBe(false);
  });

  it("rejeita início que não é data-hora ISO", () => {
    expect(
      SlotSchema.safeParse({ ...slotsMock[0], start: "14/09/2026 09:00" })
        .success,
    ).toBe(false);
  });

  it("rejeita disponibilidade não-booleana", () => {
    expect(
      SlotSchema.safeParse({ ...slotsMock[0], available: "sim" }).success,
    ).toBe(false);
  });
});
