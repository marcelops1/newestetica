import { describe, expect, it } from "vitest";
import { MAX_PATIENTS_LIMIT } from "../../application/use-cases/list-patients.use-case";
import { ListPatientsQuerySchema } from "./patients.controller";

/* Teste de acoplamento (R2): o teto do schema da Presentation e o teto do núcleo
   precisam ser a MESMA constante — não dois literais que podem divergir em silêncio. */
describe("ListPatientsQuerySchema (acoplado ao teto do núcleo)", () => {
  it("aceita o teto exato do núcleo e rejeita um acima", () => {
    expect(
      ListPatientsQuerySchema.safeParse({ limit: MAX_PATIENTS_LIMIT }).success,
    ).toBe(true);
    expect(
      ListPatientsQuerySchema.safeParse({
        limit: String(MAX_PATIENTS_LIMIT + 1),
      }).success,
    ).toBe(false);
    expect(
      ListPatientsQuerySchema.safeParse({ limit: String(MAX_PATIENTS_LIMIT) })
        .success,
    ).toBe(true);
  });
});
