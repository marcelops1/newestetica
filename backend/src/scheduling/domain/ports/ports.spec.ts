import { describe, expect, it } from "vitest";
import { Booking } from "../entities/booking.entity";
import { Slot } from "../entities/slot.entity";
import { SlotAlreadyBooked } from "../errors";
import { InMemorySlotRepository } from "../../../../test/fakes/in-memory-slot.repository";
import { InMemoryBookingRepository } from "../../../../test/fakes/in-memory-booking.repository";
import { FakeNotificationPort } from "../../../../test/fakes/fake-notification.port";

function makeSlot(id = "slot-1"): Slot {
  return Slot.create({
    id,
    start: new Date("2026-10-01T10:00:00-03:00"),
    durationMinutes: 60,
  });
}

describe("portas do Domain (interfaces implementáveis)", () => {
  it("o fake manual cumpre SlotRepository: save, findById e findAvailable", async () => {
    const repository = new InMemorySlotRepository();
    const slot = makeSlot();

    await repository.save(slot);

    const loaded = await repository.findById(slot.id);
    expect(loaded?.id).toBe("slot-1");
    expect(loaded?.available).toBe(true);
    expect(await repository.findAvailable()).toHaveLength(1);
  });

  it("o fake manual cumpre BookingRepository aplicando a unicidade por slot", async () => {
    const repository = new InMemoryBookingRepository();
    const first = Booking.create({
      id: "booking-1",
      slotId: "slot-1",
      patientName: "Maria Exemplo",
      patientPhone: "11999999999",
    });
    first.confirm(makeSlot());
    await repository.save(first);

    const second = Booking.create({
      id: "booking-2",
      slotId: "slot-1",
      patientName: "Joana Exemplo",
      patientPhone: "11988888888",
    });
    second.confirm(makeSlot());

    await expect(repository.save(second)).rejects.toThrow(SlotAlreadyBooked);
    expect(repository.all()).toHaveLength(1);
  });

  it("o fake de notificação registra as confirmações enviadas", async () => {
    const notification = new FakeNotificationPort();

    await notification.sendBookingConfirmation({
      bookingId: "booking-1",
      patientName: "Maria Exemplo",
      patientPhone: "11999999999",
      treatment: "Limpeza de pele",
      start: new Date("2026-10-01T10:00:00-03:00"),
      durationMinutes: 60,
    });

    expect(notification.confirmations).toHaveLength(1);
    expect(notification.confirmations[0]?.bookingId).toBe("booking-1");
  });

  it("erros de domínio carregam código estável", () => {
    const error = new SlotAlreadyBooked("slot-1");

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("SLOT_ALREADY_BOOKED");
  });
});
