import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaFinanceSummaryReader } from "../../src/finance/infrastructure/persistence/finance-summary.reader.impl";
import { createTestPrismaClient, resetDatabase } from "./database";

/* Integração real (docs/07 §15.3): o reader cumpre o contrato da porta contra
   Postgres em container — só pares, só com valor, só na janela, só de paciente
   visível. A visibilidade é a mesma 2ª camada do Atendimento (`patient.status`). */

const prisma = createTestPrismaClient();
const reader = new PrismaFinanceSummaryReader(prisma);

const ALFA = "00000000-0000-4000-8000-000000000101";
const ANONYMIZED = "00000000-0000-4000-8000-000000000104";

const FROM = new Date("2026-09-01T00:00:00.000Z");
const TO = new Date("2026-09-30T23:59:59.999Z");

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

beforeEach(async () => {
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaFinanceSummaryReader (integração com Postgres real)", () => {
  it("devolve só pares { amountCents, performedAt } com valor, dentro da janela (bordas inclusivas)", async () => {
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
    await seedAttendance(
      "00000000-0000-4000-8000-000000000204",
      ALFA,
      3_000,
      "2026-10-01T00:00:00.000Z",
    );
    await seedAttendance(
      "00000000-0000-4000-8000-000000000205",
      ALFA,
      1,
      "2026-09-30T23:59:59.999Z",
    );

    const entries = await reader.readVisibleEntries(FROM, TO);

    expect(entries).toEqual([
      { amountCents: 15_000, performedAt: new Date("2026-09-10T10:00:00.000Z") },
      { amountCents: 1, performedAt: new Date("2026-09-30T23:59:59.999Z") },
    ]);
    for (const entry of entries) {
      expect(Object.keys(entry).sort()).toEqual(["amountCents", "performedAt"]);
    }
  });

  it("exclui atendimentos de paciente anonimizada mesmo com valores existindo", async () => {
    await seedPatient(ALFA);
    await seedPatient(ANONYMIZED, false);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      15_000,
      "2026-09-10T10:00:00.000Z",
    );
    await seedAttendance(
      "00000000-0000-4000-8000-000000000202",
      ANONYMIZED,
      99_999,
      "2026-09-15T10:00:00.000Z",
    );

    const entries = await reader.readVisibleEntries(FROM, TO);

    expect(entries).toEqual([
      { amountCents: 15_000, performedAt: new Date("2026-09-10T10:00:00.000Z") },
    ]);
    expect(JSON.stringify(entries)).not.toContain("99999");
  });

  it("só com registros de anonimizada na janela, devolve lista vazia", async () => {
    await seedPatient(ANONYMIZED, false);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000202",
      ANONYMIZED,
      99_999,
      "2026-09-15T10:00:00.000Z",
    );

    await expect(reader.readVisibleEntries(FROM, TO)).resolves.toEqual([]);
  });

  it("a leitura só traz os dois campos do agregado (sem PII, sem summary)", async () => {
    await seedPatient(ALFA);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      15_000,
      "2026-09-10T10:00:00.000Z",
    );

    const entries = await reader.readVisibleEntries(FROM, TO);

    const serialized = JSON.stringify(entries);
    expect(serialized).not.toContain("Ilustrativa");
    expect(serialized).not.toContain("summary");
    expect(serialized).not.toContain("patientId");
  });
});
