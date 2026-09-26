import type { Attendance as AttendanceRecord } from "../../../../generated/prisma/client";
import { Attendance } from "../../../domain/entities/attendance.entity";

/* Data Mapper (docs/architecture/04-decisoes-tecnicas.md §5): o registro do ORM nunca
   cruza para o domínio. O snapshot vindo do banco é dado não confiável e é validado
   pelo `Attendance.restore` (fonte única das regras) — sem revalidação aqui. */
export function toAttendanceDomain(record: AttendanceRecord): Attendance {
  return Attendance.restore({
    id: record.id,
    patientId: record.patientId,
    summary: record.summary,
    performedAt: record.performedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toAttendancePersistence(attendance: Attendance): {
  id: string;
  patientId: string;
  summary: string;
  performedAt: Date;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: attendance.id,
    patientId: attendance.patientId,
    summary: attendance.summary,
    performedAt: attendance.performedAt,
    createdAt: attendance.createdAt,
    updatedAt: attendance.updatedAt,
  };
}
