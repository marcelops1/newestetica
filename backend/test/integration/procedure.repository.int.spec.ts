import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { InvalidProcedure } from "../../src/catalog/domain/errors/errors";
import { PrismaProcedureRepository } from "../../src/catalog/infrastructure/persistence/procedure.repository.impl";
import { createTestPrismaClient, resetDatabase } from "./database";

const prisma = createTestPrismaClient();
const repository = new PrismaProcedureRepository(prisma);

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

beforeEach(async () => {
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaProcedureRepository (integração com Postgres real)", () => {
  it("faz round-trip de um procedimento íntegro (mapper não vaza o registro do ORM)", async () => {
    await seedProcedure("limpeza-de-pele", ["facial"]);

    const active = await repository.findActive();

    expect(active).toHaveLength(1);
    expect(active[0]?.id).toBe("limpeza-de-pele");
    expect(active[0]?.name).toBe("Procedimento limpeza-de-pele");
    expect(active[0]?.categories).toEqual(["facial"]);
    expect(active[0]?.isActive).toBe(true);
  });

  it("findActive exclui itens desativados e ordena por nome", async () => {
    await seedProcedure("zebra", ["facial"]);
    await seedProcedure("alfa", ["facial"]);
    await seedProcedure("protocolo-descontinuado", ["facial"], false);

    const active = await repository.findActive();

    expect(active.map((procedure) => procedure.id)).toEqual(["alfa", "zebra"]);
  });

  it("findActiveByCategory filtra por categoria entre os ativos e ordena por nome", async () => {
    await seedProcedure("limpeza-de-pele", ["facial"]);
    await seedProcedure("zebra-corporal", ["corporal"]);
    await seedProcedure("massagem-relaxante", ["corporal", "rejuvenescimento"]);
    await seedProcedure(
      "protocolo-corporal-descontinuado",
      ["corporal"],
      false,
    );

    const corporal = await repository.findActiveByCategory("corporal");

    expect(corporal.map((procedure) => procedure.id)).toEqual([
      "massagem-relaxante",
      "zebra-corporal",
    ]);
  });

  it("findActive rejeita categoria desconhecida vinda do banco (dado corrompido)", async () => {
    await seedProcedure("dado-corrompido", ["inexistente"]);

    await expect(repository.findActive()).rejects.toThrow(InvalidProcedure);
  });

  it("findActiveBySlug ignora item desativado e retorna null para inexistente", async () => {
    await seedProcedure("protocolo-descontinuado", ["facial"], false);

    await expect(
      repository.findActiveBySlug("protocolo-descontinuado"),
    ).resolves.toBeNull();
    await expect(repository.findActiveBySlug("nao-existe")).resolves.toBeNull();
  });
});
