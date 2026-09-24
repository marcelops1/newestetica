import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Prisma } from "../../src/generated/prisma/client";
import { Booking } from "../../src/scheduling/domain/entities/booking.entity";
import { Slot } from "../../src/scheduling/domain/entities/slot.entity";
import { SlotAlreadyBooked } from "../../src/scheduling/domain/errors/errors";
import { PrismaBookingRepository } from "../../src/scheduling/infrastructure/persistence/booking.repository.impl";
import { PrismaSlotRepository } from "../../src/scheduling/infrastructure/persistence/slot.repository.impl";
import { PrismaTransactionContext } from "../../src/scheduling/infrastructure/persistence/unit-of-work/transaction-context";
import { createTestPrismaClient, resetDatabase } from "./database";

const prisma = createTestPrismaClient();
const transactionContext = new PrismaTransactionContext();
const slotRepository = new PrismaSlotRepository(prisma, transactionContext);
const bookingRepository = new PrismaBookingRepository(
  prisma,
  transactionContext,
);

function makeSlot(id = "slot-1"): Slot {
  return Slot.create({
    id,
    start: new Date("2026-10-01T10:00:00-03:00"),
    durationMinutes: 60,
  });
}

function makeConfirmedBooking(id: string, slot: Slot, notes?: string): Booking {
  const booking = Booking.create({
    id,
    slotId: slot.id,
    patientName: "Maria Exemplo",
    patientPhone: "(11) 98765-4321",
    treatment: "Limpeza de pele",
    ...(notes !== undefined ? { notes } : {}),
  });
  booking.confirm(slot);
  return booking;
}

beforeEach(async () => {
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaBookingRepository (integração com Postgres real)", () => {
  it("persiste booking confirmada e a ocupação do slot entre operações", async () => {
    const slot = makeSlot();
    await slotRepository.save(slot);
    const booking = makeConfirmedBooking(
      "booking-1",
      slot,
      "Prefere período da manhã",
    );
    await slotRepository.save(slot);

    await bookingRepository.save(booking);

    const record = await prisma.booking.findUnique({
      where: { id: "booking-1" },
    });
    expect(record?.slotId).toBe("slot-1");
    expect(record?.status).toBe("confirmed");
    expect(record?.patientName).toBe("Maria Exemplo");
    expect(record?.patientPhone).toBe("(11) 98765-4321");
    expect(record?.treatment).toBe("Limpeza de pele");
    expect(record?.notes).toBe("Prefere período da manhã");
    expect((await slotRepository.findById("slot-1"))?.available).toBe(false);
  });

  it("rejeita segunda booking confirmada no mesmo slot com SlotAlreadyBooked", async () => {
    const slot = makeSlot();
    await slotRepository.save(slot);
    const first = makeConfirmedBooking("booking-1", slot);
    await bookingRepository.save(first);

    const second = makeConfirmedBooking("booking-2", makeSlot());

    await expect(bookingRepository.save(second)).rejects.toThrow(
      SlotAlreadyBooked,
    );
    expect(await prisma.booking.count()).toBe(1);
  });

  it("aceita bookings confirmadas em slots diferentes", async () => {
    const first = makeConfirmedBooking("booking-1", makeSlot("slot-1"));
    const second = makeConfirmedBooking("booking-2", makeSlot("slot-2"));
    await slotRepository.save(makeSlot("slot-1"));
    await slotRepository.save(makeSlot("slot-2"));

    await bookingRepository.save(first);
    await bookingRepository.save(second);

    expect(await prisma.booking.count()).toBe(2);
  });

  it("propaga erro não-único do Prisma cru (FK violada não vira conflito de slot)", async () => {
    const booking = makeConfirmedBooking(
      "booking-1",
      makeSlot("slot-inexistente"),
    );

    let caught: unknown;
    try {
      await bookingRepository.save(booking);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    expect((caught as { code: string }).code).toBe("P2003");
    expect(caught).not.toBeInstanceOf(SlotAlreadyBooked);
  });
});
