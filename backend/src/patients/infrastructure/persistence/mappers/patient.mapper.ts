import type { Patient as PatientRecord } from "../../../../generated/prisma/client";
import {
  Patient,
  type PatientStatus,
} from "../../../domain/entities/patient.entity";

/* Data Mapper (docs/architecture/04-decisoes-tecnicas.md §5): o registro do ORM nunca
   cruza para o domínio; `anonymizedAt` é detalhe de persistência (fora do contrato).
   O status vindo do banco é dado não confiável e é validado pelo `Patient.restore`
   (fonte única do vocabulário) — sem revalidação aqui. */
export function toPatientDomain(record: PatientRecord): Patient {
  return Patient.restore({
    id: record.id,
    fullName: record.fullName,
    phone: record.phone,
    purpose: record.purpose,
    status: record.status as PatientStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    anonymizedAt: record.anonymizedAt,
  });
}

export function toPatientPersistence(patient: Patient): {
  id: string;
  fullName: string;
  phone: string;
  purpose: string;
  status: PatientStatus;
  createdAt: Date;
  updatedAt: Date;
  anonymizedAt: Date | null;
} {
  return {
    id: patient.id,
    fullName: patient.fullName,
    phone: patient.phone,
    purpose: patient.purpose,
    status: patient.status,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
    anonymizedAt: patient.anonymizedAt,
  };
}
