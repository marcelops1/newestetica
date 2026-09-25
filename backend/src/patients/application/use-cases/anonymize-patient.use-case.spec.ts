import { describe, expect, it } from "vitest";
import { InMemoryPatientRepository } from "../../../../test/fakes/in-memory-patient.repository";
import { Patient } from "../../domain/entities/patient.entity";
import { PatientNotFound } from "../../domain/errors/errors";
import { AnonymizePatientUseCase } from "./anonymize-patient.use-case";

const ACTIVE_ID = "00000000-0000-4000-8000-000000000001";

function makeRepository(): InMemoryPatientRepository {
  return new InMemoryPatientRepository([
    Patient.create({
      id: ACTIVE_ID,
      fullName: "Paciente Fictícia Alfa",
      phone: "(11) 5555-0001",
      purpose: "Cadastro fictício para teste",
    }),
  ]);
}

describe("AnonymizePatientUseCase", () => {
  it("anonimiza, persiste e o registro some das leituras visíveis", async () => {
    const repository = makeRepository();
    const useCase = new AnonymizePatientUseCase(repository);

    await useCase.execute(ACTIVE_ID);

    await expect(repository.findVisible(100)).resolves.toEqual([]);
    await expect(repository.findVisibleById(ACTIVE_ID)).resolves.toBeNull();
  });

  it("segundo DELETE e id inexistente respondem o mesmo PatientNotFound", async () => {
    const repository = makeRepository();
    const useCase = new AnonymizePatientUseCase(repository);
    await useCase.execute(ACTIVE_ID);

    await expect(useCase.execute(ACTIVE_ID)).rejects.toThrow(PatientNotFound);
    await expect(
      useCase.execute("00000000-0000-4000-8000-000000000099"),
    ).rejects.toThrow(PatientNotFound);
  });
});
