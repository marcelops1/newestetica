import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaPatientRepository } from "../../src/patients/infrastructure/persistence/patient.repository.impl";
import { Patient } from "../../src/patients/domain/entities/patient.entity";
import { createTestPrismaClient, resetDatabase } from "./database";

const prisma = createTestPrismaClient();
const repository = new PrismaPatientRepository(prisma);

async function seedPatient(
  id: string,
  fullName: string,
  active = true,
): Promise<Patient> {
  const patient = Patient.create({
    id,
    fullName,
    phone: "(11) 5555-0001",
    purpose: "Cadastro fictício para teste",
  });
  if (!active) {
    patient.anonymize();
  }
  await repository.save(patient);
  return patient;
}

beforeEach(async () => {
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaPatientRepository (integração com Postgres real)", () => {
  it("faz round-trip de paciente íntegro com timestamps (mapper não vaza o registro do ORM)", async () => {
    const created = await seedPatient(
      "00000000-0000-4000-8000-000000000001",
      "Paciente Fictícia Alfa",
    );

    const found = await repository.findVisible(100);

    expect(found).toHaveLength(1);
    expect(found[0]?.id).toBe(created.id);
    expect(found[0]?.fullName).toBe("Paciente Fictícia Alfa");
    expect(found[0]?.phone).toBe("(11) 5555-0001");
    expect(found[0]?.purpose).toBe("Cadastro fictício para teste");
    expect(found[0]?.status).toBe("active");
    expect(found[0]?.anonymizedAt).toBeNull();
    expect(found[0]?.createdAt.toISOString()).toBe(
      created.createdAt.toISOString(),
    );
  });

  it("findVisible exclui anonimizada mesmo com o registro existindo e ordena por nome/id", async () => {
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
      "Paciente Fictícia Alfa",
    );
    await seedPatient(
      "00000000-0000-4000-8000-000000000004",
      "Paciente Fictícia Charlie",
      false,
    );

    const visible = await repository.findVisible(100);

    expect(visible.map((patient) => patient.id)).toEqual([
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000002",
    ]);
  });

  it("findVisible respeita o limite na query", async () => {
    await seedPatient(
      "00000000-0000-4000-8000-000000000001",
      "Paciente Fictícia Alfa",
    );
    await seedPatient(
      "00000000-0000-4000-8000-000000000002",
      "Paciente Fictícia Bravo",
    );

    const visible = await repository.findVisible(1);

    expect(visible.map((patient) => patient.id)).toEqual([
      "00000000-0000-4000-8000-000000000001",
    ]);
  });

  it("findVisibleById ignora inexistente e anonimizada", async () => {
    await seedPatient(
      "00000000-0000-4000-8000-000000000004",
      "Paciente Fictícia Charlie",
      false,
    );

    await expect(
      repository.findVisibleById("00000000-0000-4000-8000-000000000004"),
    ).resolves.toBeNull();
    await expect(
      repository.findVisibleById("00000000-0000-4000-8000-000000000099"),
    ).resolves.toBeNull();
  });

  it("save atualiza registro existente (update parcial persistido)", async () => {
    const patient = await seedPatient(
      "00000000-0000-4000-8000-000000000001",
      "Paciente Fictícia Alfa",
    );

    patient.update({ phone: "(11) 5555-0009" });
    await repository.save(patient);

    const found = await repository.findVisibleById(patient.id);
    expect(found?.phone).toBe("(11) 5555-0009");
  });

  it("save persiste a anonimização (status, placeholders e timestamp)", async () => {
    const patient = await seedPatient(
      "00000000-0000-4000-8000-000000000001",
      "Paciente Fictícia Alfa",
    );

    patient.anonymize();
    await repository.save(patient);

    await expect(
      repository.findVisibleById(patient.id),
    ).resolves.toBeNull();
    const record = await prisma.patient.findUnique({
      where: { id: patient.id },
    });
    expect(record?.status).toBe("anonymized");
    expect(record?.anonymizedAt).toBeInstanceOf(Date);
    expect(record?.fullName).not.toContain("Fictícia");
    expect(record?.phone).not.toContain("5555");
    expect(record?.purpose).not.toContain("acompanhamento");
  });
});
