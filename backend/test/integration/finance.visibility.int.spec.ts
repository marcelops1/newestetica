import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FinanceModule } from "../../src/finance/finance.module";
import { AnonymizePatientUseCase } from "../../src/patients/application/use-cases/anonymize-patient.use-case";
import { PrismaPatientRepository } from "../../src/patients/infrastructure/persistence/patient.repository.impl";
import { FAKE_TOKEN_VERIFIER, bearer } from "../fakes/fake-token-verifier";
import { TOKEN_VERIFIER } from "../../src/shared/http/auth/token-verifier";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

/* Prova dedicada da invariante herdada no AGREGADO (task 5.7): o valor de paciente
   ANONIMIZADA nunca compõe total nem contagem, mesmo com os registros existindo no
   banco e valores presentes. A garantia é provada pela falha (write-then-throw):
   removido o filtro de relação `patient: { status: "active" }` da query do reader,
   o valor da anonimizada ENTRA no total e este teste reprova; com o filtro, bloqueia
   e o teste passa — a falha distingue as duas situações (evidência no verification.md).
   A anonimização do setup usa o fluxo real de Pacientes (repositório + caso de uso). */
const prisma = createTestPrismaClient();
const anonymizePatient = new AnonymizePatientUseCase(
  new PrismaPatientRepository(prisma),
);

let app: INestApplication;
let baseUrl: string;

const ATIVA = "00000000-0000-4000-8000-000000000101";
const A_ANONIMIZAR = "00000000-0000-4000-8000-000000000102";

async function seedPatient(id: string): Promise<void> {
  await prisma.patient.create({
    data: {
      id,
      fullName: "Paciente Fictícia Ilustrativa",
      phone: "(11) 5555-0001",
      purpose: "Cadastro fictício para teste",
      status: "active",
      updatedAt: new Date(),
    },
  });
}

async function seedAttendance(
  id: string,
  patientId: string,
  amountCents: number,
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

async function fetchSummary(): Promise<Record<string, unknown>> {
  const response = await authFetch(
    `${baseUrl}/finance/summary?from=2026-09-01&to=2026-09-30`,
  );
  expect(response.status).toBe(200);
  return (await response.json()) as Record<string, unknown>;
}

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  process.env.KEYCLOAK_ISSUER = "http://127.0.0.1:1/realms/test";
  process.env.KEYCLOAK_AUDIENCE = "test-client";
  const moduleRef = await Test.createTestingModule({
    imports: [FinanceModule],
  })
    .overrideProvider(TOKEN_VERIFIER)
    .useValue(FAKE_TOKEN_VERIFIER)
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

/* Requisição autenticada (token de admin via verificador fake — o guard é o real). */
function authFetch(
  url: string,
  init: RequestInit & { token?: string } = {},
): Promise<Response> {
  const { token = "test-admin", ...rest } = init;
  return fetch(url, {
    ...rest,
    headers: {
      ...((rest.headers as Record<string, string> | undefined) ?? {}),
      ...bearer(token),
    },
  });
}

describe("agregado não vaza valor de paciente anonimizada (invariante herdada)", () => {
  it("o total e a contagem refletem exatamente a paciente ativa; o valor da anonimizada fica fora", async () => {
    await seedPatient(ATIVA);
    await seedPatient(A_ANONIMIZAR);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ATIVA,
      15_000,
      "2026-09-10T10:00:00.000Z",
    );
    await seedAttendance(
      "00000000-0000-4000-8000-000000000202",
      A_ANONIMIZAR,
      99_000,
      "2026-09-11T10:00:00.000Z",
    );

    await anonymizePatient.execute(A_ANONIMIZAR);

    const body = await fetchSummary();

    expect(body.totalCents).toBe(15_000);
    expect(body.count).toBe(1);
    expect(JSON.stringify(body)).not.toContain("99000");
  });

  it("só com valores de anonimizada na janela, o resumo é zeros (registro existe, dinheiro não)", async () => {
    await seedPatient(A_ANONIMIZAR);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000202",
      A_ANONIMIZAR,
      99_000,
      "2026-09-11T10:00:00.000Z",
    );

    await anonymizePatient.execute(A_ANONIMIZAR);

    const body = await fetchSummary();

    expect(body.totalCents).toBe(0);
    expect(body.count).toBe(0);
    expect(await prisma.attendance.count()).toBe(1);
    expect(await prisma.patient.count({ where: { status: "active" } })).toBe(0);
  });
});
