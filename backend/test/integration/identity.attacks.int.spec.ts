import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startFakeJwks, type FakeJwks } from "../fakes/fake-jwks";
import { ProbeModule } from "../fakes/identity-probe.module";

/* Threat model do design, um ataque por bloco, contra a CADEIA REAL: JWKS fake local
   + validador jose + guard do kernel, sem override de porta. Cada ataque tem uma
   prova de write-then-throw registrada no verification.md (a proteção quebrada de
   propósito e o teste reprovando antes de restaurar). */

let jwks: FakeJwks;
let app: INestApplication;
let baseUrl: string;

const ADMIN_CLAIMS = {
  sub: "00000000-0000-4000-8000-000000000001",
  realm_access: { roles: ["admin"] },
};
const RECEPTION_CLAIMS = {
  sub: "00000000-0000-4000-8000-000000000002",
  realm_access: { roles: ["reception"] },
};
const NOROLES_CLAIMS = { sub: "00000000-0000-4000-8000-000000000003" };

async function call(
  path: string,
  token?: string,
): Promise<{ status: number; body: string }> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  return { status: response.status, body: await response.text() };
}

const UNAUTHENTICATED_BODY = JSON.stringify({
  code: "AUTH_UNAUTHENTICATED",
  message: "Autenticação necessária.",
});
const FORBIDDEN_BODY = JSON.stringify({
  code: "AUTH_FORBIDDEN",
  message: "Acesso negado.",
});

beforeAll(async () => {
  jwks = await startFakeJwks();
  process.env.KEYCLOAK_ISSUER = jwks.issuer;
  process.env.KEYCLOAK_AUDIENCE = jwks.audience;
  process.env.KEYCLOAK_JWKS_URL = jwks.jwksUrl;
  const moduleRef = await Test.createTestingModule({
    imports: [ProbeModule],
  }).compile();
  app = moduleRef.createNestApplication({ logger: false });
  await app.listen(0);
  baseUrl = await app.getUrl();
});

afterAll(async () => {
  await app?.close();
  await jwks?.close();
});

describe("4.1 token forjado (assinatura de chave estranha)", () => {
  it("mesmo kid com chave estranha e kid desconhecido respondem 401 idêntico", async () => {
    const foreign = await startFakeJwks();
    try {
      const sameKidWrongKey = await foreign.sign(ADMIN_CLAIMS, {
        key: foreign.currentKey(),
        kid: jwks.currentKey().kid,
      });
      const unknownKid = await foreign.sign(ADMIN_CLAIMS);

      for (const token of [sameKidWrongKey, unknownKid]) {
        const response = await call("/probe/admin", token);
        expect(response.status).toBe(401);
        expect(response.body).toBe(UNAUTHENTICATED_BODY);
      }
    } finally {
      await foreign.close();
    }
  });
});

describe("4.2 token expirado, nbf no futuro e skew", () => {
  it("expirado (60s) e nbf futuro respondem 401; skew dentro da tolerância (10s) passa", async () => {
    const expired = await jwks.sign(ADMIN_CLAIMS, { expiresIn: "-60s" });
    const notYet = await jwks.sign(ADMIN_CLAIMS, { notBefore: "120s" });
    const skewed = await jwks.sign(ADMIN_CLAIMS, { expiresIn: "-10s" });

    for (const token of [expired, notYet]) {
      const response = await call("/probe/admin", token);
      expect(response.status).toBe(401);
      expect(response.body).toBe(UNAUTHENTICATED_BODY);
    }

    const withinTolerance = await call("/probe/admin", skewed);
    expect(withinTolerance.status).toBe(200);
  });
});

describe("4.3 audience e issuer divergentes", () => {
  it("token de outro client e de outro emissor respondem 401; o legítimo passa", async () => {
    const wrongAudience = await jwks.sign(ADMIN_CLAIMS, {
      audience: "outro-client",
    });
    const wrongIssuer = await jwks.sign(ADMIN_CLAIMS, {
      issuer: "https://evil.example/realms/x",
    });
    const legitimate = await jwks.sign(ADMIN_CLAIMS);

    for (const token of [wrongAudience, wrongIssuer]) {
      const response = await call("/probe/admin", token);
      expect(response.status).toBe(401);
      expect(response.body).toBe(UNAUTHENTICATED_BODY);
    }
    expect((await call("/probe/admin", legitimate)).status).toBe(200);
  });
});

