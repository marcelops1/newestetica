import { describe, expect, it } from "vitest";
import { InMemoryTokenValidator } from "../../../../test/fakes/in-memory-token-validator";
import { AuthenticateUseCase } from "./authenticate.use-case";

/* Caso de uso de autenticação (design decisões 1 e 3): depende SÓ da porta; token
   válido devolve identidade, qualquer outra coisa devolve nulo — uma única falha,
   sem tocar a porta quando a entrada é claramente inválida. */
describe("AuthenticateUseCase", () => {
  const ADMIN_IDENTITY = {
    subject: "00000000-0000-4000-8000-000000000001",
    roles: ["admin"] as const,
  };

  function makeUseCase(): {
    useCase: AuthenticateUseCase;
    validator: InMemoryTokenValidator;
  } {
    const validator = new InMemoryTokenValidator(
      new Map([["token-admin-valido", ADMIN_IDENTITY]]),
    );
    return { useCase: new AuthenticateUseCase(validator), validator };
  }

  it("token válido devolve a identidade mapeada pela porta", async () => {
    const { useCase } = makeUseCase();

    await expect(useCase.verify("token-admin-valido")).resolves.toEqual({
      subject: ADMIN_IDENTITY.subject,
      roles: ["admin"],
    });
  });

  it("token desconhecido devolve nulo (401 na fronteira)", async () => {
    const { useCase } = makeUseCase();

    await expect(useCase.verify("token-forjado")).resolves.toBeNull();
  });

  it("entrada vazia, em branco ou de tipo errado devolve nulo sem tocar a porta", async () => {
    const { useCase, validator } = makeUseCase();

    for (const token of ["", "   ", null, 42, {}]) {
      await expect(
        useCase.verify(token as never),
        `token hostil: ${JSON.stringify(token)}`,
      ).resolves.toBeNull();
    }
    expect(validator.calls).toHaveLength(0);
  });
});
