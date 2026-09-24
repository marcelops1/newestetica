import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { CatalogModule } from "../../src/catalog/catalog.module";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

async function seedProcedure(
  id: string,
  categories: string[],
  isActive = true,
): Promise<void> {
  await prisma.procedure.create({
    data: {
      id,
      name: `Procedimento ${id}`,
      description: "Descrição fictícia.",
      duration: "Cerca de 60 minutos",
      categories,
      isActive,
    },
  });
}

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  app = await NestFactory.create(CatalogModule, { logger: false });
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

describe("Catalog HTTP (contrato da Presentation)", () => {
  it("GET /procedures lista somente ativos", async () => {
    await seedProcedure("limpeza-de-pele", ["facial"]);
    await seedProcedure("protocolo-descontinuado", ["facial"], false);

    const response = await fetch(`${baseUrl}/procedures`);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<{ id: string }>;
    expect(body.map((item) => item.id)).toEqual(["limpeza-de-pele"]);
  });

  it("GET /procedures?category= filtra por categoria válida", async () => {
    await seedProcedure("limpeza-de-pele", ["facial"]);
    await seedProcedure("massagem-relaxante", ["corporal"]);

    const response = await fetch(`${baseUrl}/procedures?category=corporal`);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<{ id: string }>;
    expect(body.map((item) => item.id)).toEqual(["massagem-relaxante"]);
  });

  it("categoria fora do vocabulário responde 422 estruturado", async () => {
    const response = await fetch(
      `${baseUrl}/procedures?category=${encodeURIComponent("' OR '1'='1")}`,
    );

    expect(response.status).toBe(422);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("GET /procedures/:slug retorna o ativo e 404 idêntico para inexistente ou inativo", async () => {
    await seedProcedure("limpeza-de-pele", ["facial"]);
    await seedProcedure("protocolo-descontinuado", ["facial"], false);

    const found = await fetch(`${baseUrl}/procedures/limpeza-de-pele`);
    expect(found.status).toBe(200);
    const foundBody = (await found.json()) as { id: string };
    expect(foundBody.id).toBe("limpeza-de-pele");

    const missing = await fetch(`${baseUrl}/procedures/nao-existe`);
    const inactive = await fetch(
      `${baseUrl}/procedures/protocolo-descontinuado`,
    );
    expect(missing.status).toBe(404);
    expect(inactive.status).toBe(404);
    const missingBody = (await missing.json()) as { code: string };
    const inactiveBody = (await inactive.json()) as { code: string };
    expect(missingBody.code).toBe("PROCEDURE_NOT_FOUND");
    expect(missingBody).toEqual(inactiveBody);
  });

  it("dado corrompido no banco responde 422 estruturado, sem vazar o registro", async () => {
    await seedProcedure("dado-corrompido", ["inexistente"]);

    const response = await fetch(`${baseUrl}/procedures`);

    expect(response.status).toBe(422);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("INVALID_PROCEDURE");
  });
});
