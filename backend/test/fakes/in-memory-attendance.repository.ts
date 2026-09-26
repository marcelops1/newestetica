import type { Attendance } from "../../src/attendance/domain/entities/attendance.entity";
import type { AttendanceRepository } from "../../src/attendance/domain/ports/attendance.repository";

/* Fake manual em memória (docs/07 §15: application testa contra fakes, nunca banco).
   `invisiblePatientIds` simula a relação filtrada da query real (defesa em profundidade
   do repositório): mesmo com registros existindo, paciente invisível não é servida. */
export class InMemoryAttendanceRepository implements AttendanceRepository {
  private readonly attendances: Attendance[];

  constructor(
    initial: Attendance[] = [],
    private readonly invisiblePatientIds: ReadonlySet<string> = new Set(),
  ) {
    this.attendances = [...initial];
  }

  async save(attendance: Attendance): Promise<void> {
    const index = this.attendances.findIndex(
      (item) => item.id === attendance.id,
    );
    if (index >= 0) {
      this.attendances[index] = attendance;
    } else {
      this.attendances.push(attendance);
    }
  }

  async findVisibleByPatient(
    patientId: string,
    limit: number,
  ): Promise<Attendance[]> {
    if (this.invisiblePatientIds.has(patientId)) {
      return [];
    }
    return this.attendances
      .filter((attendance) => attendance.patientId === patientId)
      .sort(
        (a, b) =>
          b.performedAt.getTime() - a.performedAt.getTime() ||
          a.id.localeCompare(b.id),
      )
      .slice(0, limit);
  }

  async findVisibleById(
    id: string,
    patientId: string,
  ): Promise<Attendance | null> {
    if (this.invisiblePatientIds.has(patientId)) {
      return null;
    }
    const found = this.attendances.find(
      (attendance) =>
        attendance.id === id && attendance.patientId === patientId,
    );
    return found ?? null;
  }
}
