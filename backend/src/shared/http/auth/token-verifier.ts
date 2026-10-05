/* Kernel técnico compartilhado (docs/architecture/02-arquitetura.md §3; decisão 22 do
   04 prevê guards de autenticação no kernel): contrato genérico entre o guard de
   autenticação (plumbing) e o módulo de Identidade, que fornece a implementação.
   O kernel nunca importa módulos; o shape é agnóstico de domínio (sujeito + papéis
   como strings). */

export const TOKEN_VERIFIER = Symbol("TOKEN_VERIFIER");

export type VerifiedIdentity = {
  subject: string;
  roles: readonly string[];
};

export interface TokenVerifier {
  /** Devolve a identidade verificada ou nulo para QUALQUER falha (401 idêntico). */
  verify(token: string): Promise<VerifiedIdentity | null>;
}

/** 401 único para todas as falhas de autenticação (design decisão 8 — sem oracle). */
export const AUTH_UNAUTHENTICATED_CODE = "AUTH_UNAUTHENTICATED";
export const AUTH_UNAUTHENTICATED_MESSAGE = "Autenticação necessária.";

/** 403 único para papel ausente OU insuficiente (design decisão 8). */
export const AUTH_FORBIDDEN_CODE = "AUTH_FORBIDDEN";
export const AUTH_FORBIDDEN_MESSAGE = "Acesso negado.";

/** Teto de tamanho do token (anti-DoS): acima disso, 401 sem chamar o verificador. */
export const MAX_TOKEN_LENGTH = 8_192;
