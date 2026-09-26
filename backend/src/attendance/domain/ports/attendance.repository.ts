import type { Attendance } from "../entities/attendance.entity";

/* Porta só da entidade única (sem UnitOfWork — decisão 4 do design): criação de
   atendimento não tem operação multi-agregado a atomizar. `findVisible*` carrega a
   invariante no nome: histórico de paciente anonimizada nunca aparece em leitura
   (a query filtra a relação `patient: { status: "active" }` — 2ª camada de defesa,
   além da checagem pela porta PatientDirectory). Sem update/delete: imutável. */
export interface AttendanceRepository {
  save(attendance: Attendance): Promise<void>;
  findVisibleByPatient(patientId: string, limit: number): Promise<Attendance[]>;
  findVisibleById(id: string, patientId: string): Promise<Attendance | null>;
}
