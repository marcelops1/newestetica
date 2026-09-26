import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AttendanceModule } from "../../src/attendance/attendance.module";
import { IdentityPendingGuard } from "../../src/shared/http/identity-pending.guard";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

/* Testes de contrato da Presentation rodam com o guard HONESTO desativado por override
   (simulando a Identidade futura); o bloqueio real é provado em attendance.guard.int.spec. */
const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ALFA = "00000000-0000-4000-8000-000000000101";
const BRAVO = "00000000-0000-4000-8000-000000000102";
const ANONYMIZED = "00000000-0000-4000-8000-000000000104";

async function seedPatient(id: string, active = true): Promise<void> {
  await prisma.patient.create({
    data: {
      id,
      fullName: "Paciente Fictícia Ilustrativa",
      phone: "(11) 5555-0001",
      purpose: "Cadastro fictício para teste",
      status: active ? "active" : "anonymized",
      anonymizedAt: active ? null : new Date(),
      updatedAt: new Date(),
    },
  });
}

async function seedAttendance(
  id: string,
  patientId: string,
  performedAt: string,
): Promise<void> {
  await prisma.attendance.create({
    data: {
      id,
      patientId,
      summary: `Atendimento fictício ${id}.`,
      performedAt: new Date(performedAt),
      updatedAt: new Date(),
    },
  });
}

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
});

