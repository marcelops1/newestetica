import { randomUUID } from "node:crypto";
import { Patient } from "../../domain/entities/patient.entity";
import type { PatientRepository } from "../../domain/ports/patient.repository";

export type CreatePatientInput = {
  fullName: string;
  phone: string;
  purpose: string;
};

export class CreatePatientUseCase {
  constructor(private readonly patients: PatientRepository) {}

  async execute(input: CreatePatientInput): Promise<Patient> {
    const patient = Patient.create({ id: randomUUID(), ...input });
    await this.patients.save(patient);
    return patient;
  }
}
