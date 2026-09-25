import type { Patient } from "../../domain/entities/patient.entity";
import { InvalidPatient } from "../../domain/errors/errors";
import type { PatientRepository } from "../../domain/ports/patient.repository";

export const DEFAULT_PATIENTS_LIMIT = 100;
export const MAX_PATIENTS_LIMIT = 500;

export type ListPatientsInput = {
  limit?: number;
};

/* O teto é validado de novo aqui (defesa em profundidade): a fronteira HTTP já reprova
   com 422, mas o núcleo não confia no chamador — o limite chega à query (`findVisible`). */
export class ListPatientsUseCase {
  constructor(private readonly patients: PatientRepository) {}

  async execute(input: ListPatientsInput): Promise<Patient[]> {
    const limit = input.limit ?? DEFAULT_PATIENTS_LIMIT;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PATIENTS_LIMIT) {
      throw new InvalidPatient(
        `limite fora do intervalo permitido (1..${MAX_PATIENTS_LIMIT})`,
      );
    }
    return this.patients.findVisible(limit);
  }
}
