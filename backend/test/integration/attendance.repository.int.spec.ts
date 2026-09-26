import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaAttendanceRepository } from "../../src/attendance/infrastructure/persistence/attendance.repository.impl";
import { PrismaPatientDirectory } from "../../src/attendance/infrastructure/persistence/patient-directory.impl";
import { Attendance } from "../../src/attendance/domain/entities/attendance.entity";
import { createTestPrismaClient, resetDatabase } from "./database";

const prisma = createTestPrismaClient();
const repository = new PrismaAttendanceRepository(prisma);
const directory = new PrismaPatientDirectory(prisma);

const ALFA = "00000000-0000-4000-8000-000000000101";
const BRAVO = "00000000-0000-4000-8000-000000000102";
const ANONYMIZED = "00000000-0000-4000-8000-000000000104";

async function seedPatient(
  id: string,
  active = true,
): Promise<void> {
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

function makeAttendance(
  id: string,
  patientId: string,
  performedAt: string,
): Attendance {
  return Attendance.create({
    id,
    patientId,
    summary: `Atendimento fictício ${id}.`,
    performedAt: new Date(performedAt),
  });
}

async function seedAttendance(
  id: string,
  patientId: string,
  performedAt: string,
): Promise<Attendance> {
  const attendance = makeAttendance(id, patientId, performedAt);
  await repository.save(attendance);
  return attendance;
}

beforeEach(async () => {
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaAttendanceRepository (integração com Postgres real)", () => {
  it("faz round-trip de atendimento íntegro com timestamps (mapper não vaza o registro do ORM)", async () => {
    await seedPatient(ALFA);
    const created = await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      "2026-09-10T14:30:00.000Z",
    );

    const found = await repository.findVisibleByPatient(ALFA, 100);

    expect(found).toHaveLength(1);
    expect(found[0]?.id).toBe(created.id);
    expect(found[0]?.patientId).toBe(ALFA);
    expect(found[0]?.summary).toBe(created.summary);
    expect(found[0]?.performedAt.toISOString()).toBe(
      "2026-09-10T14:30:00.000Z",
    );
    expect(found[0]?.createdAt.toISOString()).toBe(
      created.createdAt.toISOString(),
    );
  });

  it("save de novo com o mesmo id não duplica (upsert)", async () => {
    await seedPatient(ALFA);
    const attendance = makeAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      "2026-09-10T14:30:00.000Z",
    );

    await repository.save(attendance);
    await repository.save(attendance);

    const found = await repository.findVisibleByPatient(ALFA, 100);
    expect(found).toHaveLength(1);
  });

  it("findVisibleByPatient exclui histórico de anonimizada mesmo com os registros existindo", async () => {
    await seedPatient(ALFA);
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

    const visible = await repository.findVisibleByPatient(ALFA, 100);

    expect(visible.map((attendance) => attendance.id)).toEqual([
      "00000000-0000-4000-8000-000000000201",
    ]);
  });

  it("findVisibleByPatient ordena por data desc/id asc e respeita o limite na query", async () => {
    await seedPatient(ALFA);
    /* Empate de data inserido fora da ordem de id: sem o desempate por id, a ordem
       física (003 antes de 001) apareceria e este teste reprovaria. */
    await seedAttendance(
      "00000000-0000-4000-8000-000000000203",
      ALFA,
      "2026-09-10T14:30:00.000Z",
    );
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

    const visible = await repository.findVisibleByPatient(ALFA, 100);
    expect(visible.map((attendance) => attendance.id)).toEqual([
      "00000000-0000-4000-8000-000000000201",
      "00000000-0000-4000-8000-000000000203",
      "00000000-0000-4000-8000-000000000202",
    ]);

    const limited = await repository.findVisibleByPatient(ALFA, 1);
    expect(limited.map((attendance) => attendance.id)).toEqual([
      "00000000-0000-4000-8000-000000000201",
    ]);
  });

  it("findVisibleById exige o vínculo e ignora anonimizada (cruzado e inexistente → nulo)", async () => {
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

    await expect(
      repository.findVisibleById("00000000-0000-4000-8000-000000000201", ALFA),
    ).resolves.toMatchObject({
      id: "00000000-0000-4000-8000-000000000201",
    });
    await expect(
      repository.findVisibleById("00000000-0000-4000-8000-000000000201", BRAVO),
    ).resolves.toBeNull();
    await expect(
      repository.findVisibleById(
        "00000000-0000-4000-8000-000000000202",
        ANONYMIZED,
      ),
    ).resolves.toBeNull();
    await expect(
      repository.findVisibleById(
        "00000000-0000-4000-8000-000000000299",
        ALFA,
      ),
    ).resolves.toBeNull();
  });

  it("FK impede atendimento órfão (paciente inexistente é rejeitada pelo banco)", async () => {
    await expect(
      seedAttendance(
        "00000000-0000-4000-8000-000000000201",
        "00000000-0000-4000-8000-000000000999",
        "2026-09-10T14:30:00.000Z",
      ),
    ).rejects.toThrow();
  });

  it("histórico persiste vinculado ao paciente e a linha crua não guarda nome (sem snapshot de PII)", async () => {
    await seedPatient(ALFA);
    await seedAttendance(
      "00000000-0000-4000-8000-000000000201",
      ALFA,
      "2026-09-10T14:30:00.000Z",
    );

    const record = await prisma.attendance.findUnique({
      where: { id: "00000000-0000-4000-8000-000000000201" },
    });

    expect(record?.patientId).toBe(ALFA);
    expect(Object.keys(record ?? {}).sort()).toEqual([
      "createdAt",
      "id",
      "patientId",
      "performedAt",
      "summary",
      "updatedAt",
    ]);
  });
});

describe("PrismaPatientDirectory (leitura cruzada explícita e visível)", () => {
  it("devolve o vínculo da ativa e nulo para anonimizada e inexistente", async () => {
    await seedPatient(ALFA);
    await seedPatient(ANONYMIZED, false);

    await expect(directory.findVisiblePatient(ALFA)).resolves.toEqual({
      id: ALFA,
    });
    await expect(directory.findVisiblePatient(ANONYMIZED)).resolves.toBeNull();
    await expect(
      directory.findVisiblePatient("00000000-0000-4000-8000-000000000999"),
    ).resolves.toBeNull();
  });
});
