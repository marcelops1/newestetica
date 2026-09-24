import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { CreateBookingUseCase } from "../../src/scheduling/application/use-cases/create-booking.use-case";
import { Slot } from "../../src/scheduling/domain/entities/slot.entity";
import { SlotAlreadyBooked } from "../../src/scheduling/domain/errors/errors";
import type { UnitOfWork } from "../../src/scheduling/domain/ports/unit-of-work.port";
import { PrismaBookingRepository } from "../../src/scheduling/infrastructure/persistence/booking.repository.impl";
import { PrismaSlotRepository } from "../../src/scheduling/infrastructure/persistence/slot.repository.impl";
import { PrismaTransactionContext } from "../../src/scheduling/infrastructure/persistence/transaction-context";
import { FakeNotificationPort } from "../fakes/fake-notification.port";
import { createTestPrismaClient, resetDatabase } from "./database";

const prisma = createTestPrismaClient();
const transactionContext = new PrismaTransactionContext();
const slotRepository = new PrismaSlotRepository(prisma, transactionContext);
const bookingRepository = new PrismaBookingRepository(
  prisma,
  transactionContext,
);

const passThroughUnitOfWork: UnitOfWork = {
  execute: (work) => work(),
};

function makeSlot(): Slot {
  return Slot.create({
    id: "slot-1",
    start: new Date("2026-10-01T10:00:00-03:00"),
    durationMinutes: 60,
  });
}

async function runRace(attempts: number) {
  const notifications = new FakeNotificationPort();
  const useCase = new CreateBookingUseCase(
    slotRepository,
    bookingRepository,
    notifications,
    passThroughUnitOfWork,
  );
  const results = await Promise.allSettled(
    Array.from({ length: attempts }, (_, index) =>
      useCase.execute({
        slotId: "slot-1",
        name: `Paciente ${index}`,
        phone: "11999999999",
      }),
    ),
  );
  return { results, notifications };
}

beforeEach(async () => {
  await resetDatabase(prisma);
  await slotRepository.save(makeSlot());
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("concorrência real no Postgres (sem overbooking)", () => {
  it("N reservas paralelas: exatamente uma vence e as demais recebem SlotAlreadyBooked", async () => {
    const { results, notifications } = await runRace(5);

    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(4);
    for (const result of rejected) {
      expect((result as PromiseRejectedResult).reason).toBeInstanceOf(
        SlotAlreadyBooked,
      );
    }

    expect(await prisma.booking.count({ where: { status: "confirmed" } })).toBe(
      1,
    );
    expect((await slotRepository.findById("slot-1"))?.available).toBe(false);
    expect(notifications.confirmations).toHaveLength(1);
  });

  it("índice parcial como executor final: 3 corridas seguidas, sempre exatamente uma vencedora", async () => {
    for (let round = 0; round < 3; round += 1) {
      await resetDatabase(prisma);
      await slotRepository.save(makeSlot());

      const { results } = await runRace(5);

      expect(
        results.filter((result) => result.status === "fulfilled"),
        `rodada ${round + 1}`,
      ).toHaveLength(1);
      expect(
        results.filter((result) => result.status === "rejected"),
        `rodada ${round + 1}`,
      ).toHaveLength(4);
      expect(await prisma.booking.count()).toBe(1);
      expect((await slotRepository.findById("slot-1"))?.available).toBe(false);
    }
  });
});
