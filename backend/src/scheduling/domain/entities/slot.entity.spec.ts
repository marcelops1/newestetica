import { describe, expect, it } from "vitest";
import { Slot } from "./slot.entity";
import { InvalidSlot } from "../errors/errors";

describe("Slot (entidade de domínio)", () => {
  it("cria slot válido com id, início e duração, nasce disponível", () => {
    const slot = Slot.create({
      id: "slot-1",
      start: new Date("2026-10-01T10:00:00-03:00"),
      durationMinutes: 60,
    });

    expect(slot.id).toBe("slot-1");
    expect(slot.start.toISOString()).toBe("2026-10-01T13:00:00.000Z");
    expect(slot.durationMinutes).toBe(60);
    expect(slot.available).toBe(true);
  });

  it("rejeita id vazio", () => {
    expect(() =>
      Slot.create({
        id: "",
        start: new Date("2026-10-01T10:00:00-03:00"),
        durationMinutes: 60,
      }),
    ).toThrow(InvalidSlot);
  });

  it("rejeita id só com espaços em branco (trim antes da validação)", () => {
    expect(() =>
      Slot.create({
        id: "   ",
        start: new Date("2026-10-01T10:00:00-03:00"),
        durationMinutes: 60,
      }),
    ).toThrow(InvalidSlot);
  });

  it("rejeita início inválido", () => {
    expect(() =>
      Slot.create({
        id: "slot-1",
        start: new Date("data-invalida"),
        durationMinutes: 60,
      }),
    ).toThrow(InvalidSlot);
  });

  it("rejeita duração zero ou negativa", () => {
    expect(() =>
      Slot.create({
        id: "slot-1",
        start: new Date("2026-10-01T10:00:00-03:00"),
        durationMinutes: 0,
      }),
    ).toThrow(InvalidSlot);
    expect(() =>
      Slot.create({
        id: "slot-1",
        start: new Date("2026-10-01T10:00:00-03:00"),
        durationMinutes: -30,
      }),
    ).toThrow(InvalidSlot);
  });
});
