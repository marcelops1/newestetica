import { PatientNotFound } from "../../domain/errors/errors";
import type { PatientRepository } from "../../domain/ports/patient.repository";

/* Anonimização (não exclusão física): o registro some de toda leitura visível e a PII
   vira placeholder — estrutura dos direitos do titular (LGPD, docs/security/03 §4). */
export class AnonymizePatientUseCase {
  constructor(private readonly patients: PatientRepository) {}

  async execute(id: string): Promise<void> {
    const patient = await this.patients.findVisibleById(id);
    if (!patient) {
      throw new PatientNotFound();
    }
    patient.anonymize();
    await this.patients.save(patient);
  }
}
