import { describe, expect, it } from "vitest";
import { InMemoryPatientRepository } from "../../../../test/fakes/in-memory-patient.repository";
import { InvalidPatient } from "../../domain/errors/errors";
import { CreatePatientUseCase } from "./create-patient.use-case";

const validInput = {
  fullName: "Paciente Fictícia Um",
  phone: "(11) 5555-0001",
  purpose: "Cadastro para acompanhamento na clínica",
};

describe("CreatePatientUseCase", () => {
  it("cria paciente com id gerado pelo servidor e persiste ativo", async () => {
    const repository = new InMemoryPatientRepository();
    const useCase = new CreatePatientUseCase(repository);

    const patient = await useCase.execute(validInput);

    expect(patient.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(patient.status).toBe("active");
    expect(patient.fullName).toBe(validInput.fullName);
    const visible = await repository.findVisible(100);
    expect(visible.map((item) => item.id)).toEqual([patient.id]);
  });

  it("gerou ids distintos em dois cadastros", async () => {
    const useCase = new CreatePatientUseCase(new InMemoryPatientRepository());

    const first = await useCase.execute(validInput);
    const second = await useCase.execute(validInput);

    expect(first.id).not.toBe(second.id);
  });

  it("rejeita entrada inválida sem persistir nada", async () => {
    const repository = new InMemoryPatientRepository();
    const useCase = new CreatePatientUseCase(repository);

    await expect(
      useCase.execute({ ...validInput, phone: "(11) 1234" }),
    ).rejects.toThrow(InvalidPatient);
    await expect(repository.findVisible(100)).resolves.toEqual([]);
  });
});