describe("4.4 papel ausente e papel insuficiente", () => {
  it("sem papel e papel insuficiente dão 403 byte-idêntico; papel autorizado passa; rota só autenticada aceita qualquer papel", async () => {
    const noRoles = await jwks.sign(NOROLES_CLAIMS);
    const reception = await jwks.sign(RECEPTION_CLAIMS);
    const admin = await jwks.sign(ADMIN_CLAIMS);

    const noRolesAdmin = await call("/probe/admin", noRoles);
    const receptionAdmin = await call("/probe/admin", reception);

    expect(noRolesAdmin.status).toBe(403);
    expect(receptionAdmin.status).toBe(403);
    expect(noRolesAdmin.body).toBe(receptionAdmin.body);
    expect(noRolesAdmin.body).toBe(FORBIDDEN_BODY);

    expect((await call("/probe/admin", admin)).status).toBe(200);
    expect((await call("/probe/authenticated", noRoles)).status).toBe(200);
  });
});

describe("4.5 algoritmo none, confusão HS256 e allowlist RS256", () => {
  it("none e HS256 (segredo = chave pública) respondem 401", async () => {
    const none = jwks.noSignatureToken(ADMIN_CLAIMS);
    const rsa = jwks.currentKey();
    const hs256 = await jwks.sign(ADMIN_CLAIMS, {
      alg: "HS256",
      kid: rsa.kid,
      secret: new TextEncoder().encode(JSON.stringify(rsa.publicJwk)),
    });

    for (const token of [none, hs256]) {
      const response = await call("/probe/admin", token);
      expect(response.status).toBe(401);
      expect(response.body).toBe(UNAUTHENTICATED_BODY);
    }
  });

  it("token ES256 validamente assinado por chave do JWKS é barrado pela allowlist RS256", async () => {
    const ecKey = await jwks.addKey("ES256");
    const es256 = await jwks.sign(ADMIN_CLAIMS, {
      key: ecKey,
      alg: "ES256",
      kid: ecKey.kid,
    });

    const response = await call("/probe/admin", es256);
    expect(response.status).toBe(401);
    expect(response.body).toBe(UNAUTHENTICATED_BODY);
  });
});

describe("4.6 confusão de chaves entre realms (issuer + assinatura)", () => {
  it("chave compartilhada com emissor estranho e realm estranho respondem 401", async () => {
    const sharedKeyWrongIssuer = await jwks.sign(ADMIN_CLAIMS, {
      issuer: "https://outro-realm.example/realms/x",
    });

    const otherRealm = await startFakeJwks();
    try {
      const otherRealmToken = await otherRealm.sign(ADMIN_CLAIMS);
      for (const token of [sharedKeyWrongIssuer, otherRealmToken]) {
        const response = await call("/probe/admin", token);
        expect(response.status).toBe(401);
        expect(response.body).toBe(UNAUTHENTICATED_BODY);
      }
    } finally {
      await otherRealm.close();
    }
  });
});

describe("4.7 enumeração: respostas fixas por classe, sem eco", () => {
  it("todas as falhas de autenticação têm o MESMO corpo 401, sem ecor de kid/claim/motivo", async () => {
    const foreign = await startFakeJwks();
    try {
      const tokens: Array<string | undefined> = [
        undefined,
        "não-é-um-jwt",
        await jwks.sign(ADMIN_CLAIMS, { expiresIn: "-60s" }),
        await foreign.sign(ADMIN_CLAIMS, { kid: jwks.currentKey().kid }),
        await jwks.sign(ADMIN_CLAIMS, { audience: "outro" }),
        jwks.noSignatureToken(ADMIN_CLAIMS),
      ];

      for (const token of tokens) {
        const response = await call("/probe/admin", token);
        expect(response.status).toBe(401);
        expect(response.body).toBe(UNAUTHENTICATED_BODY);
        const lowered = response.body.toLowerCase();
        for (const leak of ["kid", "exp", "iss", "aud", "signature", "jwk"]) {
          expect(lowered).not.toContain(leak);
        }
      }
    } finally {
      await foreign.close();
    }
  });
});
