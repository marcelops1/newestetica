import { describe, expect, it } from "vitest";
import { CreateBookingUseCase } from "./create-booking.use-case";
import { Booking } from "../../domain/entities/booking.entity";
import { Slot } from "../../domain/entities/slot.entity";
import { SlotAlreadyBooked, SlotNotFound } from "../../domain/errors";
import { InMemorySlotRepository } from "../../../../test/fakes/in-memory-slot.repository";
import { InMemoryBookingRepository } from "../../../../test/fakes/in-memory-booking.repository";
import { FakeNotificationPort } from "../../../../test/fakes/fake-notification.port";
import { FakeUnitOfWork } from "../../../../test/fakes/fake-unit-of-work";

function makeSlot(id = "slot-1"): Slot {
  return Slot.create({
    id,
    start: new Date("2026-10-01T10:00:00-03:00"),
    durationMinutes: 60,
  });
}

class FailingSlotRepository extends InMemorySlotRepository {
  failNextSave = false;

  override async save(slot: Slot): Promise<void> {
    if (this.failNextSave) {
      this.failNextSave = false;
      throw new Error("falha simulada na persistência do slot");
    }
    return super.save(slot);
  }
}

function makeUseCase(options?: {
  slots?: Slot[];
  slotRepository?: InMemorySlotRepository;
  transactional?: boolean;
}) {
  const slots =
    options?.slotRepository ??
    new InMemorySlotRepository(options?.slots ?? [makeSlot()]);
  const bookings = new InMemoryBookingRepository();
  const notifications = new FakeNotificationPort();
  const unitOfWork = new FakeUnitOfWork(
    options?.transactional === false ? [] : [slots, bookings],
  );
  const useCase = new CreateBookingUseCase(
    slots,
    bookings,
    notifications,
    unitOfWork,
  );
  return { useCase, slots, bookings, notifications, unitOfWork };
}

describe("CreateBookingUseCase", () => {
  it("confirma booking em slot livre, persiste e notifica uma vez", async () => {
    const { useCase, slots, bookings, notifications } = makeUseCase();

    const booking = await useCase.execute({
      slotId: "slot-1",
      name: "Maria Exemplo",
      phone: "(11) 98765-4321",
      treatment: "Limpeza de pele",
    });

    expect(booking.status).toBe("confirmed");
    expect(booking.id.length).toBeGreaterThan(0);
    expect(booking.slotId).toBe("slot-1");

    expect(bookings.all()).toHaveLength(1);
    expect((await slots.findById("slot-1"))?.available).toBe(false);

    expect(notifications.confirmations).toHaveLength(1);
    expect(notifications.confirmations[0]?.bookingId).toBe(booking.id);
    expect(notifications.confirmations[0]?.patientName).toBe("Maria Exemplo");
    expect(notifications.confirmations[0]?.start.toISOString()).toBe(
      "2026-10-01T13:00:00.000Z",
    );
    expect(notifications.confirmations[0]?.durationMinutes).toBe(60);
  });

  it("preserva os campos opcionais quando fornecidos", async () => {
    const { useCase, notifications } = makeUseCase();

    const booking = await useCase.execute({
      slotId: "slot-1",
      name: "Maria Exemplo",
      phone: "11999999999",
      treatment: "Bioestimulador de Colágeno",
      notes: "Prefere período da manhã",
    });

    expect(booking.treatment).toBe("Bioestimulador de Colágeno");
    expect(booking.notes).toBe("Prefere período da manhã");
    expect(notifications.confirmations[0]?.treatment).toBe(
      "Bioestimulador de Colágeno",
    );
  });

  it("recusa slot ocupado com SlotAlreadyBooked, sem booking nem notificação", async () => {
    const occupied = Slot.restore({
      id: "slot-1",
      start: new Date("2026-10-01T10:00:00-03:00"),
      durationMinutes: 60,
      available: false,
    });
    const { useCase, bookings, notifications } = makeUseCase({
      slots: [occupied],
    });

    await expect(
      useCase.execute({
        slotId: "slot-1",
        name: "Maria Exemplo",
        phone: "11999999999",
      }),
    ).rejects.toThrow(SlotAlreadyBooked);

    expect(bookings.all()).toHaveLength(0);
    expect(notifications.confirmations).toHaveLength(0);
  });

  it("recusa slot inexistente com SlotNotFound, sem booking nem notificação", async () => {
    const { useCase, bookings, notifications } = makeUseCase();

    await expect(
      useCase.execute({
        slotId: "slot-inexistente",
        name: "Maria Exemplo",
        phone: "11999999999",
      }),
    ).rejects.toThrow(SlotNotFound);

    expect(bookings.all()).toHaveLength(0);
    expect(notifications.confirmations).toHaveLength(0);
  });

  it("N reservas paralelas no mesmo slot: exatamente uma vence, sem overbooking", async () => {
    const { useCase, slots, bookings, notifications } = makeUseCase({
      transactional: false,
    });

    const attempts = Array.from({ length: 5 }, (_, index) =>
      useCase.execute({
        slotId: "slot-1",
        name: `Paciente ${index}`,
        phone: "11999999999",
      }),
    );
    const results = await Promise.allSettled(attempts);

    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(4);
    for (const result of rejected) {
      expect((result as PromiseRejectedResult).reason).toBeInstanceOf(
        SlotAlreadyBooked,
      );
    }

    expect(bookings.all()).toHaveLength(1);
    expect(bookings.all()[0]?.status).toBe("confirmed");
    expect((await slots.findById("slot-1"))?.available).toBe(false);
    expect(notifications.confirmations).toHaveLength(1);
  });

  it("falha na segunda persistência faz rollback total, sem save parcial nem notificação", async () => {
    const slots = new FailingSlotRepository([makeSlot()]);
    const { useCase, bookings, notifications, unitOfWork } = makeUseCase({
      slotRepository: slots,
    });
    slots.failNextSave = true;

    await expect(
      useCase.execute({
        slotId: "slot-1",
        name: "Maria Exemplo",
        phone: "11999999999",
      }),
    ).rejects.toThrow("falha simulada na persistência do slot");

    expect(unitOfWork.executions).toBe(1);
    expect(bookings.all()).toHaveLength(0);
    expect((await slots.findById("slot-1"))?.available).toBe(true);
    expect(notifications.confirmations).toHaveLength(0);
  });

  it("conflito de constraint dentro da unidade de trabalho não deixa estado parcial", async () => {
    const { useCase, slots, bookings, notifications, unitOfWork } =
      makeUseCase();

    const existing = Booking.create({
      id: "booking-existente",
      slotId: "slot-1",
      patientName: "Joana Exemplo",
      patientPhone: "11988888888",
    });
    existing.confirm(makeSlot());
    await bookings.save(existing);

    await expect(
      useCase.execute({
        slotId: "slot-1",
        name: "Maria Exemplo",
        phone: "11999999999",
      }),
    ).rejects.toThrow(SlotAlreadyBooked);

    expect(unitOfWork.executions).toBe(1);
    expect(bookings.all()).toHaveLength(1);
    expect(bookings.all()[0]?.id).toBe("booking-existente");
    expect((await slots.findById("slot-1"))?.available).toBe(true);
    expect(notifications.confirmations).toHaveLength(0);
  });
});
