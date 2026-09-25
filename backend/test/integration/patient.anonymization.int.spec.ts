import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PatientsModule } from "../../src/patients/patients.module";
import { IdentityPendingGuard } from "../../src/patients/presentation/guards/identity-pending.guard";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

/* Prova dedicada da invariante (task 5.7): anonimizada nunca é servida. O banco contém
   um paciente ativo e um anonimizado; a resposta HTTP precisa conter exatamente o ativo.
   A garantia é provada pela falha: sem o filtro na query, o anonimizado aparece e este
   arquivo reprova (evidência RED registrada no verification.md). */

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ACTIVE_ID = "00000000-0000-4000-8000-000000000001";
const ANONYMIZED_ID = "00000000-0000-4000-8000-000000000004";

async function seedPatient(
  id: string,
  fullName: string,
  active: boolean,
): Promise<void> {
  await prisma.patient.create({
    data: {
      id,
      fullName,
      phone: "(11) 5555-0001",
      purpose: "Cadastro fictício para teste",
      status: active ? "active" : "anonymized",
      anonymizedAt: active ? null : new Date(),
      updatedAt: new Date(),
    },
  });
}

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  const moduleRef = await Test.createTestingModule({
    imports: [PatientsModule],
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

describe("exclusão da anonimizada na leitura pública administrativa (invariante)", () => {
  it("GET /patients contém exatamente o ativo — a anonimizada nunca aparece", async () => {
    await seedPatient(ANONYMIZED_ID, "Paciente Fictícia Delta", false);
    await seedPatient(ACTIVE_ID, "Paciente Fictícia Alfa", true);

    const response = await fetch(`${baseUrl}/patients`);
    const body = (await response.json()) as Array<{ id: string }>;

    expect(response.status).toBe(200);
    expect(body.map((item) => item.id)).toEqual([ACTIVE_ID]);
    expect(JSON.stringify(body)).not.toContain(ANONYMIZED_ID);
  });

  it("detalhe da anonimizada responde 404 idêntico ao inexistente (sem PII no corpo)", async () => {
    await seedPatient(ANONYMIZED_ID, "Paciente Fictícia Delta", false);

    const anonymized = await fetch(`${baseUrl}/patients/${ANONYMIZED_ID}`);
    const missing = await fetch(
      `${baseUrl}/patients/00000000-0000-4000-8000-000000000099`,
    );

    expect(anonymized.status).toBe(404);
    expect(missing.status).toBe(404);
    const anonymizedBody = (await anonymized.json()) as Record<string, unknown>;
    const missingBody = (await missing.json()) as Record<string, unknown>;
    expect(anonymizedBody).toEqual(missingBody);
    expect(anonymizedBody.code).toBe("PATIENT_NOT_FOUND");
    expect(JSON.stringify(anonymizedBody)).not.toContain("Fictícia");
  });

  it("sem nenhum ativo, a resposta é vazia mesmo com registros anonimizados no banco", async () => {
    await seedPatient(ANONYMIZED_ID, "Paciente Fictícia Delta", false);

    const response = await fetch(`${baseUrl}/patients`);
    const body = (await response.json()) as Array<unknown>;

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });
});
