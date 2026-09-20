import type { UnitOfWork } from "../../src/scheduling/domain/ports/unit-of-work.port";

export interface TransactionalFake {
  snapshot(): unknown;
  restore(snapshot: unknown): void;
}

/**
 * Fake transacional para fluxo ÚNICO: no rollback, restaura o estado global dos
 * participantes. NÃO modela isolamento entre transações sobrepostas (um rollback
 * desfaria escritas já commitadas por outra transação) — a prova de concorrência
 * real é a integração com Postgres (task 3.8); testes concorrentes devem usar
 * este fake sem participantes.
 */
export class FakeUnitOfWork implements UnitOfWork {
  executions = 0;

  constructor(
    private readonly participants: readonly TransactionalFake[] = [],
  ) {}

  async execute<T>(work: () => Promise<T>): Promise<T> {
    this.executions += 1;
    const snapshots = this.participants.map((participant) =>
      participant.snapshot(),
    );
    try {
      return await work();
    } catch (error) {
      this.participants.forEach((participant, index) => {
        participant.restore(snapshots[index]);
      });
      throw error;
    }
  }
}
