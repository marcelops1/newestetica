import { describe, expect, it } from "vitest";
import { Booking } from "../entities/booking.entity";
import { Slot } from "../entities/slot.entity";
import { SlotAlreadyBooked } from "../errors/errors";

function makeSlot(): Slot {
  return Slot.create({
    id: "slot-1",
    start: new Date("2026-10-01T10:00:00-03:00"),
    durationMinutes: 60,
  });
}

function makeBooking(id: string, slotId: string): Booking {
  return Booking.create({
    id,
    slotId,
    patientName: "Maria Exemplo",
    patientPhone: "(11) 98765-4321",
  });
}

describe("regra de não-overbooking (invariante do domínio)", () => {
  it("slot sem booking confirma normalmente", () => {
    const slot = makeSlot();
    const booking = makeBooking("booking-1", slot.id);

    booking.confirm(slot);

    expect(booking.status).toBe("confirmed");
    expect(slot.available).toBe(false);
  });

  it("segunda booking no mesmo slot é recusada com SlotAlreadyBooked", () => {
    const slot = makeSlot();
    const first = makeBooking("booking-1", slot.id);
    const second = makeBooking("booking-2", slot.id);

    first.confirm(slot);

    expect(() => second.confirm(slot)).toThrow(SlotAlreadyBooked);
    expect(second.status).toBe("pending");
    expect(slot.available).toBe(false);
  });

  it("slot já ocupado recusa nova ocupação direta", () => {
    const slot = makeSlot();

    slot.occupy();

    expect(() => slot.occupy()).toThrow(SlotAlreadyBooked);
  });
});
