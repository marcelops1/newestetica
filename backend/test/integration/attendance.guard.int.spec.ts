import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AttendanceModule } from "../../src/attendance/attendance.module";
import { testDatabaseUrl } from "./database";

/* Prova do bloqueio honesto (task 5.3/5.4): SEM override, cada rota do controller
   responde 403 AUTH_NOT_IMPLEMENTED. O contraste com attendance.http.int.spec.ts
   (mesmas rotas com overrideGuard → 200/201/404) prova que o guard é a ÚNICA barreira
   — e que o guard compartilhado no kernel bloqueia o módulo novo sem exceção. */

const ALFA = "00000000-0000-4000-8000-000000000101";
const ATTENDANCE_ID = "00000000-0000-4000-8000-000000000201";

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

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  app = await NestFactory.create(AttendanceModule, { logger: false });
  await app.listen(0);
  baseUrl = await app.getUrl();
});

afterAll(async () => {
  await app.close();
});

describe("IdentityPendingGuard no módulo de Atendimento (bloqueio honesto até a Identidade)", () => {
  it.each(ROUTES)(
    "$method $path com o guard ativo responde 403 AUTH_NOT_IMPLEMENTED",
    async (route) => {
      const response = await fetch(`${baseUrl}${route.path}`, {
        method: route.method,
        ...("body" in route
          ? {
              headers: { "content-type": "application/json" },
              body: JSON.stringify(route.body),
            }
          : {}),
      });

      expect(response.status).toBe(403);
      const body = (await response.json()) as {
        code: string;
        message: string;
      };
      expect(body.code).toBe("AUTH_NOT_IMPLEMENTED");
      expect(body.message).toContain("Autenticação ainda não implementada");
      expect(body.message).toContain("Identidade");
      expect(Object.keys(body).sort()).toEqual(["code", "message"]);
    },
  );

  it("nenhuma rota responde 2xx/4xx de negócio com o guard ativo (bloqueio total)", async () => {
    const statuses = await Promise.all(
      ROUTES.map(async (route) => {
        const response = await fetch(`${baseUrl}${route.path}`, {
          method: route.method,
          ...("body" in route
            ? {
                headers: { "content-type": "application/json" },
                body: JSON.stringify(route.body),
              }
            : {}),
        });
        return response.status;
      }),
    );

    expect(statuses).toEqual([403, 403, 403]);
  });
});
