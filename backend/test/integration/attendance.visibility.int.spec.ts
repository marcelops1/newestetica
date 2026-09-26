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

/* Prova dedicada da invariante herdada (task 5.7, dívida R3 de Pacientes): o histórico
   de paciente ANONIMIZADA nunca é servido, em nenhuma leitura, mesmo com as linhas
   existindo no banco. Duas camadas independentes:
     1) o caso de uso consulta a porta PatientDirectory (paciente invisível → 404);
     2) a QUERY do repositório filtra a relação (`patient: { status: "active" }`).
   A garantia é provada pela falha, camada a camada (write-then-throw — evidência no
   verification.md): sem a camada 2, o teste de repositório reprova; sem as duas, o
   histórico vaza na resposta HTTP e este arquivo reprova. */

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ALFA = "00000000-0000-4000-8000-000000000101";
const BRAVO = "00000000-0000-4000-8000-000000000102";
const ANONYMIZED = "00000000-0000-4000-8000-000000000104";
const ALFA_ATTENDANCE = "00000000-0000-4000-8000-000000000201";
const ANONYMIZED_ATTENDANCE = "00000000-0000-4000-8000-000000000202";
const ANONYMIZED_SUMMARY = "Resumo da anonimizada que nunca pode vazar.";

async function seedPatient(id: string, active: boolean): Promise<void> {
  await prisma.patient.create({
    data: {
      id,
      fullName: active ? "Paciente Fictícia Ilustrativa" : "Paciente anonimizada",
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
  summary: string,
  performedAt: string,
): Promise<void> {
  await prisma.attendance.create({
    data: {
      id,
      patientId,
      summary,
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

describe("histórico de paciente anonimizada nunca é servido (invariante herdada)", () => {
  it("a lista da ativa contém exatamente o histórico dela — a anonimizada nunca aparece", async () => {
    await seedPatient(ANONYMIZED, false);
    await seedPatient(ALFA, true);
    await seedAttendance(
      ALFA_ATTENDANCE,
      ALFA,
      "Atendimento da ativa.",
      "2026-09-10T14:30:00.000Z",
    );
    await seedAttendance(
      ANONYMIZED_ATTENDANCE,
      ANONYMIZED,
      ANONYMIZED_SUMMARY,
      "2026-09-11T09:00:00.000Z",
    );

    const response = await fetch(`${baseUrl}/patients/${ALFA}/attendances`);
    const body = (await response.json()) as Array<{ id: string }>;

    expect(response.status).toBe(200);
    expect(body.map((item) => item.id)).toEqual([ALFA_ATTENDANCE]);
    expect(JSON.stringify(body)).not.toContain(ANONYMIZED_ATTENDANCE);
    expect(JSON.stringify(body)).not.toContain("anonimizada");
  });

  it("lista e detalhe da anonimizada respondem 404 idêntico ao inexistente, sem tocar o histórico", async () => {
    await seedPatient(ANONYMIZED, false);
    await seedAttendance(
      ANONYMIZED_ATTENDANCE,
      ANONYMIZED,
      ANONYMIZED_SUMMARY,
      "2026-09-11T09:00:00.000Z",
    );

    const anonymizedList = await fetch(
      `${baseUrl}/patients/${ANONYMIZED}/attendances`,
    );
    const missingList = await fetch(
      `${baseUrl}/patients/00000000-0000-4000-8000-000000000999/attendances`,
    );
    const anonymizedDetail = await fetch(
      `${baseUrl}/patients/${ANONYMIZED}/attendances/${ANONYMIZED_ATTENDANCE}`,
    );
    const missingDetail = await fetch(
      `${baseUrl}/patients/00000000-0000-4000-8000-000000000999/attendances/${ANONYMIZED_ATTENDANCE}`,
    );

    expect(anonymizedList.status).toBe(404);
    expect(missingList.status).toBe(404);
    expect(anonymizedDetail.status).toBe(404);
    expect(missingDetail.status).toBe(404);
    const anonymizedListBody = (await anonymizedList.json()) as Record<
      string,
      unknown
    >;
    const missingListBody = (await missingList.json()) as Record<
      string,
      unknown
    >;
    expect(anonymizedListBody).toEqual(missingListBody);
    expect(JSON.stringify(anonymizedListBody)).not.toContain("anonimizada");
    expect(JSON.stringify(anonymizedListBody)).not.toContain(
      "Resumo da anonimizada",
    );
  });

  it("registro para anonimizada responde 404 e não cria nada", async () => {
    await seedPatient(ANONYMIZED, false);

    const response = await fetch(
      `${baseUrl}/patients/${ANONYMIZED}/attendances`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          summary: "Tentativa de registro para anonimizada.",
          performedAt: "2026-09-12T10:00:00.000Z",
        }),
      },
    );

    expect(response.status).toBe(404);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.code).toBe("PATIENT_NOT_FOUND");
    expect(await prisma.attendance.count()).toBe(0);
  });

  it("detalhe cruzado: o histórico da anonimizada não é acessível nem pela rota de outra paciente", async () => {
    await seedPatient(ALFA, true);
    await seedPatient(ANONYMIZED, false);
    await seedAttendance(
      ANONYMIZED_ATTENDANCE,
      ANONYMIZED,
      ANONYMIZED_SUMMARY,
      "2026-09-11T09:00:00.000Z",
    );

    const viaAlfa = await fetch(
      `${baseUrl}/patients/${ALFA}/attendances/${ANONYMIZED_ATTENDANCE}`,
    );
    const viaAnonymized = await fetch(
      `${baseUrl}/patients/${ANONYMIZED}/attendances/${ANONYMIZED_ATTENDANCE}`,
    );

    expect(viaAlfa.status).toBe(404);
    expect(viaAnonymized.status).toBe(404);
    const viaAlfaBody = (await viaAlfa.json()) as Record<string, unknown>;
    const viaAnonymizedBody = (await viaAnonymized.json()) as Record<
      string,
      unknown
    >;
    expect(viaAlfaBody.code).toBe("ATTENDANCE_NOT_FOUND");
    expect(viaAnonymizedBody.code).toBe("PATIENT_NOT_FOUND");
    expect(JSON.stringify(viaAlfaBody)).not.toContain(ANONYMIZED_SUMMARY);
    expect(JSON.stringify(viaAnonymizedBody)).not.toContain(ANONYMIZED_SUMMARY);
  });

  it("só com registros de anonimizada no banco, a ativa lista vazio e continua sem vazar", async () => {
    await seedPatient(BRAVO, true);
    await seedPatient(ANONYMIZED, false);
    await seedAttendance(
      ANONYMIZED_ATTENDANCE,
      ANONYMIZED,
      ANONYMIZED_SUMMARY,
      "2026-09-11T09:00:00.000Z",
    );

    const response = await fetch(`${baseUrl}/patients/${BRAVO}/attendances`);
    const body = (await response.json()) as Array<unknown>;

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
    expect(JSON.stringify(body)).not.toContain(ANONYMIZED_SUMMARY);
  });
});
