import type {
  PatientDirectory,
  VisiblePatient,
} from "../../src/attendance/domain/ports/patient-directory";

export class InMemoryPatientDirectory implements PatientDirectory {
  constructor(private readonly visible: VisiblePatient[] = []) {}

  async findVisiblePatient(id: string): Promise<VisiblePatient | null> {
    const found = this.visible.find((patient) => patient.id === id);
    return found ?? null;
  }
}
