import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ProcedureSchema } from "@newestetica/contracts";
import { CatalogModule } from "../../src/catalog/catalog.module";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const CONTRACT_KEYS = ["categories", "description", "duration", "id", "name"];

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
  await prisma.procedure.create({
    data: {
      id: "limpeza-de-pele",
      name: "Limpeza de pele",
      description: "Cuidado suave para uma pele fresca e bem cuidada.",
      duration: "Cerca de 60 minutos",
      categories: ["facial"],
      isActive: true,
    },
  });
});

describe("saída do catálogo conforme o contrato (verificação nas duas pontas)", () => {
  it("a listagem responde no formato do ProcedureSchema, sem vazar isActive", async () => {
    const response = await fetch(`${baseUrl}/procedures`);
    const body = (await response.json()) as Array<Record<string, unknown>>;

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    for (const item of body) {
      expect(
        ProcedureSchema.safeParse(item).success,
        JSON.stringify(item),
      ).toBe(true);
      expect(item).not.toHaveProperty("isActive");
      expect(Object.keys(item).sort()).toEqual(CONTRACT_KEYS);
    }
  });

  it("o detalhe responde no formato do ProcedureSchema, sem vazar isActive", async () => {
    const response = await fetch(`${baseUrl}/procedures/limpeza-de-pele`);
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(ProcedureSchema.safeParse(body).success).toBe(true);
    expect(body).not.toHaveProperty("isActive");
    expect(Object.keys(body).sort()).toEqual(CONTRACT_KEYS);
  });
});
