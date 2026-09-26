import { describe, expect, it } from "vitest";
import { InMemoryAttendanceRepository } from "../../../../test/fakes/in-memory-attendance.repository";
import { InMemoryPatientDirectory } from "../../../../test/fakes/in-memory-patient-directory";
import { Attendance } from "../../domain/entities/attendance.entity";
import {
  AttendanceNotFound,
  PatientNotFound,
} from "../../domain/errors/errors";
import { GetAttendanceByIdUseCase } from "./get-attendance-by-id.use-case";

const PATIENT_ID = "00000000-0000-4000-8000-000000000101";
const OTHER_PATIENT_ID = "00000000-0000-4000-8000-000000000102";
const ATTENDANCE_ID = "00000000-0000-4000-8000-000000000201";

function makeAttendance(): Attendance {
  return Attendance.create({
    id: ATTENDANCE_ID,
    patientId: PATIENT_ID,
    summary: "Atendimento fictício.",
    performedAt: new Date("2026-09-10T14:30:00.000Z"),
  });
}

function makeUseCase(
  invisiblePatientIds: ReadonlySet<string> = new Set(),
): GetAttendanceByIdUseCase {
  return new GetAttendanceByIdUseCase(
    new InMemoryAttendanceRepository([makeAttendance()], invisiblePatientIds),
    new InMemoryPatientDirectory([
      { id: PATIENT_ID },
      { id: OTHER_PATIENT_ID },
    ]),
  );
}

describe("GetAttendanceByIdUseCase", () => {
  it("encontra o atendimento da paciente com o id completo", async () => {
    const attendance = await makeUseCase().execute(PATIENT_ID, ATTENDANCE_ID);

    expect(attendance.id).toBe(ATTENDANCE_ID);
    expect(attendance.patientId).toBe(PATIENT_ID);
  });

  it("detalhe cruzado entre pacientes responde não-encontrado", async () => {
    await expect(
      makeUseCase().execute(OTHER_PATIENT_ID, ATTENDANCE_ID),
    ).rejects.toThrow(AttendanceNotFound);
  });

  it("atendimento inexistente responde não-encontrado", async () => {
    await expect(
      makeUseCase().execute(PATIENT_ID, "00000000-0000-4000-8000-000000000999"),
    ).rejects.toThrow(AttendanceNotFound);
  });

  it("paciente inexistente ou invisível responde não-encontrado antes da query", async () => {
    const useCase = new GetAttendanceByIdUseCase(
      new InMemoryAttendanceRepository([makeAttendance()]),
      new InMemoryPatientDirectory([]),
    );

    await expect(useCase.execute(PATIENT_ID, ATTENDANCE_ID)).rejects.toThrow(
      PatientNotFound,
    );
  });

  it("sonda TOCTOU: visível na porta mas invisível na query responde o mesmo 404", async () => {
    const useCase = makeUseCase(new Set([PATIENT_ID]));

    await expect(useCase.execute(PATIENT_ID, ATTENDANCE_ID)).rejects.toThrow(
      AttendanceNotFound,
    );
  });
});
