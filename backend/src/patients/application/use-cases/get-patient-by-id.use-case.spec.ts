import { describe, expect, it } from "vitest";
import { InMemoryPatientRepository } from "../../../../test/fakes/in-memory-patient.repository";
import { Patient } from "../../domain/entities/patient.entity";
import { PatientNotFound } from "../../domain/errors/errors";
import { GetPatientByIdUseCase } from "./get-patient-by-id.use-case";

const ACTIVE_ID = "00000000-0000-4000-8000-000000000001";
const ANONYMIZED_ID = "00000000-0000-4000-8000-000000000002";

function makeUseCase(): GetPatientByIdUseCase {
  const anonymized = Patient.create({
    id: ANONYMIZED_ID,
    fullName: "Paciente Fictícia Bravo",
    phone: "(11) 5555-0002",
    purpose: "Cadastro fictício para teste",
  });
  anonymized.anonymize();
  return new GetPatientByIdUseCase(
    new InMemoryPatientRepository([
      Patient.create({
        id: ACTIVE_ID,
        fullName: "Paciente Fictícia Alfa",
        phone: "(11) 5555-0001",
        purpose: "Cadastro fictício para teste",
      }),
      anonymized,
    ]),
  );
}

describe("GetPatientByIdUseCase", () => {
  it("retorna o paciente ativo pelo id", async () => {
    const patient = await makeUseCase().execute(ACTIVE_ID);

    expect(patient.id).toBe(ACTIVE_ID);
    expect(patient.fullName).toBe("Paciente Fictícia Alfa");
  });

  it("id inexistente e id anonimizado respondem o mesmo PatientNotFound", async () => {
    const useCase = makeUseCase();

    await expect(
      useCase.execute("00000000-0000-4000-8000-000000000099"),
    ).rejects.toThrow(PatientNotFound);
    await expect(useCase.execute(ANONYMIZED_ID)).rejects.toThrow(
      PatientNotFound,
    );
  });

  it("PatientNotFound não ecoa id nem PII (mensagem genérica)", async () => {
    await expect(
      makeUseCase().execute("00000000-0000-4000-8000-000000000099"),
    ).rejects.toThrow("Paciente não encontrada.");
  });
});
