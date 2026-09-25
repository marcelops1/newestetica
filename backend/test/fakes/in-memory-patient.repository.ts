import type { Patient } from "../../src/patients/domain/entities/patient.entity";
import type { PatientRepository } from "../../src/patients/domain/ports/patient.repository";

export class InMemoryPatientRepository implements PatientRepository {
  private readonly patients: Patient[];

  constructor(initial: Patient[] = []) {
    this.patients = [...initial];
  }

  async save(patient: Patient): Promise<void> {
    const index = this.patients.findIndex((item) => item.id === patient.id);
    if (index >= 0) {
      this.patients[index] = patient;
    } else {
      this.patients.push(patient);
    }
  }

  async findVisible(limit: number): Promise<Patient[]> {
    return this.patients
      .filter((patient) => patient.status === "active")
      .sort(
        (a, b) =>
          a.fullName.localeCompare(b.fullName) || a.id.localeCompare(b.id),
      )
      .slice(0, limit);
  }

  async findVisibleById(id: string): Promise<Patient | null> {
    const found = this.patients.find(
      (patient) => patient.id === id && patient.status === "active",
    );
    return found ?? null;
  }
}
