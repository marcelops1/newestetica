import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FinanceModule } from "../../src/finance/finance.module";
import { IdentityPendingGuard } from "../../src/shared/http/identity-pending.guard";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

/* Testes de rota rodam com o guard HONESTO desativado por override (simulando a
   Identidade futura); o bloqueio real é provado em finance.guard.int.spec.ts.
   A validação integral do corpo contra o contrato é a task 5.5 (corpo schemas nas
   duas pontas); aqui a rota prova o agregado e os códigos de resposta. */
const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ALFA = "00000000-0000-4000-8000-000000000101";

async function seedPatient(id: string, active = true): Promise<void> {
  await prisma.patient.create({
    data: {
      id,
      fullName: active
        ? "Paciente Fictícia Ilustrativa"
        : "Paciente anonimizada",
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
  amountCents: number | null,
  performedAt: string,
): Promise<void> {
  await prisma.attendance.create({
    data: {
      id,
      patientId,
      summary: `Atendimento fictício ${id}.`,
      amountCents,
      performedAt: new Date(performedAt),
      updatedAt: new Date(),
    },
  });
}

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  const moduleRef = await Test.createTestingModule({
    imports: [FinanceModule],
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

describe("Finance HTTP (rota de resumo, com guard desativado por override)", () => {
  it("GET /finance/summary com janela válida responde 200 com o agregado (só com valor e na janela)", async () => {
    await seedPatient(ALFA);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      15_000,
      "2026-09-10T10:00:00.000Z",
    );
    await seedAttendance(
      "00000000-0000-4000-8000-000000000202",
      ALFA,
      null,
      "2026-09-12T10:00:00.000Z",
    );
    await seedAttendance(
      "00000000-0000-4000-8000-000000000203",
      ALFA,
      2_500,
      "2026-08-31T23:59:59.999Z",
    );

    const response = await fetch(
      `${baseUrl}/finance/summary?from=2026-09-01&to=2026-09-30`,
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body.totalCents).toBe(15_000);
    expect(body.count).toBe(1);
  });

  it("janela sem atendimentos valorados responde 200 com zeros", async () => {
    await seedPatient(ALFA);

    const response = await fetch(
      `${baseUrl}/finance/summary?from=2026-09-01&to=2026-09-30`,
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body.totalCents).toBe(0);
    expect(body.count).toBe(0);
  });

  it("janela malformada, invertida ou acima do teto responde 422 sem eco", async () => {
    await seedPatient(ALFA);

    const hostiles = [
      "from=01/09/2026&to=2026-09-30",
      "from=2026-12-31&to=2026-01-01",
      "from=2026-01-01&to=2027-01-03",
      "from=2026-09-01",
      "",
    ];

    for (const query of hostiles) {
      const response = await fetch(
        `${baseUrl}/finance/summary${query ? `?${query}` : ""}`,
      );
      const body = (await response.json()) as { code: string };
      expect(response.status, `query hostil: ${query}`).toBe(422);
      expect(body.code).toBe("VALIDATION_ERROR");
      expect(JSON.stringify(body)).not.toContain("2026");
    }
  });
});
