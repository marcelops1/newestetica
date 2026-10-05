import { afterEach, describe, expect, it } from "vitest";
import { startFakeJwks, type FakeJwks } from "../fakes/fake-jwks";
import {
  ALLOWED_ALGORITHMS,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_CLOCK_TOLERANCE_SECONDS,
  DEFAULT_JWKS_COOLDOWN_MS,
  JoseTokenValidator,
  MAX_TOKEN_LENGTH,
  createJoseTokenValidatorFromEnv,
} from "../../src/identity/infrastructure/jose-token.validator";

/* Integração do validador real (design decisões 1 e 8): JWKS fake local com chaves
   RSA de verdade; o validador usa o jose com allowlist de `alg`, cache com TTL e
   passa a tolerância de relógio fixa. Toda falha é uma única resposta: null. */

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanups.length > 0) {
    await cleanups.pop()!();
  }
});

async function makeValidator(
  jwks: FakeJwks,
  overrides: Partial<ConstructorParameters<typeof JoseTokenValidator>[0]> = {},
): Promise<JoseTokenValidator> {
  return new JoseTokenValidator({
    jwksUrl: jwks.jwksUrl,
    issuer: jwks.issuer,
    audience: jwks.audience,
    cacheMaxAgeMs: 5_000,
    cooldownDurationMs: 1,
    ...overrides,
  });
}

async function fakeJwks(): Promise<FakeJwks> {
  const jwks = await startFakeJwks();
  cleanups.push(() => jwks.close());
  return jwks;
}

