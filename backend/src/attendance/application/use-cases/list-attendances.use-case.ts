import type { Attendance } from "../../domain/entities/attendance.entity";
import {
  InvalidAttendance,
  PatientNotFound,
} from "../../domain/errors/errors";
import type { AttendanceRepository } from "../../domain/ports/attendance.repository";
import type { PatientDirectory } from "../../domain/ports/patient-directory";

export const DEFAULT_ATTENDANCES_LIMIT = 100;
export const MAX_ATTENDANCES_LIMIT = 500;

export type ListAttendancesInput = {
  patientId: string;
  limit?: number;
};

/* O teto é validado de novo aqui (defesa em profundidade): a fronteira HTTP já reprova
   com 422, mas o núcleo não confia no chamador — o limite chega à query. Antes de
   listar, a paciente precisa estar visível (mesmo 404 de inexistente/anonimizada). */
export class ListAttendancesUseCase {
  constructor(
    private readonly attendances: AttendanceRepository,
    private readonly patients: PatientDirectory,
  ) {}

  async execute(input: ListAttendancesInput): Promise<Attendance[]> {
    const limit = input.limit ?? DEFAULT_ATTENDANCES_LIMIT;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_ATTENDANCES_LIMIT) {
      throw new InvalidAttendance(
        `limite fora do intervalo permitido (1..${MAX_ATTENDANCES_LIMIT})`,
      );
    }
    const patient = await this.patients.findVisiblePatient(input.patientId);
    if (!patient) {
      throw new PatientNotFound();
    }
    return this.attendances.findVisibleByPatient(patient.id, limit);
  }
}
