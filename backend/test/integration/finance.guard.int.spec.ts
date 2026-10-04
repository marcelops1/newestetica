import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FinanceModule } from "../../src/finance/finance.module";
import { testDatabaseUrl } from "./database";

/* Prova do bloqueio honesto (task 5.3/5.4): SEM override, a rota responde 403
   AUTH_NOT_IMPLEMENTED ANTES de qualquer validação de janela. O contraste com
   finance.http.int.spec.ts (mesma rota com overrideGuard → 200/422) prova que o
   guard é a ÚNICA barreira — e que o guard do kernel bloqueia o módulo novo sem
   exceção. */

let app: INestApplication;
let baseUrl: string;

const ROUTES = [
  "/finance/summary?from=2026-09-01&to=2026-09-30",
  "/finance/summary",
  "/finance/summary?from=01/09/2026&to=2026-09-30",
] as const;

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  app = await NestFactory.create(FinanceModule, { logger: false });
  await app.listen(0);
  baseUrl = await app.getUrl();
});

afterAll(async () => {
  await app.close();
});

describe("IdentityPendingGuard no módulo Financeiro (bloqueio honesto até a Identidade)", () => {
  it.each(ROUTES)(
    "GET %s com o guard ativo responde 403 AUTH_NOT_IMPLEMENTED, sem dado",
    async (path) => {
      const response = await fetch(`${baseUrl}${path}`);

      expect(response.status).toBe(403);
      const body = (await response.json()) as {
        code: string;
        message: string;
      };
      expect(body.code).toBe("AUTH_NOT_IMPLEMENTED");
      expect(body.message).toContain("Autenticação ainda não implementada");
      expect(body.message).toContain("Identidade");
      expect(Object.keys(body).sort()).toEqual(["code", "message"]);
      expect(JSON.stringify(body)).not.toContain("totalCents");
    },
  );

  it("o guard bloqueia antes da validação: janela inválida também responde 403, nunca 422", async () => {
    const responses = await Promise.all(
      ROUTES.map(async (path) => {
        const response = await fetch(`${baseUrl}${path}`);
        return response.status;
      }),
    );

    expect(responses).toEqual([403, 403, 403]);
  });
});
