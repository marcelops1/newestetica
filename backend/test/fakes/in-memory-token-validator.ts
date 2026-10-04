import type { AuthenticatedIdentity } from "../../src/identity/domain/claims";
import type { TokenValidator } from "../../src/identity/domain/ports/token-validator";

/* Fake manual em memória (docs/07 §15: application testa contra fakes, nunca rede):
   mapa token → identidade; registra as chamadas para provar que entrada inválida
   nem toca a porta. */
export class InMemoryTokenValidator implements TokenValidator {
  public readonly calls: string[] = [];

  constructor(
    private readonly tokens: ReadonlyMap<string, AuthenticatedIdentity> = new Map(),
  ) {}

  async validate(token: string): Promise<AuthenticatedIdentity | null> {
    this.calls.push(token);
    const identity = this.tokens.get(token);
    return identity ? { ...identity, roles: [...identity.roles] } : null;
  }
}
