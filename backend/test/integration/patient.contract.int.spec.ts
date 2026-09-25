import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PatientSchema } from "@newestetica/contracts";
import { PatientsModule } from "../../src/patients/patients.module";
import { IdentityPendingGuard } from "../../src/patients/presentation/guards/identity-pending.guard";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ACTIVE_ID = "00000000-0000-4000-8000-000000000001";
const PATIENT_KEYS = [
  "createdAt",
  "fullName",
  "id",
  "phone",
  "purpose",
  "status",
  "updatedAt",
];

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
  await prisma.patient.create({
    data: {
      id: ACTIVE_ID,
      fullName: "Paciente Fictícia Alfa",
      phone: "(11) 5555-0001",
      purpose: "Cadastro fictício para teste",
      status: "active",
      updatedAt: new Date(),
    },
  });
});

describe("saída de pacientes conforme o contrato (verificação nas duas pontas)", () => {
  it("o detalhe responde no PatientSchema, com chaves exatas (status incluso)", async () => {
    const response = await fetch(`${baseUrl}/patients/${ACTIVE_ID}`);
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(PatientSchema.safeParse(body).success, JSON.stringify(body)).toBe(
      true,
    );
    expect(Object.keys(body).sort()).toEqual(PATIENT_KEYS);
  });

  it("a listagem responde no PatientSchema, com chaves exatas em cada item", async () => {
    const response = await fetch(`${baseUrl}/patients`);
    const body = (await response.json()) as Array<Record<string, unknown>>;

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    for (const item of body) {
      expect(PatientSchema.safeParse(item).success, JSON.stringify(item)).toBe(
        true,
      );
      expect(Object.keys(item).sort()).toEqual(PATIENT_KEYS);
    }
  });

  it("a criação responde no PatientSchema", async () => {
    const response = await fetch(`${baseUrl}/patients`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: "Paciente Fictícia Bravo",
        phone: "(11) 5555-0002",
        purpose: "Cadastro fictício",
      }),
    });
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(201);
    expect(PatientSchema.safeParse(body).success, JSON.stringify(body)).toBe(
      true,
    );
    expect(Object.keys(body).sort()).toEqual(PATIENT_KEYS);
  });

  it("a atualização responde no PatientSchema com os campos preservados", async () => {
    const response = await fetch(`${baseUrl}/patients/${ACTIVE_ID}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "(11) 5555-0009" }),
    });
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(PatientSchema.safeParse(body).success, JSON.stringify(body)).toBe(
      true,
    );
    expect(Object.keys(body).sort()).toEqual(PATIENT_KEYS);
    expect(body.status).toBe("active");
  });
});
