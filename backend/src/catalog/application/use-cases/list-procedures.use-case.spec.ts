import { describe, expect, it } from "vitest";
import { ListProceduresUseCase } from "./list-procedures.use-case";
import { Procedure } from "../../domain/entities/procedure.entity";
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

function makeUseCase(): ListProceduresUseCase {
  const repository = new InMemoryProcedureRepository([
    makeProcedure("limpeza-de-pele", ["facial"]),
    makeProcedure("massagem-relaxante", ["corporal"]),
    makeProcedure("protocolo-descontinuado", ["rejuvenescimento"], false),
  ]);
  return new ListProceduresUseCase(repository);
}

describe("ListProceduresUseCase", () => {
  it("lista somente procedimentos ativos quando não há filtro", async () => {
    const procedures = await makeUseCase().execute({});

    expect(procedures.map((procedure) => procedure.id)).toEqual([
      "limpeza-de-pele",
      "massagem-relaxante",
    ]);
    expect(procedures.every((procedure) => procedure.isActive)).toBe(true);
  });

  it("filtra por categoria entre os ativos", async () => {
    const procedures = await makeUseCase().execute({ category: "corporal" });

    expect(procedures.map((procedure) => procedure.id)).toEqual([
      "massagem-relaxante",
    ]);
  });

  it("categoria cujo único item está inativo retorna lista vazia", async () => {
    const procedures = await makeUseCase().execute({
      category: "rejuvenescimento",
    });

    expect(procedures).toEqual([]);
  });
});
