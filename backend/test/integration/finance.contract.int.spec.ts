import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FinanceSummarySchema } from "@newestetica/contracts";
import { FinanceModule } from "../../src/finance/finance.module";
import { IdentityPendingGuard } from "../../src/shared/http/identity-pending.guard";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

/* Verificação nas duas pontas (docs/07 §13 e §17): o corpo HTTP valida contra o
   schema do contrato com chaves exatas, e a resposta é auditada por inspeção —
   nenhum campo fora de janela/moeda/total/contagem (sem PII, sem breakdown). */
const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ALFA = "00000000-0000-4000-8000-000000000101";

const SUMMARY_KEYS = ["count", "currency", "from", "to", "totalCents"];

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
      id: "00000000-0000-4000-8000-000000000201",
      patientId: ALFA,
      summary: "Atendimento fictício com valor.",
      amountCents: 15_000,
      performedAt: new Date("2026-09-10T10:00:00.000Z"),
      updatedAt: new Date(),
    },
  });
});

describe("resumo financeiro conforme o contrato (verificação nas duas pontas)", () => {
  it("o corpo responde no FinanceSummarySchema com chaves exatas, janela ecoada e BRL", async () => {
    const response = await fetch(
      `${baseUrl}/finance/summary?from=2026-09-01&to=2026-09-30`,
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(
      FinanceSummarySchema.safeParse(body).success,
      JSON.stringify(body),
    ).toBe(true);
    expect(Object.keys(body).sort()).toEqual(SUMMARY_KEYS);
    expect(body.from).toBe("2026-09-01");
    expect(body.to).toBe("2026-09-30");
    expect(body.currency).toBe("BRL");
    expect(body.totalCents).toBe(15_000);
    expect(body.count).toBe(1);
  });

  it("nenhum campo de paciente/breakdown vaza para o wire (auditoria de superfície)", async () => {
    const response = await fetch(
      `${baseUrl}/finance/summary?from=2026-09-01&to=2026-09-30`,
    );
    const body = (await response.json()) as Record<string, unknown>;

    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("Ilustrativa");
    expect(serialized).not.toContain("patient");
    expect(serialized).not.toContain("breakdown");
    expect(serialized).not.toContain("summary");
    expect(Object.keys(body).sort()).toEqual(SUMMARY_KEYS);
  });
});
