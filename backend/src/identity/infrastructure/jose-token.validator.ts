import { createRemoteJWKSet, jwtVerify } from "jose";
import { fromTokenClaims, type AuthenticatedIdentity } from "../domain/claims";
import type { TokenValidator } from "../domain/ports/token-validator";

/* Validador real do JWT do Keycloak (design decisão 1): assinatura via JWKS do
   realm (cache com TTL + cooldown de refetch), emissor, audiência, expiração com
   tolerância de relógio fixa e allowlist de algoritmo. Toda falha — token ausente,
   malformado, expirado, assinatura/issuer/audience inválidos, `alg` fora da
   allowlist, chave desconhecida — vira a MESMA resposta: null (design decisão 8;
   o guard traduz para 401 idêntico). O núcleo do guard nunca vê o motivo. */

/** Allowlist de algoritmos: só o que o realm emite (`RS256`); nunca `none`/HMAC. */
export const ALLOWED_ALGORITHMS = ["RS256"] as const;

/** TTL do cache do JWKS: 10 minutos — sem fetch por requisição, com rotação
    absorvida em até um TTL (ou imediatamente, via refetch por `kid` desconhecido). */
export const DEFAULT_CACHE_TTL_MS = 600_000;

/** Cooldown mínimo entre refetches por `kid` desconhecido: 30 s — um atacante com
    tokens de `kid` inventado não transforma o JWKS em alvo de flood. */
export const DEFAULT_JWKS_COOLDOWN_MS = 30_000;

/** Tolerância de relógio: 30 s para os dois lados — cobre skew entre containers. */
export const DEFAULT_CLOCK_TOLERANCE_SECONDS = 30;

/** Teto de tamanho do token (plumbing anti-DoS): acima disso, null sem tocar a rede. */
export const MAX_TOKEN_LENGTH = 8_192;

export type JoseTokenValidatorOptions = {
  jwksUrl: string;
  issuer: string;
  audience: string;
  algorithms?: readonly string[];
  clockToleranceSeconds?: number;
  cacheMaxAgeMs?: number;
  cooldownDurationMs?: number;
};

export class JoseTokenValidator implements TokenValidator {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly algorithms: string[];
  private readonly clockToleranceSeconds: number;

  constructor(options: JoseTokenValidatorOptions) {
    this.jwks = createRemoteJWKSet(new URL(options.jwksUrl), {
      cacheMaxAge: options.cacheMaxAgeMs ?? DEFAULT_CACHE_TTL_MS,
      cooldownDuration: options.cooldownDurationMs ?? DEFAULT_JWKS_COOLDOWN_MS,
    });
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.algorithms = [...(options.algorithms ?? ALLOWED_ALGORITHMS)];
    this.clockToleranceSeconds =
      options.clockToleranceSeconds ?? DEFAULT_CLOCK_TOLERANCE_SECONDS;
  }

  async validate(token: string): Promise<AuthenticatedIdentity | null> {
    if (
      typeof token !== "string" ||
      token.length === 0 ||
      token.length > MAX_TOKEN_LENGTH
    ) {
      return null;
    }
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: this.algorithms,
        clockTolerance: this.clockToleranceSeconds,
      });
      return fromTokenClaims(payload);
    } catch {
      /* Falha fechado e silenciosa para o cliente: sem eco de `kid`, claim ou
         motivo (o detalhe operacional não é exposto ao atacante). */
      return null;
    }
  }
}

/* Configuração por ambiente (fail-fast): o backend não sobe sem issuer e audience;
   a URL do JWKS é derivada do issuer (convenção do Keycloak) salvo override. */
export function createJoseTokenValidatorFromEnv(): JoseTokenValidator {
  const issuer = process.env.KEYCLOAK_ISSUER;
  const audience = process.env.KEYCLOAK_AUDIENCE;
  if (!issuer || !audience) {
    throw new Error(
      "KEYCLOAK_ISSUER e KEYCLOAK_AUDIENCE são obrigatórios para o backend",
    );
  }
  const jwksUrl =
    process.env.KEYCLOAK_JWKS_URL ?? `${issuer}/protocol/openid-connect/certs`;
  return new JoseTokenValidator({ jwksUrl, issuer, audience });
}
