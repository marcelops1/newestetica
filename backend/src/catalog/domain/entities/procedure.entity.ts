import { InvalidProcedure } from "../errors/errors";

/** Categorias válidas do catálogo — vocabulário do domínio (o contrato tem o próprio). */
export const TREATMENT_CATEGORIES = [
  "facial",
  "corporal",
  "rejuvenescimento",
] as const;

export type TreatmentCategory = (typeof TREATMENT_CATEGORIES)[number];

export type ProcedureProps = {
  id: string;
  name: string;
  description: string;
  duration: string;
  categories: TreatmentCategory[];
};

export type ProcedureSnapshot = ProcedureProps & {
  isActive: boolean;
};

export class Procedure {
  private constructor(private readonly props: ProcedureSnapshot) {}

  static create(props: ProcedureProps): Procedure {
    const snapshot: ProcedureSnapshot = { ...props, isActive: true };
    Procedure.validate(snapshot);
    return new Procedure(snapshot);
  }

  static restore(snapshot: ProcedureSnapshot): Procedure {
    Procedure.validate(snapshot);
    return new Procedure(snapshot);
  }

  private static validate(props: ProcedureSnapshot): void {
    if (props.id.trim().length === 0) {
      throw new InvalidProcedure("id não pode ser vazio");
    }
    if (props.name.trim().length === 0) {
      throw new InvalidProcedure("nome não pode ser vazio");
    }
    if (props.description.trim().length === 0) {
      throw new InvalidProcedure("descrição não pode ser vazia");
    }
    if (props.duration.trim().length === 0) {
      throw new InvalidProcedure("duração não pode ser vazia");
    }
    if (props.categories.length === 0) {
      throw new InvalidProcedure("categorias não podem ser vazias");
    }
    for (const category of props.categories) {
      if (!TREATMENT_CATEGORIES.includes(category)) {
        throw new InvalidProcedure(`categoria desconhecida: ${category}`);
      }
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get duration(): string {
    return this.props.duration;
  }

  get categories(): TreatmentCategory[] {
    return this.props.categories;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}
