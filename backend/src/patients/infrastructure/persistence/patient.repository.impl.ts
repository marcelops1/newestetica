import type { PrismaClient } from "../../../generated/prisma/client";
import type { Patient } from "../../domain/entities/patient.entity";
import type { PatientRepository } from "../../domain/ports/patient.repository";
import {
  toPatientDomain,
  toPatientPersistence,
} from "./mappers/patient.mapper";

/* Sem UnitOfWork: o módulo só escreve entidade única (design decisão 3). A invariante
   "anonimizada nunca é servida" vive na QUERY (`where: status: "active"`), não em filtro
   de memória — o registro anonimizado não sai do banco em leitura visível. */
export class PrismaPatientRepository implements PatientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(patient: Patient): Promise<void> {
    const data = toPatientPersistence(patient);
    await this.prisma.patient.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }

  async findVisible(limit: number): Promise<Patient[]> {
    const records = await this.prisma.patient.findMany({
      where: { status: "active" },
      orderBy: [{ fullName: "asc" }, { id: "asc" }],
      take: limit,
    });
    return records.map(toPatientDomain);
  }

  async findVisibleById(id: string): Promise<Patient | null> {
    const record = await this.prisma.patient.findFirst({
      where: { id, status: "active" },
    });
    if (!record) {
      return null;
    }
    return toPatientDomain(record);
  }
}
