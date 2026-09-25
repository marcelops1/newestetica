import type { Patient } from "../../domain/entities/patient.entity";
import { PatientNotFound } from "../../domain/errors/errors";
import type { PatientRepository } from "../../domain/ports/patient.repository";

export type UpdatePatientChanges = Partial<{
  fullName: string;
  phone: string;
  purpose: string;
}>;

export class UpdatePatientUseCase {
  constructor(private readonly patients: PatientRepository) {}

  async execute(id: string, changes: UpdatePatientChanges): Promise<Patient> {
    const patient = await this.patients.findVisibleById(id);
    if (!patient) {
      throw new PatientNotFound();
    }
    patient.update(changes);
    await this.patients.save(patient);
    return patient;
  }
}
