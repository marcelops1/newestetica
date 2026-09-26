import { describe, expect, it } from "vitest";
import { InMemoryAttendanceRepository } from "../../../../test/fakes/in-memory-attendance.repository";
import { InMemoryPatientDirectory } from "../../../../test/fakes/in-memory-patient-directory";
import { InvalidAttendance, PatientNotFound } from "../../domain/errors/errors";
import { CreateAttendanceUseCase } from "./create-attendance.use-case";

const PATIENT_ID = "00000000-0000-4000-8000-000000000101";

const validInput = {
  patientId: PATIENT_ID,
  summary: "Limpeza de pele realizada, sem intercorrências.",
  performedAt: "2026-09-10T14:30:00.000Z",
};

function makeUseCase(): {
  useCase: CreateAttendanceUseCase;
  attendances: InMemoryAttendanceRepository;
} {
  const attendances = new InMemoryAttendanceRepository();
  const patients = new InMemoryPatientDirectory([{ id: PATIENT_ID }]);
  return { useCase: new CreateAttendanceUseCase(attendances, patients), attendances };
}

describe("CreateAttendanceUseCase", () => {
  it("registra atendimento de paciente visível com id gerado pelo servidor", async () => {
    const { useCase, attendances } = makeUseCase();

    const attendance = await useCase.execute(validInput);

    expect(attendance.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(attendance.patientId).toBe(PATIENT_ID);
    expect(attendance.summary).toBe(validInput.summary);
    expect(attendance.performedAt.toISOString()).toBe(
      "2026-09-10T14:30:00.000Z",
    );
    await expect(
      attendances.findVisibleByPatient(PATIENT_ID, 100),
    ).resolves.toHaveLength(1);
  });

  it("gerou ids distintos em dois registros", async () => {
    const { useCase } = makeUseCase();

    const first = await useCase.execute(validInput);
    const second = await useCase.execute(validInput);

    expect(first.id).not.toBe(second.id);
  });

  it("paciente inexistente ou invisível responde o mesmo não-encontrado sem criar nada", async () => {
    const attendances = new InMemoryAttendanceRepository();
    const useCase = new CreateAttendanceUseCase(
      attendances,
      new InMemoryPatientDirectory([]),
    );

    await expect(useCase.execute(validInput)).rejects.toThrow(PatientNotFound);
    await expect(
      attendances.findVisibleByPatient(PATIENT_ID, 100),
    ).resolves.toEqual([]);
  });

  it("resumo vazio/gigante e data inválida são rejeitados sem persistir", async () => {
    const { useCase, attendances } = makeUseCase();

    await expect(
      useCase.execute({ ...validInput, summary: "   " }),
    ).rejects.toThrow(InvalidAttendance);
    await expect(
      useCase.execute({ ...validInput, summary: "x".repeat(501) }),
    ).rejects.toThrow(InvalidAttendance);
    await expect(
      useCase.execute({ ...validInput, performedAt: "10/09/2026" }),
    ).rejects.toThrow(InvalidAttendance);
    await expect(
      attendances.findVisibleByPatient(PATIENT_ID, 100),
    ).resolves.toEqual([]);
  });
});
