import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { BookingInputSchema, SlotSchema } from "@newestetica/contracts";
import { SchedulingModule } from "../../src/scheduling/scheduling.module";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const validPayload = {
  name: "Maria Exemplo",
  phone: "(11) 98765-4321",
  treatment: "Limpeza de pele",
};

async function seedSlot(id: string, available: boolean): Promise<void> {
  await prisma.slot.create({
    data: {
      id,
      start: new Date("2026-10-01T10:00:00-03:00"),
      durationMinutes: 60,
      available,
    },
  });
}

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  app = await NestFactory.create(SchedulingModule, { logger: false });
  await app.listen(0);
  baseUrl = await app.getUrl();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("saída da API conforme os contratos (verificação nas duas pontas)", () => {
  it("a disponibilidade responde no formato do SlotSchema, só com slots livres", async () => {
    await seedSlot("slot-livre", true);
    await seedSlot("slot-ocupado", false);

    const response = await fetch(`${baseUrl}/slots/available`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);

    for (const item of body) {
      const parsed = SlotSchema.safeParse(item);
      expect(parsed.success, JSON.stringify(item)).toBe(true);
    }
    expect((body[0] as { id: string }).id).toBe("slot-livre");
  });

  it("a reserva responde com o slot no formato do SlotSchema e ocupado", async () => {
    await seedSlot("slot-1", true);

    const response = await fetch(`${baseUrl}/slots/slot-1/bookings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      status: string;
      slot?: unknown;
    };

    expect(body.status).toBe("confirmed");
    const parsed = SlotSchema.safeParse(body.slot);
    expect(parsed.success, JSON.stringify(body.slot)).toBe(true);
    expect((body.slot as { available: boolean }).available).toBe(false);

    expect(BookingInputSchema.safeParse(validPayload).success).toBe(true);
  });
});
