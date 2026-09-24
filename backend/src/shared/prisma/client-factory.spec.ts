import { afterEach, describe, expect, it } from "vitest";
import { createPrismaClientFromEnv } from "./client-factory";

describe("createPrismaClientFromEnv (factory compartilhada)", () => {
  const original = process.env.DATABASE_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = original;
    }
  });

  it("sem DATABASE_URL lança o erro atual, com a mensagem preservada", () => {
    delete process.env.DATABASE_URL;

    expect(() => createPrismaClientFromEnv()).toThrow(
      "DATABASE_URL não configurada para o backend",
    );
  });

  /* O cliente real e conectável é provado pelos testes de integração que sobem os
     módulos (o provider usa esta factory) — aqui a asserção de identidade de classe é
     evitada de propósito: o proxy do Prisma não sobrevive à instrumentação de cobertura
     (`toBeInstanceOf` estoura e `constructor.name` é mangled). */
  it("com DATABASE_URL devolve um cliente Prisma utilizável (sem conectar)", async () => {
    process.env.DATABASE_URL =
      "postgresql://newestetica:changeme-dev@127.0.0.1:5432/nao-conecta";

    const client = createPrismaClientFromEnv();

    expect(typeof client.$connect).toBe("function");
    expect(typeof client.$transaction).toBe("function");
    expect(typeof client.$disconnect).toBe("function");
    await client.$disconnect();
  });
});
