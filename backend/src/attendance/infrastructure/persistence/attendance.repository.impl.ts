import type { PrismaClient } from "../../../generated/prisma/client";
import type { Attendance } from "../../domain/entities/attendance.entity";
import type { AttendanceRepository } from "../../domain/ports/attendance.repository";
import {
  toAttendanceDomain,
  toAttendancePersistence,
} from "./mappers/attendance.mapper";

/* Sem UnitOfWork: o módulo só escreve entidade única (design decisão 4). A invariante
   "histórico de anonimizada nunca é servido" vive na QUERY (`patient: { status:
   "active" }` na relação), não em filtro de memória — o registro de paciente
   anonimizada não sai do banco em leitura visível (2ª camada, além da porta
   PatientDirectory). Histórico é imutável: só save (upsert) e leitura. */
export class PrismaAttendanceRepository implements AttendanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(attendance: Attendance): Promise<void> {
    const data = toAttendancePersistence(attendance);
    await this.prisma.attendance.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findVisibleByPatient(
    patientId: string,
    limit: number,
  ): Promise<Attendance[]> {
    const records = await this.prisma.attendance.findMany({
      where: { patientId, patient: { status: "active" } },
      orderBy: [{ performedAt: "desc" }, { id: "asc" }],
      take: limit,
    });
    return records.map(toAttendanceDomain);
  }

  async findVisibleById(
    id: string,
    patientId: string,
  ): Promise<Attendance | null> {
    const record = await this.prisma.attendance.findFirst({
      where: {
        id,
        patientId,
        patient: { status: "active" },
      },
    });
    if (!record) {
      return null;
    }
    return toAttendanceDomain(record);
  }
}
