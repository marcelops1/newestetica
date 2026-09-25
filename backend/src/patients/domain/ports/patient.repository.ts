import type { Patient } from "../entities/patient.entity";

/* Porta só da entidade única (sem UnitOfWork — decisão 3 do design): create/update/
   anonimização tocam um único `Patient`, não há operação multi-entidade a atomizar.
   `findVisible*` carrega a invariante no nome: anonimizada nunca aparece em leitura
   (precedente `findActive`/`findConsented`). */
export interface PatientRepository {
  save(patient: Patient): Promise<void>;
  findVisible(limit: number): Promise<Patient[]>;
  findVisibleById(id: string): Promise<Patient | null>;
}
