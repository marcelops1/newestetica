import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ProbeModule } from "../fakes/identity-probe.module";
import {
  TOKEN_VERIFIER,
  type VerifiedIdentity,
} from "../../src/shared/http/auth/token-verifier";

/* Fronteira HTTP real com o guard do kernel (design decisão 2): o verificador é um
   fake injetado (a cadeia jose+JWKS de verdade é coberta na suíte de ataques), mas o
   guard, o decorator e o status/erro são os reais. */

const IDENTITIES: Record<string, VerifiedIdentity> = {
  "token-admin": { subject: "u-admin", roles: ["admin"] },
  "token-reception": { subject: "u-reception", roles: ["reception"] },
  "token-noroles": { subject: "u-noroles", roles: [] },
};

let app: INestApplication;
let baseUrl: string;

beforeAll(async () => {
  /* O provider real do validador é instanciado no bootstrap (mesmo com a porta
     TOKEN_VERIFIER sobrescrita); env de teste satisfaz o fail-fast do módulo — a
     verificação real é substituída pelo fake abaixo. */
  process.env.KEYCLOAK_ISSUER = "http://127.0.0.1:1/realms/test";
  process.env.KEYCLOAK_AUDIENCE = "test-client";
  const moduleRef = await Test.createTestingModule({ imports: [ProbeModule] })
    .overrideProvider(TOKEN_VERIFIER)
    .useValue({
      verify: async (token: string) => IDENTITIES[token] ?? null,
    })
    .compile();
  app = moduleRef.createNestApplication({ logger: false });
  await app.listen(0);
  baseUrl = await app.getUrl();
});

afterAll(async () => {
  await app?.close();
});

describe("guard real na fronteira HTTP (probe)", () => {
  it("sem token: 401 com corpo fixo, idêntico para header ausente e token inválido", async () => {
    const missing = await fetch(`${baseUrl}/probe/authenticated`);
    const invalid = await fetch(`${baseUrl}/probe/authenticated`, {
      headers: { authorization: "Bearer token-forjado" },
    });

    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
    const missingBody = await missing.json();
    const invalidBody = await invalid.json();
    expect(missingBody).toEqual({
      code: "AUTH_UNAUTHENTICATED",
      message: "Autenticação necessária.",
    });
    expect(invalidBody).toEqual(missingBody);
  });

  it("token válido sem papel conhecido passa em rota sem papel declarado (negação por padrão = exigir autenticação)", async () => {
    const response = await fetch(`${baseUrl}/probe/authenticated`, {
      headers: { authorization: "Bearer token-noroles" },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: "authenticated" });
  });

  it("rota com papel exigido: sem papel e papel insuficiente dão o MESMO 403, byte a byte", async () => {
    const noRoles = await fetch(`${baseUrl}/probe/admin`, {
      headers: { authorization: "Bearer token-noroles" },
    });
    const insufficient = await fetch(`${baseUrl}/probe/admin`, {
      headers: { authorization: "Bearer token-reception" },
    });

    expect(noRoles.status).toBe(403);
    expect(insufficient.status).toBe(403);
    const noRolesBody = await noRoles.text();
    const insufficientBody = await insufficient.text();
    expect(noRolesBody).toBe(insufficientBody);
    expect(JSON.parse(noRolesBody)).toEqual({
      code: "AUTH_FORBIDDEN",
      message: "Acesso negado.",
    });
  });

  it("rota com papel exigido: token com o papel passa", async () => {
    const response = await fetch(`${baseUrl}/probe/admin`, {
      headers: { authorization: "Bearer token-admin" },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: "admin" });
  });
});
