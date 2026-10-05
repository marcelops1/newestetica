import type { AuthenticatedIdentity } from "../claims";

/* Porta do domínio (design decisão 1): valida o token do Keycloak e devolve a
   identidade, ou nulo para QUALQUER falha — uma única resposta (401 idêntico),
   sem distinguir motivo (design decisão 8). Zero implementação aqui; a
   implementação (jose + JWKS) fica em infrastructure/ e o fake nos testes. */
export interface TokenValidator {
  validate(token: string): Promise<AuthenticatedIdentity | null>;
}
