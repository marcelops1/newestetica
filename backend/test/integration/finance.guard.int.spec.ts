import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FinanceModule } from "../../src/finance/finance.module";
import { FAKE_TOKEN_VERIFIER, bearer } from "../fakes/fake-token-verifier";
import {
  AUTH_FORBIDDEN_CODE,
  AUTH_FORBIDDEN_MESSAGE,
  AUTH_UNAUTHENTICATED_CODE,
  AUTH_UNAUTHENTICATED_MESSAGE,
  TOKEN_VERIFIER,
} from "../../src/shared/http/auth/token-verifier";
import { testDatabaseUrl } from "./database";

/* Prova do guard REAL no módulo Financeiro (UC 4.2.1): sem token válido → 401
   fixo; token sem papel → 403 fixo; `reception` (papel insuficiente — rota é só
   `admin`) → 403 byte-idêntico; contraste com `admin` alcançando o handler. */

const SUMMARY_PATH = "/finance/summary?from=2026-09-01&to=2026-09-30";

let app: INestApplication;
let baseUrl: string;

const ROUTES = [SUMMARY_PATH] as const;

async function call(
  path: string,
  token?: "test-admin" | "test-reception" | "test-noroles",
): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    headers: token ? bearer(token) : {},
  });
}

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  process.env.KEYCLOAK_ISSUER = "http://127.0.0.1:1/realms/test";
  process.env.KEYCLOAK_AUDIENCE = "test-client";
  const moduleRef = await Test.createTestingModule({
    imports: [FinanceModule],
  })
    .overrideProvider(TOKEN_VERIFIER)
    .useValue(FAKE_TOKEN_VERIFIER)
    .compile();
  app = moduleRef.createNestApplication({ logger: false });
  await app.listen(0);
  baseUrl = await app.getUrl();
});

afterAll(async () => {
  await app.close();
});

describe("guard real + RBAC no módulo Financeiro", () => {
  it.each(ROUTES)("GET %s sem token responde 401 fixo", async (path) => {
    const response = await call(path);

    expect(response.status).toBe(401);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body).toEqual({
      code: AUTH_UNAUTHENTICATED_CODE,
      message: AUTH_UNAUTHENTICATED_MESSAGE,
    });
    expect(Object.keys(body).sort()).toEqual(["code", "message"]);
  });

  it("token sem papel e papel insuficiente (reception) dão 403 byte-idêntico — financeiro é só admin", async () => {
    const noRoles = await call(SUMMARY_PATH, "test-noroles");
    const insufficient = await call(SUMMARY_PATH, "test-reception");

    expect(noRoles.status).toBe(403);
    expect(insufficient.status).toBe(403);
    expect(await noRoles.text()).toBe(await insufficient.text());
    expect(
      JSON.parse(
        await call(SUMMARY_PATH, "test-noroles").then((r) => r.text()),
      ),
    ).toEqual({
      code: AUTH_FORBIDDEN_CODE,
      message: AUTH_FORBIDDEN_MESSAGE,
    });
  });

  it("contraste: admin alcança o handler (200 com o agregado da janela)", async () => {
    const response = await call(SUMMARY_PATH, "test-admin");

    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.currency).toBe("BRL");
    expect(Object.keys(body).sort()).toEqual([
      "count",
      "currency",
      "from",
      "to",
      "totalCents",
    ]);
  });
});
