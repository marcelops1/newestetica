import { describe, expect, it } from "vitest";
import { Procedure } from "../entities/procedure.entity";
import { InMemoryProcedureRepository } from "../../../../test/fakes/in-memory-procedure.repository";

function makeProcedure(
  id: string,
  categories: Array<"facial" | "corporal" | "rejuvenescimento">,
  isActive = true,
): Procedure {
  const props = {
    id,
    name: `Procedimento ${id}`,
    description: "Descrição fictícia.",
    duration: "Cerca de 60 minutos",
    categories,
  };
  return isActive
    ? Procedure.create(props)
    : Procedure.restore({ ...props, isActive });
}

describe("portas do Domain (catálogo)", () => {
  it("o fake manual cumpre ProcedureRepository: findActive exclui inativos", async () => {
    const repository = new InMemoryProcedureRepository([
      makeProcedure("limpeza-de-pele", ["facial"]),
      makeProcedure("protocolo-descontinuado", ["facial"], false),
    ]);

    const active = await repository.findActive();

    expect(active.map((procedure) => procedure.id)).toEqual([
      "limpeza-de-pele",
    ]);
  });

  it("findActiveByCategory filtra por categoria entre os ativos", async () => {
    const repository = new InMemoryProcedureRepository([
      makeProcedure("limpeza-de-pele", ["facial"]),
      makeProcedure("massagem-relaxante", ["corporal", "rejuvenescimento"]),
      makeProcedure("protocolo-descontinuado", ["corporal"], false),
    ]);

    const corporal = await repository.findActiveByCategory("corporal");

    expect(corporal.map((procedure) => procedure.id)).toEqual([
      "massagem-relaxante",
    ]);
  });

  it("findActiveBySlug ignora item inativo (mesmo com slug existente)", async () => {
    const repository = new InMemoryProcedureRepository([
      makeProcedure("protocolo-descontinuado", ["facial"], false),
    ]);

    await expect(
      repository.findActiveBySlug("protocolo-descontinuado"),
    ).resolves.toBeNull();
  });
});
