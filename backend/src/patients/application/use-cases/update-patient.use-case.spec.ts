import { describe, expect, it } from "vitest";
import { InMemoryPatientRepository } from "../../../../test/fakes/in-memory-patient.repository";
import { Patient } from "../../domain/entities/patient.entity";
import { InvalidPatient, PatientNotFound } from "../../domain/errors/errors";
import { UpdatePatientUseCase } from "./update-patient.use-case";

const ACTIVE_ID = "00000000-0000-4000-8000-000000000001";
const ANONYMIZED_ID = "00000000-0000-4000-8000-000000000002";

function makeRepository(): InMemoryPatientRepository {
  const anonymized = Patient.create({
    id: ANONYMIZED_ID,
    fullName: "Paciente Fictícia Bravo",
    phone: "(11) 5555-0002",
    purpose: "Cadastro fictício para teste",
  });
  anonymized.anonymize();
  return new InMemoryPatientRepository([
    Patient.create({
      id: ACTIVE_ID,
      fullName: "Paciente Fictícia Alfa",
      phone: "(11) 5555-0001",
      purpose: "Cadastro fictício para teste",
    }),
    anonymized,
  ]);
}

describe("UpdatePatientUseCase", () => {
  it("atualiza parcialmente preservando os demais campos e persiste", async () => {
    const repository = makeRepository();
    const useCase = new UpdatePatientUseCase(repository);

    const updated = await useCase.execute(ACTIVE_ID, {
      phone: "(11) 5555-0009",
    });

    expect(updated.phone).toBe("(11) 5555-0009");
    expect(updated.fullName).toBe("Paciente Fictícia Alfa");
    expect(updated.purpose).toBe("Cadastro fictício para teste");
    const visible = await repository.findVisible(100);
    expect(visible[0]?.phone).toBe("(11) 5555-0009");
  });

  it("id inexistente e id anonimizado respondem o mesmo PatientNotFound", async () => {
    const useCase = new UpdatePatientUseCase(makeRepository());

    await expect(
      useCase.execute("00000000-0000-4000-8000-000000000099", {
        phone: "(11) 5555-0009",
      }),
    ).rejects.toThrow(PatientNotFound);
    await expect(
      useCase.execute(ANONYMIZED_ID, { phone: "(11) 5555-0009" }),
    ).rejects.toThrow(PatientNotFound);
  });

  it("mudança inválida é rejeitada e nada é persistido (valida antes de aplicar)", async () => {
    const repository = makeRepository();
    const useCase = new UpdatePatientUseCase(repository);

    await expect(
      useCase.execute(ACTIVE_ID, { phone: "(11) 1234" }),
    ).rejects.toThrow(InvalidPatient);

    const visible = await repository.findVisible(100);
    expect(visible[0]?.phone).toBe("(11) 5555-0001");
  });
});
