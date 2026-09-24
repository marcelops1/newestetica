import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { Slot } from "../../src/scheduling/domain/entities/slot.entity";
import type { SlotRepository } from "../../src/scheduling/domain/ports/slot.repository";
import type { UnitOfWork } from "../../src/scheduling/domain/ports/unit-of-work.port";
import { CreateBookingUseCase } from "../../src/scheduling/application/use-cases/create-booking.use-case";
import {
  SLOT_REPOSITORY,
  SchedulingModule,
  UNIT_OF_WORK,
} from "../../src/scheduling/scheduling.module";
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

async function seedSlot(id = "slot-1", available = true): Promise<void> {
  await prisma.slot.create({
    data: {
      id,
      start: new Date("2026-10-01T10:00:00-03:00"),
      durationMinutes: 60,
      available,
    },
  });
}

async function postBooking(slotId: string, body: unknown): Promise<Response> {
  return fetch(`${baseUrl}/slots/${slotId}/bookings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
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

describe("Scheduling HTTP (contrato da Presentation)", () => {
  it("POST /slots/:slotId/bookings com payload válido responde 201 e confirma a reserva", async () => {
    await seedSlot();

    const response = await postBooking("slot-1", validPayload);

    expect(response.status).toBe(201);
    const body = (await response.json()) as { id: string; status: string };
    expect(body).toEqual({
      id: expect.any(String),
      status: "confirmed",
      treatment: "Limpeza de pele",
      slot: {
        id: "slot-1",
        start: "2026-10-01T13:00:00.000Z",
        durationMinutes: 60,
        available: false,
      },
    });
    expect(
      (await prisma.slot.findUnique({ where: { id: "slot-1" } }))?.available,
    ).toBe(false);
    expect(await prisma.booking.count()).toBe(1);
  });

  it("reserva sem tratamento responde sem a chave treatment (minimização)", async () => {
    await seedSlot();

    const response = await postBooking("slot-1", {
      name: "Maria Exemplo",
      phone: "(11) 98765-4321",
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body).not.toHaveProperty("treatment");
    expect(body.status).toBe("confirmed");
  });

  it("payload inválido responde 422 estruturado, sem detalhes internos", async () => {
    await seedSlot();

    const response = await postBooking("slot-1", { name: "A", phone: "123" });

    expect(response.status).toBe(422);
    const body = (await response.json()) as {
      code: string;
      message: string;
      fields?: Record<string, string>;
    };
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.message.length).toBeGreaterThan(0);
    expect(body.fields).toMatchObject({
      name: expect.any(String),
      phone: expect.any(String),
    });
    expect(JSON.stringify(body)).not.toMatch(/zod|expected string|stack/i);
    expect(await prisma.booking.count()).toBe(0);
  });

  it("slot ocupado responde 409 com erro de domínio", async () => {
    await seedSlot("slot-1", false);
    await prisma.booking.create({
      data: {
        id: "booking-existente",
        slotId: "slot-1",
        patientName: "Joana Exemplo",
        patientPhone: "11988888888",
        treatment: null,
        notes: null,
        status: "confirmed",
      },
    });

    const response = await postBooking("slot-1", validPayload);

    expect(response.status).toBe(409);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("SLOT_ALREADY_BOOKED");
    expect(await prisma.booking.count()).toBe(1);
  });

  it("slot inexistente responde 404 com erro de domínio", async () => {
    const response = await postBooking("slot-inexistente", validPayload);

    expect(response.status).toBe(404);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("SLOT_NOT_FOUND");
  });

  it("erro inesperado responde 500 genérico, sem vazar detalhes internos", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SchedulingModule],
    })
      .overrideProvider(CreateBookingUseCase)
      .useValue({
        execute: async () => {
          throw new Error("detalhe interno que não pode vazar");
        },
      })
      .compile();
    const errorApp = moduleRef.createNestApplication({ logger: false });
    await errorApp.listen(0);
    const errorBaseUrl = await errorApp.getUrl();

    const response = await fetch(`${errorBaseUrl}/slots/slot-1/bookings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain(
      "detalhe interno que não pode vazar",
    );
    await errorApp.close();
  });

  it("canário de wiring: a UnitOfWork do módulo compartilha o contexto transacional com os repositórios", async () => {
    const unitOfWork = app.get<UnitOfWork>(UNIT_OF_WORK);
    const slotRepository = app.get<SlotRepository>(SLOT_REPOSITORY);

    await expect(
      unitOfWork.execute(async () => {
        await slotRepository.save(
          Slot.create({
            id: "slot-canario",
            start: new Date("2026-10-01T10:00:00-03:00"),
            durationMinutes: 60,
          }),
        );
        throw new Error("falha canário no meio da transação");
      }),
    ).rejects.toThrow("falha canário no meio da transação");

    expect(await prisma.slot.count()).toBe(0);
  });
});
