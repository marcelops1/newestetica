import { InvalidPatient } from "../errors/errors";

/** Status do cadastro — vocabulário do domínio (o contrato tem o próprio). */
export const PATIENT_STATUSES = ["active", "anonymized"] as const;

export type PatientStatus = (typeof PATIENT_STATUSES)[number];

/* Placeholders fixos da anonimização (docs/security/03-seguranca.md §4): PII é
   substituída por valores constantes, sem correlação entre registros; o id permanece
   para a integridade referencial e o registro sai de toda leitura pública. */
export const ANONYMIZED_NAME = "Paciente anonimizada";
export const ANONYMIZED_PHONE = "(00) 0000-0000";
export const ANONYMIZED_PURPOSE = "Finalidade removida (anonimização)";

export type PatientProps = {
  id: string;
  fullName: string;
  phone: string;
  purpose: string;
};

export type PatientSnapshot = PatientProps & {
  status: PatientStatus;
  createdAt: Date;
  updatedAt: Date;
  anonymizedAt: Date | null;
};

/** Telefone/WhatsApp com DDD: mínimo 10 dígitos — mesma regra do contrato. */
const hasDddDigits = (value: string) => value.replace(/\D/g, "").length >= 10;

export class Patient {
  private constructor(private readonly props: PatientSnapshot) {}

  static create(props: PatientProps): Patient {
    const now = new Date();
    const snapshot: PatientSnapshot = {
      ...props,
      status: "active",
      createdAt: now,
      updatedAt: now,
      anonymizedAt: null,
    };
    Patient.validate(snapshot);
    return new Patient(snapshot);
  }

  static restore(snapshot: PatientSnapshot): Patient {
    Patient.validate(snapshot);
    return new Patient({ ...snapshot });
  }

  private static validate(props: PatientSnapshot): void {
    if (props.id.trim().length === 0) {
      throw new InvalidPatient("id não pode ser vazio");
    }
    const nameLength = props.fullName.trim().length;
    if (nameLength < 2 || nameLength > 120) {
      throw new InvalidPatient("nome deve ter entre 2 e 120 caracteres");
    }
    if (
      props.phone.length === 0 ||
      props.phone.length > 20 ||
      !hasDddDigits(props.phone)
    ) {
      throw new InvalidPatient(
        "telefone deve ter no máximo 20 caracteres e ao menos 10 dígitos",
      );
    }
    const purposeLength = props.purpose.trim().length;
    if (purposeLength < 1 || purposeLength > 200) {
      throw new InvalidPatient("finalidade deve ter entre 1 e 200 caracteres");
    }
    if (!PATIENT_STATUSES.includes(props.status)) {
      throw new InvalidPatient(`status desconhecido: ${props.status}`);
    }
  }

  get id(): string {
    return this.props.id;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get phone(): string {
    return this.props.phone;
  }

  get purpose(): string {
    return this.props.purpose;
  }

  get status(): PatientStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get anonymizedAt(): Date | null {
    return this.props.anonymizedAt;
  }

  /** Atualização parcial: só PII; valida o candidato antes de aplicar. */
  update(changes: Partial<PatientProps>): void {
    if (this.props.status !== "active") {
      throw new InvalidPatient("paciente anonimizada não pode ser atualizada");
    }
    const candidate: PatientSnapshot = {
      ...this.props,
      ...(changes.fullName !== undefined ? { fullName: changes.fullName } : {}),
      ...(changes.phone !== undefined ? { phone: changes.phone } : {}),
      ...(changes.purpose !== undefined ? { purpose: changes.purpose } : {}),
    };
    Patient.validate(candidate);
    Object.assign(this.props, candidate);
    this.props.updatedAt = new Date();
  }

  /** Anonimização: substitui a PII por placeholders fixos e carimba o status. */
  anonymize(): void {
    if (this.props.status !== "active") {
      throw new InvalidPatient("paciente já anonimizada");
    }
    const now = new Date();
    this.props.fullName = ANONYMIZED_NAME;
    this.props.phone = ANONYMIZED_PHONE;
    this.props.purpose = ANONYMIZED_PURPOSE;
    this.props.status = "anonymized";
    this.props.anonymizedAt = now;
    this.props.updatedAt = now;
  }
}