describe("JoseTokenValidator (JWKS real contra servidor fake)", () => {
  it("valida token legítimo e devolve a identidade com papéis conhecidos (round-trip)", async () => {
    const jwks = await fakeJwks();
    const validator = await makeValidator(jwks);
    const token = await jwks.sign({
      sub: "00000000-0000-4000-8000-000000000001",
      realm_access: { roles: ["admin", "offline_access"] },
    });

    await expect(validator.validate(token)).resolves.toEqual({
      subject: "00000000-0000-4000-8000-000000000001",
      roles: ["admin"],
    });
  });

  it("token malformado, vazio, gigante ou de outro tipo vira null; gigante nem toca o JWKS", async () => {
    const jwks = await fakeJwks();
    const validator = await makeValidator(jwks);
    const before = jwks.requestCount();

    for (const token of [
      "",
      "não-é-jwt",
      "a.b.c",
      "x".repeat(MAX_TOKEN_LENGTH + 1),
      42 as never,
      null as never,
    ]) {
      await expect(
        validator.validate(token),
        `token hostil: ${JSON.stringify(String(token)).slice(0, 40)}`,
      ).resolves.toBeNull();
    }

    expect(jwks.requestCount()).toBe(before);
  });

  it("assinatura de chave estranha (mesmo kid) e kid desconhecido viram null", async () => {
    const jwks = await fakeJwks();
    const validator = await makeValidator(jwks);
    const foreign = await startFakeJwks();
    cleanups.push(() => foreign.close());

    const sameKidWrongKey = await foreign.sign(
      { sub: "attacker" },
      { kid: jwks.currentKey().kid, key: foreign.currentKey() },
    );
    const unknownKid = await foreign.sign({ sub: "attacker" });

    await expect(validator.validate(sameKidWrongKey)).resolves.toBeNull();
    await expect(validator.validate(unknownKid)).resolves.toBeNull();
  });

  it("cache: validações repetidas não refazem fetch do JWKS", async () => {
    const jwks = await fakeJwks();
    const validator = await makeValidator(jwks);
    const token = await jwks.sign({ sub: "user-1" });

    await validator.validate(token);
    await validator.validate(token);
    await validator.validate(token);

    expect(jwks.requestCount()).toBe(1);
  });

  it("rotação de chave: kid novo refaz o fetch e passa a valer", async () => {
    const jwks = await fakeJwks();
    const validator = await makeValidator(jwks);
    await validator.validate(await jwks.sign({ sub: "user-1" }));
    expect(jwks.requestCount()).toBe(1);

    const rotated = await jwks.rotate();
    const rotatedToken = await jwks.sign(
      { sub: "user-1" },
      { key: rotated, kid: rotated.kid },
    );

    await expect(validator.validate(rotatedToken)).resolves.toEqual({
      subject: "user-1",
      roles: [],
    });
    expect(jwks.requestCount()).toBe(2);
  });

  it("servidor fora do ar: cache dentro da janela ainda valida; após expirar, falha fechado", async () => {
    const jwks = await fakeJwks();
    const validator = await makeValidator(jwks, {
      cacheMaxAgeMs: 150,
      cooldownDurationMs: 1,
    });
    const token = await jwks.sign({ sub: "user-1" });
    await validator.validate(token);

    jwks.respond(false);

    /* Dentro da janela do cache: nenhum fetch novo, validação continua. */
    const before = jwks.requestCount();
    await expect(validator.validate(token)).resolves.toEqual({
      subject: "user-1",
      roles: [],
    });
    expect(jwks.requestCount()).toBe(before);

    /* Após o TTL: tenta atualizar, servidor responde 503 → falha fechado. */
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(validator.validate(token)).resolves.toBeNull();
  });

  it("os valores default de segurança ficam fixos e documentados", () => {
    expect(DEFAULT_CACHE_TTL_MS).toBe(600_000);
    expect(DEFAULT_JWKS_COOLDOWN_MS).toBe(30_000);
    expect(DEFAULT_CLOCK_TOLERANCE_SECONDS).toBe(30);
    expect([...ALLOWED_ALGORITHMS]).toEqual(["RS256"]);
    expect(MAX_TOKEN_LENGTH).toBe(8_192);
  });

  it("configuração por ambiente: sem issuer/audience o backend falha rápido", () => {
    const previousIssuer = process.env.KEYCLOAK_ISSUER;
    const previousAudience = process.env.KEYCLOAK_AUDIENCE;
    delete process.env.KEYCLOAK_ISSUER;
    delete process.env.KEYCLOAK_AUDIENCE;

    try {
      expect(() => createJoseTokenValidatorFromEnv()).toThrow(
        /KEYCLOAK_ISSUER/,
      );
    } finally {
      if (previousIssuer !== undefined) {
        process.env.KEYCLOAK_ISSUER = previousIssuer;
      }
      if (previousAudience !== undefined) {
        process.env.KEYCLOAK_AUDIENCE = previousAudience;
      }
    }
  });

  it("configuração parcial (só issuer ou só audience) também falha rápido", () => {
    const previousIssuer = process.env.KEYCLOAK_ISSUER;
    const previousAudience = process.env.KEYCLOAK_AUDIENCE;
    try {
      process.env.KEYCLOAK_ISSUER = "http://127.0.0.1:9/realms/x";
      delete process.env.KEYCLOAK_AUDIENCE;
      expect(() => createJoseTokenValidatorFromEnv()).toThrow(/KEYCLOAK/);

      delete process.env.KEYCLOAK_ISSUER;
      process.env.KEYCLOAK_AUDIENCE = "client";
      expect(() => createJoseTokenValidatorFromEnv()).toThrow(/KEYCLOAK/);
    } finally {
      if (previousIssuer === undefined) {
        delete process.env.KEYCLOAK_ISSUER;
      } else {
        process.env.KEYCLOAK_ISSUER = previousIssuer;
      }
      if (previousAudience === undefined) {
        delete process.env.KEYCLOAK_AUDIENCE;
      } else {
        process.env.KEYCLOAK_AUDIENCE = previousAudience;
      }
    }
  });

  it("configuração por ambiente: issuer+audience derivam a URL do JWKS do realm", () => {
    const previousIssuer = process.env.KEYCLOAK_ISSUER;
    const previousAudience = process.env.KEYCLOAK_AUDIENCE;
    process.env.KEYCLOAK_ISSUER = "http://127.0.0.1:9/realms/x";
    process.env.KEYCLOAK_AUDIENCE = "client";
    try {
      const validator = createJoseTokenValidatorFromEnv();
      expect(validator).toBeInstanceOf(JoseTokenValidator);
    } finally {
      if (previousIssuer === undefined) {
        delete process.env.KEYCLOAK_ISSUER;
      } else {
        process.env.KEYCLOAK_ISSUER = previousIssuer;
      }
      if (previousAudience === undefined) {
        delete process.env.KEYCLOAK_AUDIENCE;
      } else {
        process.env.KEYCLOAK_AUDIENCE = previousAudience;
      }
    }
  });
});
