import { InvalidAttendance } from "../errors/errors";

export const MAX_ATTENDANCE_SUMMARY_LENGTH = 500;
/** Teto do valor em centavos (R$ 100.000): bound do núcleo, espelhado no contrato. */
export const MAX_ATTENDANCE_AMOUNT_CENTS = 10_000_000;

export type AttendanceProps = {
  id: string;
  patientId: string;
  summary: string;
  amountCents?: number | null;
  performedAt: Date;
};

export type AttendanceSnapshot = AttendanceProps & {
  amountCents: number | null;
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
      id: props.id,
      patientId: props.patientId,
      summary: props.summary,
      /* Ausente = sem valor fechado: normaliza para nulo, nunca 0 (0 é um valor). */
      amountCents: props.amountCents ?? null,
      performedAt: props.performedAt,
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
    /* O núcleo não confia no chamador nem no banco: tipos confundidos (null, número)
       viram InvalidAttendance, nunca TypeError (adversarial — docs/07 §16d). */
    if (typeof props.id !== "string" || props.id.trim().length === 0) {
      throw new InvalidAttendance("id não pode ser vazio");
    }
    if (
      typeof props.patientId !== "string" ||
      props.patientId.trim().length === 0
    ) {
      throw new InvalidAttendance("paciente não pode ser vazia");
    }
    if (typeof props.summary !== "string") {
      throw new InvalidAttendance("resumo deve ser texto");
    }
    const summaryLength = props.summary.trim().length;
    if (summaryLength < 1 || summaryLength > MAX_ATTENDANCE_SUMMARY_LENGTH) {
      throw new InvalidAttendance(
        `resumo deve ter entre 1 e ${MAX_ATTENDANCE_SUMMARY_LENGTH} caracteres`,
      );
    }
    if (
      !(props.performedAt instanceof Date) ||
      Number.isNaN(props.performedAt.getTime())
    ) {
      throw new InvalidAttendance("data de realização inválida");
    }
    /* Valor é dinheiro: centavos inteiros no intervalo do teto, ou nulo (não
       informado). Tipo confundido (string, NaN, objeto) vira InvalidAttendance. */
    if (
      props.amountCents !== null &&
      (typeof props.amountCents !== "number" ||
        !Number.isInteger(props.amountCents) ||
        props.amountCents < 0 ||
        props.amountCents > MAX_ATTENDANCE_AMOUNT_CENTS)
    ) {
      throw new InvalidAttendance(
        `valor deve ser inteiro entre 0 e ${MAX_ATTENDANCE_AMOUNT_CENTS} centavos, ou nulo`,
      );
    }
    if (
      !(props.createdAt instanceof Date) ||
      Number.isNaN(props.createdAt.getTime()) ||
      !(props.updatedAt instanceof Date) ||
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

  get amountCents(): number | null {
    return this.props.amountCents;
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
