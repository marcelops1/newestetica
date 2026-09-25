import type { Patient } from "../../domain/entities/patient.entity";
import { PatientNotFound } from "../../domain/errors/errors";
import type { PatientRepository } from "../../domain/ports/patient.repository";

/* O id é entrada opaca: inexistente e anonimizado respondem o mesmo PatientNotFound,
   sem distinguir motivos (anti-enumeração — spec backend-patients). */
export class GetPatientByIdUseCase {
  constructor(private readonly patients: PatientRepository) {}

  async execute(id: string): Promise<Patient> {
    const patient = await this.patients.findVisibleById(id);
    if (!patient) {
      throw new PatientNotFound();
    }
    return patient;
  }
}
