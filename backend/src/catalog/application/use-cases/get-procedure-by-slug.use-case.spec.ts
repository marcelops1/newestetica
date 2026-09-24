import { describe, expect, it } from "vitest";
import { GetProcedureBySlugUseCase } from "./get-procedure-by-slug.use-case";
import { Procedure } from "../../domain/entities/procedure.entity";
import { ProcedureNotFound } from "../../domain/errors/errors";
import { InMemoryProcedureRepository } from "../../../../test/fakes/in-memory-procedure.repository";

function makeProcedure(id: string, isActive = true): Procedure {
  const props = {
    id,
    name: `Procedimento ${id}`,
    description: "Descrição fictícia.",
    duration: "Cerca de 60 minutos",
    categories: ["facial"] as Array<"facial">,
  };
  return isActive
    ? Procedure.create(props)
    : Procedure.restore({ ...props, isActive });
}

function makeUseCase(): GetProcedureBySlugUseCase {
  const repository = new InMemoryProcedureRepository([
    makeProcedure("limpeza-de-pele"),
    makeProcedure("protocolo-descontinuado", false),
  ]);
  return new GetProcedureBySlugUseCase(repository);
}

describe("GetProcedureBySlugUseCase", () => {
  it("retorna o procedimento ativo pelo slug", async () => {
    const procedure = await makeUseCase().execute("limpeza-de-pele");

    expect(procedure.id).toBe("limpeza-de-pele");
    expect(procedure.name).toContain("limpeza-de-pele");
  });

  it("slug inexistente e slug inativo respondem o mesmo ProcedureNotFound", async () => {
    const useCase = makeUseCase();

    await expect(useCase.execute("nao-existe")).rejects.toThrow(
      ProcedureNotFound,
    );
    await expect(useCase.execute("protocolo-descontinuado")).rejects.toThrow(
      ProcedureNotFound,
    );
  });
});