describe("Attendance HTTP (contrato da Presentation, com guard desativado por override)", () => {
  it("POST /patients/:patientId/attendances cria com 201 e id gerado pelo servidor", async () => {
    await seedPatient(ALFA);

    const response = await fetch(`${baseUrl}/patients/${ALFA}/attendances`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        summary: "Limpeza de pele realizada, sem intercorrências.",
        performedAt: "2026-09-10T14:30:00.000Z",
      }),
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      id: string;
      patientId: string;
      performedAt: string;
    };
    expect(body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(body.patientId).toBe(ALFA);
    expect(body.performedAt).toBe("2026-09-10T14:30:00.000Z");
  });

  it("POST com payload inválido responde 422 sem ecoar o resumo", async () => {
    await seedPatient(ALFA);

    const response = await fetch(`${baseUrl}/patients/${ALFA}/attendances`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        summary: "   ",
        performedAt: "10/09/2026 14:30",
      }),
    });

    expect(response.status).toBe(422);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("POST para paciente inexistente ou anonimizada responde 404 idêntico sem criar nada", async () => {
    await seedPatient(ANONYMIZED, false);

    const missing = await fetch(
      `${baseUrl}/patients/00000000-0000-4000-8000-000000000999/attendances`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          summary: "Registro fictício.",
          performedAt: "2026-09-10T14:30:00.000Z",
        }),
      },
    );
    const anonymized = await fetch(
      `${baseUrl}/patients/${ANONYMIZED}/attendances`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          summary: "Registro fictício.",
          performedAt: "2026-09-10T14:30:00.000Z",
        }),
      },
    );

    expect(missing.status).toBe(404);
    expect(anonymized.status).toBe(404);
    const missingBody = (await missing.json()) as Record<string, unknown>;
    const anonymizedBody = (await anonymized.json()) as Record<string, unknown>;
    expect(missingBody.code).toBe("PATIENT_NOT_FOUND");
    expect(missingBody).toEqual(anonymizedBody);

    const records = await prisma.attendance.count();
    expect(records).toBe(0);
  });

  it("GET lista o histórico da paciente, mais recentes primeiro", async () => {
    await seedPatient(ALFA);
    await seedPatient(BRAVO);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000202",
      ALFA,
      "2026-08-01T10:00:00.000Z",
    );
    await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      "2026-09-10T14:30:00.000Z",
    );
    await seedAttendance(
      "00000000-0000-4000-8000-000000000203",
      BRAVO,
      "2026-09-11T09:00:00.000Z",
    );

    const response = await fetch(`${baseUrl}/patients/${ALFA}/attendances`);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<{ id: string }>;
    expect(body.map((item) => item.id)).toEqual([
      "00000000-0000-4000-8000-000000000201",
      "00000000-0000-4000-8000-000000000202",
    ]);
  });

  it("GET aceita limit válido e responde 422 para limite acima do teto ou não numérico", async () => {
    await seedPatient(ALFA);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      "2026-09-10T14:30:00.000Z",
    );
    await seedAttendance(
      "00000000-0000-4000-8000-000000000202",
      ALFA,
      "2026-08-01T10:00:00.000Z",
    );

    const limited = await fetch(
      `${baseUrl}/patients/${ALFA}/attendances?limit=1`,
    );
    expect(limited.status).toBe(200);
    await expect(limited.json()).resolves.toHaveLength(1);

    const overLimit = await fetch(
      `${baseUrl}/patients/${ALFA}/attendances?limit=501`,
    );
    expect(overLimit.status).toBe(422);

    const nonNumeric = await fetch(
      `${baseUrl}/patients/${ALFA}/attendances?limit=abc`,
    );
    expect(nonNumeric.status).toBe(422);
  });

  it("GET para paciente inexistente ou anonimizada responde 404 idêntico", async () => {
    await seedPatient(ANONYMIZED, false);

    const missing = await fetch(
      `${baseUrl}/patients/00000000-0000-4000-8000-000000000999/attendances`,
    );
    const anonymized = await fetch(
      `${baseUrl}/patients/${ANONYMIZED}/attendances`,
    );

    expect(missing.status).toBe(404);
    expect(anonymized.status).toBe(404);
    const missingBody = (await missing.json()) as Record<string, unknown>;
    const anonymizedBody = (await anonymized.json()) as Record<string, unknown>;
    expect(missingBody).toEqual(anonymizedBody);
  });

  it("GET detalhe encontra e responde 404 idêntico para cruzado/inexistente/anonimizado", async () => {
    await seedPatient(ALFA);
    await seedPatient(BRAVO);
    await seedPatient(ANONYMIZED, false);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      "2026-09-10T14:30:00.000Z",
    );
    await seedAttendance(
      "00000000-0000-4000-8000-000000000202",
      ANONYMIZED,
      "2026-09-11T09:00:00.000Z",
    );

    const found = await fetch(
      `${baseUrl}/patients/${ALFA}/attendances/00000000-0000-4000-8000-000000000201`,
    );
    expect(found.status).toBe(200);

    const crossed = await fetch(
      `${baseUrl}/patients/${BRAVO}/attendances/00000000-0000-4000-8000-000000000201`,
    );
    const missingAttendance = await fetch(
      `${baseUrl}/patients/${ALFA}/attendances/00000000-0000-4000-8000-000000000299`,
    );
    const anonymizedPatient = await fetch(
      `${baseUrl}/patients/${ANONYMIZED}/attendances/00000000-0000-4000-8000-000000000202`,
    );

    expect(crossed.status).toBe(404);
    expect(missingAttendance.status).toBe(404);
    expect(anonymizedPatient.status).toBe(404);
    const crossedBody = (await crossed.json()) as Record<string, unknown>;
    const missingBody = (await missingAttendance.json()) as Record<
      string,
      unknown
    >;
    const anonymizedBody = (await anonymizedPatient.json()) as Record<
      string,
      unknown
    >;
    expect(crossedBody.code).toBe("ATTENDANCE_NOT_FOUND");
    expect(missingBody).toEqual(crossedBody);
    expect(anonymizedBody.code).toBe("PATIENT_NOT_FOUND");
    expect(JSON.stringify(anonymizedBody)).not.toContain("Atendimento fictício");
  });

  it("PUT/PATCH/DELETE não são expostos (histórico imutável)", async () => {
    await seedPatient(ALFA);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      "2026-09-10T14:30:00.000Z",
    );
    const url = `${baseUrl}/patients/${ALFA}/attendances/00000000-0000-4000-8000-000000000201`;

    for (const method of ["PUT", "PATCH", "DELETE"]) {
      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ summary: "tentativa fictícia" }),
      });
      expect(response.status, `método ${method}`).toBe(404);
    }

    const after = await prisma.attendance.findUnique({
      where: { id: "00000000-0000-4000-8000-000000000201" },
    });
    expect(after?.summary).toBe(
      "Atendimento fictício 00000000-0000-4000-8000-000000000201.",
    );
  });
});
