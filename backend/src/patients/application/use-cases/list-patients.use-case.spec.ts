import { describe, expect, it } from "vitest";
import { InMemoryPatientRepository } from "../../../../test/fakes/in-memory-patient.repository";
import { Patient } from "../../domain/entities/patient.entity";
import type { PatientRepository } from "../../domain/ports/patient.repository";
import {
  DEFAULT_PATIENTS_LIMIT,
  ListPatientsUseCase,
} from "./list-patients.use-case";

class SpyPatientRepository implements PatientRepository {
  lastLimit: number | null = null;

  constructor(private readonly inner: InMemoryPatientRepository) {}

  async save(patient: Patient): Promise<void> {
    return this.inner.save(patient);
  }

  async findVisible(limit: number): Promise<Patient[]> {
    this.lastLimit = limit;
    return this.inner.findVisible(limit);
  }

  async findVisibleById(id: string): Promise<Patient | null> {
    return this.inner.findVisibleById(id);
  }
}

function makePatient(id: string, fullName: string): Patient {
  return Patient.create({
    id,
    fullName,
    phone: "(11) 5555-0001",
    purpose: "Cadastro fictício para teste",
  });
}

function makeUseCase(): {
  useCase: ListPatientsUseCase;
  spy: SpyPatientRepository;
} {
  const spy = new SpyPatientRepository(
    new InMemoryPatientRepository([
      makePatient(
        "00000000-0000-4000-8000-000000000002",
        "Paciente Fictícia Bravo",
      ),
      makePatient(
        "00000000-0000-4000-8000-000000000001",
        "Paciente Fictícia Alfa",
      ),
    ]),
  );
  return { useCase: new ListPatientsUseCase(spy), spy };
}

describe("ListPatientsUseCase", () => {
  it("lista os pacientes visíveis em ordem determinística", async () => {
    const { useCase } = makeUseCase();

    const patients = await useCase.execute({});

    expect(patients.map((patient) => patient.fullName)).toEqual([
      "Paciente Fictícia Alfa",
      "Paciente Fictícia Bravo",
    ]);
  });

  it("usa o teto padrão quando o limite não é informado", async () => {
    const { useCase, spy } = makeUseCase();

    await useCase.execute({});

    expect(spy.lastLimit).toBe(DEFAULT_PATIENTS_LIMIT);
  });

  it("repassa o limite informado para a porta (teto na query)", async () => {
    const { useCase, spy } = makeUseCase();

    const patients = await useCase.execute({ limit: 1 });

    expect(spy.lastLimit).toBe(1);
    expect(patients).toHaveLength(1);
  });
});
