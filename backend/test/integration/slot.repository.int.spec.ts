import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { Slot } from "../../src/scheduling/domain/entities/slot.entity";
import { PrismaSlotRepository } from "../../src/scheduling/infrastructure/persistence/slot.repository.impl";
import { PrismaTransactionContext } from "../../src/scheduling/infrastructure/persistence/transaction-context";
import { createTestPrismaClient, resetDatabase } from "./database";

const prisma = createTestPrismaClient();
const transactionContext = new PrismaTransactionContext();
const repository = new PrismaSlotRepository(prisma, transactionContext);

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

describe("PrismaSlotRepository (integração com Postgres real)", () => {
  it("faz round-trip de um slot íntegro", async () => {
    await repository.save(makeSlot());

    const loaded = await repository.findById("slot-1");

    expect(loaded?.id).toBe("slot-1");
    expect(loaded?.start.toISOString()).toBe("2026-10-01T13:00:00.000Z");
    expect(loaded?.durationMinutes).toBe(60);
    expect(loaded?.available).toBe(true);
  });

  it("retorna null para slot inexistente", async () => {
    await expect(repository.findById("slot-inexistente")).resolves.toBeNull();
  });

  it("lista somente os slots disponíveis", async () => {
    await repository.save(makeSlot("slot-livre"));
    await repository.save(
      Slot.restore({
        id: "slot-ocupado",
        start: new Date("2026-10-01T11:00:00-03:00"),
        durationMinutes: 60,
        available: false,
      }),
    );

    const available = await repository.findAvailable();

    expect(available.map((slot) => slot.id)).toEqual(["slot-livre"]);
  });

  it("persiste a ocupação do slot entre operações", async () => {
    const slot = makeSlot();
    await repository.save(slot);

    slot.occupy();
    await repository.save(slot);

    expect((await repository.findById("slot-1"))?.available).toBe(false);
  });
});
