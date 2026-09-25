import { describe, expect, it } from "vitest";
import { Patient } from "../entities/patient.entity";
import { InMemoryPatientRepository } from "../../../../test/fakes/in-memory-patient.repository";

function makePatient(id: string, fullName: string, active = true): Patient {
  const patient = Patient.create({
    id,
    fullName,
    phone: "(11) 5555-0001",
    purpose: "Cadastro fictício para teste",
  });
  if (!active) {
    patient.anonymize();
  }
  return patient;
}

describe("portas do Domain (pacientes)", () => {
  it("o fake manual cumpre PatientRepository: save cria e atualiza", async () => {
    const repository = new InMemoryPatientRepository();
    const patient = makePatient(
      "00000000-0000-4000-8000-000000000001",
      "Paciente Fictícia Um",
    );

    await repository.save(patient);
    patient.update({ phone: "(11) 5555-0002" });
    await repository.save(patient);

    const visible = await repository.findVisible(100);
    expect(visible).toHaveLength(1);
    expect(visible[0]?.phone).toBe("(11) 5555-0002");
  });

  it("findVisible exclui anonimizada e ordena por nome, depois id", async () => {
    const repository = new InMemoryPatientRepository([
      makePatient(
        "00000000-0000-4000-8000-000000000002",
        "Paciente Fictícia Bravo",
      ),
      makePatient(
        "00000000-0000-4000-8000-000000000001",
        "Paciente Fictícia Alfa",
      ),
      makePatient(
        "00000000-0000-4000-8000-000000000003",
        "Paciente Fictícia Alfa",
      ),
      makePatient(
        "00000000-0000-4000-8000-000000000004",
        "Paciente Fictícia Charlie",
        false,
      ),
    ]);

    const visible = await repository.findVisible(100);

    expect(visible.map((patient) => patient.id)).toEqual([
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000002",
    ]);
  });

  it("findVisible respeita o limite informado", async () => {
    const repository = new InMemoryPatientRepository([
      makePatient(
        "00000000-0000-4000-8000-000000000001",
        "Paciente Fictícia Alfa",
      ),
      makePatient(
        "00000000-0000-4000-8000-000000000002",
        "Paciente Fictícia Bravo",
      ),
    ]);

    const visible = await repository.findVisible(1);

    expect(visible.map((patient) => patient.id)).toEqual([
      "00000000-0000-4000-8000-000000000001",
    ]);
  });

  it("findVisibleById ignora inexistente e anonimizada (mesmo com id existente)", async () => {
    const repository = new InMemoryPatientRepository([
      makePatient(
        "00000000-0000-4000-8000-000000000004",
        "Paciente Fictícia Charlie",
        false,
      ),
    ]);

    await expect(
      repository.findVisibleById("00000000-0000-4000-8000-000000000004"),
    ).resolves.toBeNull();
    await expect(
      repository.findVisibleById("00000000-0000-4000-8000-000000000099"),
    ).resolves.toBeNull();
  });
});
