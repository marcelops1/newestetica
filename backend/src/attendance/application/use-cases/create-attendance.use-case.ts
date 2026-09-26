import { randomUUID } from "node:crypto";
import { Attendance } from "../../domain/entities/attendance.entity";
import { InvalidAttendance, PatientNotFound } from "../../domain/errors/errors";
import type { AttendanceRepository } from "../../domain/ports/attendance.repository";
import type { PatientDirectory } from "../../domain/ports/patient-directory";

export type CreateAttendanceInput = {
  patientId: string;
  summary: string;
  performedAt: string;
};

/* O núcleo não confia no chamador: `new Date` sozinho aceitaria formatos frouxos
   ("10/09/2026" vira data nos EUA) — a data de realização só entra como datetime ISO
   (UTC ou offset), o mesmo formato do contrato. A checagem da instância é do domínio. */
const ISO_DATETIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function parsePerformedAt(value: string): Date {
  if (typeof value !== "string" || !ISO_DATETIME.test(value)) {
    throw new InvalidAttendance(
      "data de realização deve ser um datetime ISO (UTC ou offset)",
    );
  }
  return new Date(value);
}

/* O vínculo vem do path (emenda do design, decisão 1/7) e é validado por
   existência+visibilidade na porta PatientDirectory: paciente inexistente e
   anonimizada respondem o mesmo 404, sem criar nada. O patientId usado no registro
   é o da referência visível devolvida pela porta (não o texto cru da URL). */
export class CreateAttendanceUseCase {
  constructor(
    private readonly attendances: AttendanceRepository,
    private readonly patients: PatientDirectory,
  ) {}

  async execute(input: CreateAttendanceInput): Promise<Attendance> {
    const patient = await this.patients.findVisiblePatient(input.patientId);
    if (!patient) {
      throw new PatientNotFound();
    }
    const attendance = Attendance.create({
      id: randomUUID(),
      patientId: patient.id,
      summary: input.summary,
      performedAt: parsePerformedAt(input.performedAt),
    });
    await this.attendances.save(attendance);
    return attendance;
  }
}
