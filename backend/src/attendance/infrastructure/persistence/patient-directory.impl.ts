import type { PrismaClient } from "../../../generated/prisma/client";
import type {
  PatientDirectory,
  VisiblePatient,
} from "../../domain/ports/patient-directory";

/* Leitura cruzada explícita (design decisão 3): consulta a tabela Patient com o
   MESMO filtro de visibilidade do dono (`status: "active"`), selecionando só o
   vínculo — sem importar o domínio de Pacientes e sem materializar PII. */
export class PrismaPatientDirectory implements PatientDirectory {
  constructor(private readonly prisma: PrismaClient) {}

  async findVisiblePatient(id: string): Promise<VisiblePatient | null> {
    const record = await this.prisma.patient.findFirst({
      where: { id, status: "active" },
      select: { id: true },
    });
    return record;
  }
}
