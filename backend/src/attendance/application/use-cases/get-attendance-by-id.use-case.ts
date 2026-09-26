import type { Attendance } from "../../domain/entities/attendance.entity";
import { AttendanceNotFound, PatientNotFound } from "../../domain/errors/errors";
import type { AttendanceRepository } from "../../domain/ports/attendance.repository";
import type { PatientDirectory } from "../../domain/ports/patient-directory";

/* Duas checagens em profundidade: a paciente precisa estar visível (PatientNotFound,
   anti-enumeração) e o atendimento precisa pertencer a ela e estar visível na query
   (AttendanceNotFound). Cruzado entre pacientes, inexistente e o cenário TOCTOU
   (anonimizada entre a checagem e a query) respondem o MESMO 404. */
export class GetAttendanceByIdUseCase {
  constructor(
    private readonly attendances: AttendanceRepository,
    private readonly patients: PatientDirectory,
  ) {}

  async execute(patientId: string, attendanceId: string): Promise<Attendance> {
    const patient = await this.patients.findVisiblePatient(patientId);
    if (!patient) {
      throw new PatientNotFound();
    }
    const attendance = await this.attendances.findVisibleById(
      attendanceId,
      patient.id,
    );
    if (!attendance) {
      throw new AttendanceNotFound();
    }
    return attendance;
  }
}
