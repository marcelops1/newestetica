import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PatientsModule } from "../../src/patients/patients.module";
import { FAKE_TOKEN_VERIFIER, bearer } from "../fakes/fake-token-verifier";
import {
  AUTH_FORBIDDEN_CODE,
  AUTH_FORBIDDEN_MESSAGE,
  AUTH_UNAUTHENTICATED_CODE,
  AUTH_UNAUTHENTICATED_MESSAGE,
  TOKEN_VERIFIER,
} from "../../src/shared/http/auth/token-verifier";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

/* Prova do guard REAL no módulo Pacientes (UC 4.2.1): sem token válido → 401 fixo;
   token válido sem papel → 403 fixo; matriz RBAC — leitura para admin/reception,
   escrita e anonimização só admin. O verificador é fake; o guard é o real. */

const ACTIVE_ID = "00000000-0000-4000-8000-000000000001";

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ROUTES = [
  {
    method: "POST",
    path: "/patients",
    adminOnly: true,
    body: {
      fullName: "Paciente Fictícia Um",
      phone: "(11) 5555-0001",
      purpose: "Cadastro fictício",
    },
  },
  { method: "GET", path: "/patients", adminOnly: false },
  { method: "GET", path: `/patients/${ACTIVE_ID}`, adminOnly: false },
  {
    method: "PATCH",
    path: `/patients/${ACTIVE_ID}`,
    adminOnly: true,
    body: { phone: "(11) 5555-0009" },
  },
  { method: "DELETE", path: `/patients/${ACTIVE_ID}`, adminOnly: true },
] as const;

async function call(
  route: (typeof ROUTES)[number],
  token?: string,
): Promise<Response> {
  return fetch(`${baseUrl}${route.path}`, {
    method: route.method,
    headers: {
      ...("body" in route ? { "content-type": "application/json" } : {}),
      ...(token ? bearer(token as "test-admin") : {}),
    },
    ...("body" in route ? { body: JSON.stringify(route.body) } : {}),
  });
}

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  process.env.KEYCLOAK_ISSUER = "http://127.0.0.1:1/realms/test";
  process.env.KEYCLOAK_AUDIENCE = "test-client";
  const moduleRef = await Test.createTestingModule({
    imports: [PatientsModule],
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
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("guard real + RBAC no módulo Pacientes", () => {
  it.each(ROUTES)(
    "$method $path sem token responde 401 fixo, sem corpo de dados",
    async (route) => {
      const response = await call(route);

      expect(response.status).toBe(401);
      const body = (await response.json()) as Record<string, unknown>;
      expect(body).toEqual({
        code: AUTH_UNAUTHENTICATED_CODE,
        message: AUTH_UNAUTHENTICATED_MESSAGE,
      });
      expect(Object.keys(body).sort()).toEqual(["code", "message"]);
    },
  );

  it("token válido sem papel responde 403 fixo em todas as rotas", async () => {
    for (const route of ROUTES) {
      const response = await call(route, "test-noroles");
      expect(response.status, `${route.method} ${route.path}`).toBe(403);
      await expect(response.json()).resolves.toEqual({
        code: AUTH_FORBIDDEN_CODE,
        message: AUTH_FORBIDDEN_MESSAGE,
      });
    }
  });

  it("papel insuficiente (reception) nas rotas de escrita dá 403 byte-idêntico ao sem-papel", async () => {
    const writeRoutes = ROUTES.filter((route) => route.adminOnly);
    for (const route of writeRoutes) {
      const insufficient = await call(route, "test-reception");
      const noRoles = await call(route, "test-noroles");

      expect(insufficient.status, `${route.method} ${route.path}`).toBe(403);
      const insufficientBody = await insufficient.text();
      const noRolesBody = await noRoles.text();
      expect(insufficientBody).toBe(noRolesBody);
    }
  });

  it("contraste com token válido: leitura passa para reception; escrita passa para admin", async () => {
    await prisma.patient.create({
      data: {
        id: ACTIVE_ID,
        fullName: "Paciente Fictícia Um",
        phone: "(11) 5555-0001",
        purpose: "Cadastro fictício",
        status: "active",
        updatedAt: new Date(),
      },
    });

    const readAsReception = await call(ROUTES[1], "test-reception");
    expect(readAsReception.status).toBe(200);
    const detailAsReception = await call(ROUTES[2], "test-reception");
    expect(detailAsReception.status).toBe(200);

    const createAsAdmin = await call(ROUTES[0], "test-admin");
    expect(createAsAdmin.status).toBe(201);
    const patchAsAdmin = await call(ROUTES[3], "test-admin");
    expect(patchAsAdmin.status).toBe(200);
    const deleteAsAdmin = await call(ROUTES[4], "test-admin");
    expect(deleteAsAdmin.status).toBe(204);
  });
});
