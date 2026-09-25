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

/* Testes de contrato da Presentation rodam com o guard HONESTO desativado por override
   (simulando a Identidade futura); o bloqueio real é provado em patient.guard.int.spec. */
const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ACTIVE_ID = "00000000-0000-4000-8000-000000000001";

async function seedPatient(
  id: string,
  fullName: string,
  active = true,
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

describe("Patients HTTP (contrato da Presentation, com guard desativado por override)", () => {
  it("POST /patients cria com 201 e id gerado pelo servidor", async () => {
    const response = await fetch(`${baseUrl}/patients`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: "Paciente Fictícia Um",
        phone: "(11) 5555-0001",
        purpose: "Cadastro para acompanhamento na clínica",
      }),
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as { id: string };
    expect(body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("POST /patients com payload inválido responde 422 sem ecoar PII", async () => {
    const response = await fetch(`${baseUrl}/patients`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: " A ",
        phone: "(11) 1234",
        purpose: "Cadastro fictício",
      }),
    });

    expect(response.status).toBe(422);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(JSON.stringify(body)).not.toContain("1234");
  });

  it("GET /patients lista só ativos em ordem determinística", async () => {
    await seedPatient(
      "00000000-0000-4000-8000-000000000002",
      "Paciente Fictícia Bravo",
    );
    await seedPatient(
      "00000000-0000-4000-8000-000000000001",
      "Paciente Fictícia Alfa",
    );
    await seedPatient(
      "00000000-0000-4000-8000-000000000003",
      "Paciente Fictícia Charlie",
      false,
    );

    const response = await fetch(`${baseUrl}/patients`);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<{ id: string }>;
    expect(body.map((item) => item.id)).toEqual([
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
    ]);
  });

  it("GET /patients?limit= limita e teto acima de 500 responde 422", async () => {
    await seedPatient(ACTIVE_ID, "Paciente Fictícia Alfa");
    await seedPatient(
      "00000000-0000-4000-8000-000000000002",
      "Paciente Fictícia Bravo",
    );

    const limited = await fetch(`${baseUrl}/patients?limit=1`);
    expect(limited.status).toBe(200);
    await expect(limited.json()).resolves.toHaveLength(1);

    const overLimit = await fetch(`${baseUrl}/patients?limit=501`);
    expect(overLimit.status).toBe(422);
    const invalidLimit = await fetch(`${baseUrl}/patients?limit=abc`);
    expect(invalidLimit.status).toBe(422);
  });

  it("GET /patients/:id encontra ativo e 404 idêntico para inexistente ou anonimizado", async () => {
    await seedPatient(ACTIVE_ID, "Paciente Fictícia Alfa");
    await seedPatient(
      "00000000-0000-4000-8000-000000000004",
      "Paciente Fictícia Charlie",
      false,
    );

    const found = await fetch(`${baseUrl}/patients/${ACTIVE_ID}`);
    expect(found.status).toBe(200);

    const missing = await fetch(
      `${baseUrl}/patients/00000000-0000-4000-8000-000000000099`,
    );
    const anonymized = await fetch(
      `${baseUrl}/patients/00000000-0000-4000-8000-000000000004`,
    );
    expect(missing.status).toBe(404);
    expect(anonymized.status).toBe(404);
    const missingBody = (await missing.json()) as { code: string };
    const anonymizedBody = (await anonymized.json()) as { code: string };
    expect(missingBody.code).toBe("PATIENT_NOT_FOUND");
    expect(missingBody).toEqual(anonymizedBody);
  });

  it("PATCH /patients/:id atualiza parcialmente e preserva o resto", async () => {
    await seedPatient(ACTIVE_ID, "Paciente Fictícia Alfa");

    const response = await fetch(`${baseUrl}/patients/${ACTIVE_ID}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "(11) 5555-0009" }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      phone: string;
      fullName: string;
      purpose: string;
    };
    expect(body.phone).toBe("(11) 5555-0009");
    expect(body.fullName).toBe("Paciente Fictícia Alfa");
    expect(body.purpose).toBe("Cadastro fictício para teste");
  });

  it("PATCH /patients/:id inválido responde 422 e inexistente 404", async () => {
    await seedPatient(ACTIVE_ID, "Paciente Fictícia Alfa");

    const invalid = await fetch(`${baseUrl}/patients/${ACTIVE_ID}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "(11) 1234" }),
    });
    expect(invalid.status).toBe(422);

    const missing = await fetch(
      `${baseUrl}/patients/00000000-0000-4000-8000-000000000099`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: "(11) 5555-0009" }),
      },
    );
    expect(missing.status).toBe(404);
  });

  it("DELETE /patients/:id anonimiza com 204 e o registro some das leituras", async () => {
    await seedPatient(ACTIVE_ID, "Paciente Fictícia Alfa");

    const deleted = await fetch(`${baseUrl}/patients/${ACTIVE_ID}`, {
      method: "DELETE",
    });
    expect(deleted.status).toBe(204);
    expect(await deleted.text()).toBe("");

    const after = await fetch(`${baseUrl}/patients/${ACTIVE_ID}`);
    expect(after.status).toBe(404);
    const again = await fetch(`${baseUrl}/patients/${ACTIVE_ID}`, {
      method: "DELETE",
    });
    expect(again.status).toBe(404);
  });

  it("PUT /patients/:id (método não exposto) responde 404 de rota", async () => {
    const response = await fetch(`${baseUrl}/patients/${ACTIVE_ID}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(404);
  });
});
