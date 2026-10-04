import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AttendanceModule } from "../../src/attendance/attendance.module";
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

/* Prova do guard REAL no módulo Atendimento (UC 4.2.1): sem token válido → 401
   fixo; token sem papel → 403 fixo; contraste com papel autorizado (admin e
   reception — RBAC operacional) alcançando o handler. Verificador fake; guard real. */

const ALFA = "00000000-0000-4000-8000-000000000101";
const ATTENDANCE_ID = "00000000-0000-4000-8000-000000000201";

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const ROUTES = [
  {
    method: "POST",
    path: `/patients/${ALFA}/attendances`,
    body: {
      summary: "Registro fictício bloqueado.",
      performedAt: "2026-09-10T14:30:00.000Z",
    },
  },
  { method: "GET", path: `/patients/${ALFA}/attendances` },
  { method: "GET", path: `/patients/${ALFA}/attendances/${ATTENDANCE_ID}` },
] as const;

async function call(
  route: (typeof ROUTES)[number],
  token?: "test-admin" | "test-reception" | "test-noroles",
): Promise<Response> {
  return fetch(`${baseUrl}${route.path}`, {
    method: route.method,
    headers: {
      ...("body" in route ? { "content-type": "application/json" } : {}),
      ...(token ? bearer(token) : {}),
    },
    ...("body" in route ? { body: JSON.stringify(route.body) } : {}),
  });
}

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  process.env.KEYCLOAK_ISSUER = "http://127.0.0.1:1/realms/test";
  process.env.KEYCLOAK_AUDIENCE = "test-client";
  const moduleRef = await Test.createTestingModule({
    imports: [AttendanceModule],
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
  await prisma.patient.create({
    data: {
      id: ALFA,
      fullName: "Paciente Fictícia Ilustrativa",
      phone: "(11) 5555-0001",
      purpose: "Cadastro fictício para teste",
      status: "active",
      updatedAt: new Date(),
    },
  });
  await prisma.attendance.create({
    data: {
      id: ATTENDANCE_ID,
      patientId: ALFA,
      summary: "Atendimento fictício.",
      performedAt: new Date("2026-09-10T14:30:00.000Z"),
      updatedAt: new Date(),
    },
  });
});

describe("guard real + RBAC no módulo Atendimento", () => {
  it.each(ROUTES)(
    "$method $path sem token responde 401 fixo",
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

  it("contraste: admin e reception alcançam o handler (201/200)", async () => {
    const createAsAdmin = await call(ROUTES[0], "test-admin");
    expect(createAsAdmin.status).toBe(201);

    const listAsReception = await call(ROUTES[1], "test-reception");
    expect(listAsReception.status).toBe(200);

    const detailAsReception = await call(ROUTES[2], "test-reception");
    expect(detailAsReception.status).toBe(200);
  });
});
