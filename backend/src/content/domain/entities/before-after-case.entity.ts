import { InvalidContent } from "../errors/errors";

export type BeforeAfterCaseProps = {
  id: string;
  title: string;
  summary: string;
  sessions: string;
  recovery: string;
  goal: string;
};

export type BeforeAfterCaseSnapshot = BeforeAfterCaseProps & {
  hasConsent: boolean;
};

/* Invariante central do módulo: `hasConsent` nasce FECHADO (`false`) quando não informado —
   sem consentimento claro, o caso nunca é servido publicamente (docs/security/03-seguranca.md
   §5; spec backend-content). `restore` preserva o valor vindo do banco, sem confiar nele
   para liberar leitura: quem filtra é a porta `findConsented` + validação de saída. */
export class BeforeAfterCase {
  private constructor(private readonly props: BeforeAfterCaseSnapshot) {}

  static create(props: BeforeAfterCaseProps): BeforeAfterCase {
    const snapshot: BeforeAfterCaseSnapshot = { ...props, hasConsent: false };
    BeforeAfterCase.validate(snapshot);
    return new BeforeAfterCase(snapshot);
  }

  static restore(snapshot: BeforeAfterCaseSnapshot): BeforeAfterCase {
    BeforeAfterCase.validate(snapshot);
    return new BeforeAfterCase({ ...snapshot });
  }

  private static validate(props: BeforeAfterCaseSnapshot): void {
    if (props.id.trim().length === 0) {
      throw new InvalidContent("id não pode ser vazio");
    }
    if (props.title.trim().length === 0) {
      throw new InvalidContent("título não pode ser vazio");
    }
    if (props.summary.trim().length === 0) {
      throw new InvalidContent("resumo não pode ser vazio");
    }
    if (props.sessions.trim().length === 0) {
      throw new InvalidContent("sessões não podem ser vazias");
    }
    if (props.recovery.trim().length === 0) {
      throw new InvalidContent("recuperação não pode ser vazia");
    }
    if (props.goal.trim().length === 0) {
      throw new InvalidContent("objetivo não pode ser vazio");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get summary(): string {
    return this.props.summary;
  }

  get sessions(): string {
    return this.props.sessions;
  }

  get recovery(): string {
    return this.props.recovery;
  }

  get goal(): string {
    return this.props.goal;
  }

  get hasConsent(): boolean {
    return this.props.hasConsent;
  }
}
