import { InvalidAttendance } from "../errors/errors";

export const MAX_ATTENDANCE_SUMMARY_LENGTH = 500;

export type AttendanceProps = {
  id: string;
  patientId: string;
  summary: string;
  performedAt: Date;
};

export type AttendanceSnapshot = AttendanceProps & {
  createdAt: Date;
  updatedAt: Date;
};

/* Histórico operacional imutável (design decisão 5): a entidade NÃO tem update nem
   delete — o que foi realizado não "desacontece"; correção se faz com novo registro,
   e a exclusão de dados pessoais acontece na paciente (anonimização). Sem dado clínico:
   `summary` é texto operacional opaco, nunca interpretado. */
export class Attendance {
  private constructor(private readonly props: AttendanceSnapshot) {}

  static create(props: AttendanceProps): Attendance {
    const now = new Date();
    const snapshot: AttendanceSnapshot = {
      ...props,
      createdAt: now,
      updatedAt: now,
    };
    Attendance.validate(snapshot);
    return new Attendance(snapshot);
  }

  static restore(snapshot: AttendanceSnapshot): Attendance {
    Attendance.validate(snapshot);
    return new Attendance({ ...snapshot });
  }

  private static validate(props: AttendanceSnapshot): void {
    if (props.id.trim().length === 0) {
      throw new InvalidAttendance("id não pode ser vazio");
    }
    if (props.patientId.trim().length === 0) {
      throw new InvalidAttendance("paciente não pode ser vazia");
    }
    const summaryLength = props.summary.trim().length;
    if (summaryLength < 1 || summaryLength > MAX_ATTENDANCE_SUMMARY_LENGTH) {
      throw new InvalidAttendance(
        `resumo deve ter entre 1 e ${MAX_ATTENDANCE_SUMMARY_LENGTH} caracteres`,
      );
    }
    if (Number.isNaN(props.performedAt.getTime())) {
      throw new InvalidAttendance("data de realização inválida");
    }
    if (
      Number.isNaN(props.createdAt.getTime()) ||
      Number.isNaN(props.updatedAt.getTime())
    ) {
      throw new InvalidAttendance("timestamps inválidos");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get summary(): string {
    return this.props.summary;
  }

  get performedAt(): Date {
    return this.props.performedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
