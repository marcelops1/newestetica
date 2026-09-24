import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { CreateBookingUseCase } from "../../src/scheduling/application/use-cases/create-booking.use-case";
import { Slot } from "../../src/scheduling/domain/entities/slot.entity";
import { SlotAlreadyBooked } from "../../src/scheduling/domain/errors/errors";
import { PrismaBookingRepository } from "../../src/scheduling/infrastructure/persistence/booking.repository.impl";
import { PrismaSlotRepository } from "../../src/scheduling/infrastructure/persistence/slot.repository.impl";
import { PrismaTransactionContext } from "../../src/scheduling/infrastructure/persistence/unit-of-work/transaction-context";
import { PrismaUnitOfWork } from "../../src/scheduling/infrastructure/persistence/unit-of-work/prisma-unit-of-work";
import { FakeNotificationPort } from "../fakes/fake-notification.port";
import { createTestPrismaClient, resetDatabase } from "./database";

const prisma = createTestPrismaClient();
const transactionContext = new PrismaTransactionContext();
const slotRepository = new PrismaSlotRepository(prisma, transactionContext);
const bookingRepository = new PrismaBookingRepository(
  prisma,
  transactionContext,
);
const unitOfWork = new PrismaUnitOfWork(prisma, transactionContext);

function makeSlot(id = "slot-1"): Slot {
  return Slot.create({
    id,
    start: new Date("2026-10-01T10:00:00-03:00"),
    durationMinutes: 60,
  });
}

beforeEach(async () => {
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaUnitOfWork (atomicidade real contra Postgres)", () => {
  it("write-then-throw: a escrita dentro da unidade de trabalho não persiste após o rollback", async () => {
    await expect(
      unitOfWork.execute(async () => {
        await slotRepository.save(makeSlot());
        throw new Error("falha simulada no meio da transação");
      }),
    ).rejects.toThrow("falha simulada no meio da transação");

    expect(await slotRepository.findById("slot-1")).toBeNull();
    expect(await prisma.slot.count()).toBe(0);
  });

  it("commit: a escrita dentro da unidade de trabalho persiste", async () => {
    await unitOfWork.execute(async () => {
      await slotRepository.save(makeSlot());
    });

    expect(await prisma.slot.count()).toBe(1);
  });

  it("corrida de ponta a ponta com a unidade de trabalho real: exatamente uma reserva vence", async () => {
    await slotRepository.save(makeSlot());
    const notifications = new FakeNotificationPort();
    const useCase = new CreateBookingUseCase(
      slotRepository,
      bookingRepository,
      notifications,
      unitOfWork,
    );

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, index) =>
        useCase.execute({
          slotId: "slot-1",
          name: `Paciente ${index}`,
          phone: "11999999999",
        }),
      ),
    );

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    const rejected = results.filter((result) => result.status === "rejected");
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
});
