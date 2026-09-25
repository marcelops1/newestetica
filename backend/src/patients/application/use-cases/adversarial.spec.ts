import { describe, expect, it } from "vitest";
import { InMemoryPatientRepository } from "../../../../test/fakes/in-memory-patient.repository";
import { Patient } from "../../domain/entities/patient.entity";
import { InvalidPatient, PatientNotFound } from "../../domain/errors/errors";
import { AnonymizePatientUseCase } from "./anonymize-patient.use-case";
import { CreatePatientUseCase } from "./create-patient.use-case";
import { GetPatientByIdUseCase } from "./get-patient-by-id.use-case";
import { ListPatientsUseCase } from "./list-patients.use-case";
import { UpdatePatientUseCase } from "./update-patient.use-case";

/* Adversarial (docs/07 §16d): entradas hostis REAIS contra a superfície da aplicação,
   como defesa em profundidade — mesmo que a fronteira HTTP valide antes, o núcleo não
   confia no chamador. O nome/telefone são dados opacos: nunca são interpretados. */

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

const validInput = {
  fullName: "Paciente Fictícia Um",
  phone: "(11) 5555-0001",
  purpose: "Cadastro para acompanhamento na clínica",
};

describe("adversarial — entradas hostis contra os casos de uso", () => {
  it("nome/telefone/finalidade gigantes são rejeitados sem persistir", async () => {
    const repository = new InMemoryPatientRepository();
    const useCase = new CreatePatientUseCase(repository);

    await expect(
      useCase.execute({ ...validInput, fullName: "x".repeat(10_000) }),
    ).rejects.toThrow(InvalidPatient);
    await expect(
      useCase.execute({ ...validInput, phone: "9".repeat(10_000) }),
    ).rejects.toThrow(InvalidPatient);
    await expect(
      useCase.execute({ ...validInput, purpose: "x".repeat(10_000) }),
    ).rejects.toThrow(InvalidPatient);
    await expect(repository.findVisible(100)).resolves.toEqual([]);
  });

  it("texto com injeção/unicode/controle é dado opaco: não é interpretado nem alterado", async () => {
    const repository = new InMemoryPatientRepository();
    const useCase = new CreatePatientUseCase(repository);

    const hostileName = "Paciente ' OR '1'='1; DROP TABLE \"Patient\"; --";
    const patient = await useCase.execute({
      ...validInput,
      fullName: hostileName,
    });

    expect(patient.fullName).toBe(hostileName);
    const visible = await repository.findVisible(100);
    expect(visible[0]?.fullName).toBe(hostileName);
  });

  it("limite hostil (0, negativo, 501, gigante, fracionário, NaN) é rejeitado no núcleo", async () => {
    const useCase = new ListPatientsUseCase(makeRepository());

    for (const limit of [0, -1, 501, 10_000, 1.5, Number.NaN]) {
      await expect(
        useCase.execute({ limit }),
        `limite hostil: ${limit}`,
      ).rejects.toThrow(InvalidPatient);
    }
  });

  it("sonda de bypass: acesso direto a anonimizada responde não-encontrado em todas as operações", async () => {
    const repository = makeRepository();

    await expect(
      new GetPatientByIdUseCase(repository).execute(ANONYMIZED_ID),
    ).rejects.toThrow(PatientNotFound);
    await expect(
      new UpdatePatientUseCase(repository).execute(ANONYMIZED_ID, {
        phone: "(11) 5555-0009",
      }),
    ).rejects.toThrow(PatientNotFound);
    await expect(
      new AnonymizePatientUseCase(repository).execute(ANONYMIZED_ID),
    ).rejects.toThrow(PatientNotFound);
  });

  it("status injetado na atualização é neutralizado (não vira anonimização)", async () => {
    const repository = makeRepository();
    const useCase = new UpdatePatientUseCase(repository);

    const updated = await useCase.execute(ACTIVE_ID, {
      status: "anonymized",
    } as never);

    expect(updated.status).toBe("active");
    const visible = await repository.findVisible(100);
    expect(visible.map((patient) => patient.id)).toContain(ACTIVE_ID);
  });

  it("PatientNotFound nunca ecoa id nem PII (mensagem fixa)", async () => {
    const repository = makeRepository();

    await expect(
      new GetPatientByIdUseCase(repository).execute("id-secreto-fictício"),
    ).rejects.toThrow("Paciente não encontrada.");
  });
});
