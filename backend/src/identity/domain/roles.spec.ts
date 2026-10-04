import { describe, expect, it } from "vitest";
import { REALM_ROLES, isKnownRole } from "./roles";

/* Papéis do realm (docs/security/03 §3): só existem `admin` e `reception` nesta
   fatia; valor fora do vocabulário não é papel conhecido. */
describe("papéis do realm (roles)", () => {
  it("exatamente admin e reception são papéis conhecidos", () => {
    expect([...REALM_ROLES]).toEqual(["admin", "reception"]);
    expect(isKnownRole("admin")).toBe(true);
    expect(isKnownRole("reception")).toBe(true);
  });

  it("valores fora do vocabulário, de tipo errado ou vazios não são papéis", () => {
    for (const value of ["root", "ADMIN", "", " admin", "reception "]) {
      expect(isKnownRole(value), `papel hostil: ${JSON.stringify(value)}`).toBe(
        false,
      );
    }
    expect(isKnownRole("admin" as never)).toBe(true);
  });
});
