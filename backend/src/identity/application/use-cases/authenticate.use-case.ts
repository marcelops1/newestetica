import type { AuthenticatedIdentity } from "../../domain/claims";
import type { TokenValidator } from "../../domain/ports/token-validator";

/* Caso de uso de autenticação (design decisão 1): o núcleo não confia no chamador —
   entrada não-string/vazia vira nulo SEM tocar a porta; qualquer falha da porta
   (token inválido, expirado, assinatura errada, …) também vira nulo. Uma única
   resposta de falha (401 idêntico na fronteira), sem oracle (decisão 8).
   O método `verify` satisfaz estruturalmente a porta do guard do kernel; a conversão
   é a identidade do domínio (roles readonly Role[] ⊆ readonly string[]). */
export class AuthenticateUseCase {
  constructor(private readonly validator: TokenValidator) {}

  async verify(token: string): Promise<AuthenticatedIdentity | null> {
    if (typeof token !== "string" || token.trim().length === 0) {
      return null;
    }
    return this.validator.validate(token);
  }
}
