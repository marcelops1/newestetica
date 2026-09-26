import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AttendanceSchema } from "@newestetica/contracts";
import { AttendanceModule } from "../../src/attendance/attendance.module";
import { IdentityPendingGuard } from "../../src/shared/http/identity-pending.guard";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ALFA = "00000000-0000-4000-8000-000000000101";
const ATTENDANCE_ID = "00000000-0000-4000-8000-000000000201";
const ATTENDANCE_KEYS = [
  "createdAt",
  "id",
  "patientId",
  "performedAt",
  "summary",
  "updatedAt",
];

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  const moduleRef = await Test.createTestingModule({
    imports: [AttendanceModule],
  })
    .overrideGuard(IdentityPendingGuard)
    .useValue({ canActivate: () => true })
    .compile();
  app = moduleRef.createNestApplication({ logger: false });
  await app.listen(0);
  baseUrl = await app.getUrl();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDatabase(prisma);
  await prisma.patient.create({
    data: {
      id: ALFA,
      fullName: "Paciente Fictícia Ilustrativa",
      phone: "(11) 5555-0001",
      purpose: "Cadastro fictício para teste",
      status: "active",
      updatedAt: new Date(),
    },
  });
  await prisma.attendance.create({
    data: {
      id: ATTENDANCE_ID,
      patientId: ALFA,
      summary: "Atendimento fictício.",
      performedAt: new Date("2026-09-10T14:30:00.000Z"),
      updatedAt: new Date(),
    },
  });
});

describe("saída de atendimentos conforme o contrato (verificação nas duas pontas)", () => {
  it("o detalhe responde no AttendanceSchema, com chaves exatas", async () => {
    const response = await fetch(
      `${baseUrl}/patients/${ALFA}/attendances/${ATTENDANCE_ID}`,
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(AttendanceSchema.safeParse(body).success, JSON.stringify(body)).toBe(
      true,
    );
    expect(Object.keys(body).sort()).toEqual(ATTENDANCE_KEYS);
  });

  it("a listagem responde no AttendanceSchema, com chaves exatas em cada item", async () => {
    const response = await fetch(`${baseUrl}/patients/${ALFA}/attendances`);
    const body = (await response.json()) as Array<Record<string, unknown>>;

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    for (const item of body) {
      expect(
        AttendanceSchema.safeParse(item).success,
        JSON.stringify(item),
      ).toBe(true);
      expect(Object.keys(item).sort()).toEqual(ATTENDANCE_KEYS);
    }
  });

  it("o registro responde no AttendanceSchema com o vínculo do path", async () => {
    const response = await fetch(`${baseUrl}/patients/${ALFA}/attendances`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        summary: "Hidratação facial realizada, pele bem tolerada.",
        performedAt: "2026-09-12T10:00:00.000Z",
      }),
    });
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(201);
    expect(AttendanceSchema.safeParse(body).success, JSON.stringify(body)).toBe(
      true,
    );
    expect(Object.keys(body).sort()).toEqual(ATTENDANCE_KEYS);
    expect(body.patientId).toBe(ALFA);
  });

  it("nenhum campo interno vaza para o wire (sem nome de paciente, sem timestamps extras)", async () => {
    const response = await fetch(`${baseUrl}/patients/${ALFA}/attendances`);
    const body = (await response.json()) as Array<Record<string, unknown>>;

    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("Ilustrativa");
    expect(serialized).not.toContain("anonymizedAt");
    expect(serialized).not.toContain("phone");
  });
});
