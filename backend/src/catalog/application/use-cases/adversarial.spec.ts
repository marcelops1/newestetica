import { describe, expect, it } from "vitest";
import { ListProceduresUseCase } from "./list-procedures.use-case";
import { GetProcedureBySlugUseCase } from "./get-procedure-by-slug.use-case";
import {
  InvalidProcedure,
  ProcedureNotFound,
} from "../../domain/errors/errors";
import { InMemoryProcedureRepository } from "../../../../test/fakes/in-memory-procedure.repository";

/* Adversarial (docs/07 §16d): entradas hostis REAIS contra o caso de uso, como defesa
   em profundidade — mesmo que a fronteira HTTP valide antes, o núcleo não confia. */

const hostileCategories = [
  "' OR '1'='1",
  'facial\'; DROP TABLE "Procedure"; --',
  "x".repeat(10_000),
  "FACIAL",
  "",
  "capilar",
];

describe("adversarial — entradas hostis contra os casos de uso", () => {
  it("categoria hostil, gigante ou fora do vocabulário é rejeitada com InvalidProcedure", async () => {
    const useCase = new ListProceduresUseCase(
      new InMemoryProcedureRepository([]),
    );

    for (const category of hostileCategories) {
      await expect(
        useCase.execute({ category: category as never }),
        `categoria hostil: ${category.slice(0, 30)}`,
      ).rejects.toThrow(InvalidProcedure);
    }
  });

  it("slug gigante ou malformado não derruba o caso de uso: responde ProcedureNotFound", async () => {
    const useCase = new GetProcedureBySlugUseCase(
      new InMemoryProcedureRepository([]),
    );

    for (const slug of [
      "../../etc/passwd",
      "x".repeat(10_000),
      "' OR 1=1 --",
      "",
    ]) {
      await expect(
        useCase.execute(slug),
        `slug hostil: ${slug.slice(0, 30)}`,
      ).rejects.toThrow(ProcedureNotFound);
    }
  });
});
