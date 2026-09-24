import { describe, expect, it } from "vitest";
import { BeforeAfterCase } from "../../domain/entities/before-after-case.entity";
import { InMemoryBeforeAfterCaseRepository } from "../../../../test/fakes/in-memory-before-after-case.repository";
import { ListBeforeAfterUseCase } from "./list-before-after.use-case";

function makeCase(id: string, hasConsent: boolean): BeforeAfterCase {
  const props = {
    id,
    title: `Caso ${id}`,
    summary: "Resumo 100% fictício.",
    sessions: "1 sessão",
    recovery: "Imediato (sem downtime)",
    goal: "Firmeza",
  };
  return BeforeAfterCase.restore({ ...props, hasConsent });
}

function makeUseCase(): ListBeforeAfterUseCase {
  return new ListBeforeAfterUseCase(
    new InMemoryBeforeAfterCaseRepository([
      makeCase("resultado-1", true),
      makeCase("resultado-2", true),
      makeCase("resultado-sem-consentimento", false),
    ]),
  );
}

describe("ListBeforeAfterUseCase", () => {
  it("lista somente casos com consentimento explícito", async () => {
    const cases = await makeUseCase().execute();

    expect(cases.map((item) => item.id)).toEqual(["resultado-1", "resultado-2"]);
    expect(cases.every((item) => item.hasConsent)).toBe(true);
  });

  it("caso sem consentimento nunca aparece na saída, mesmo existindo na base", async () => {
    const cases = await makeUseCase().execute();

    expect(cases.map((item) => item.id)).not.toContain(
      "resultado-sem-consentimento",
    );
  });

  it("sem nenhum caso consentido, resposta é lista vazia sem erro", async () => {
    const useCase = new ListBeforeAfterUseCase(
      new InMemoryBeforeAfterCaseRepository([
        makeCase("resultado-sem-consentimento", false),
      ]),
    );

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
