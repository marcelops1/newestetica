import { describe, expect, it } from "vitest";
import type { AuthenticatedIdentity } from "./claims";
import { isAuthorized } from "./authorization";

/* Política pura de autorização (design decisão 2): negação por padrão — rota sem
   papel exigido aceita qualquer identidade autenticada; com papel exigido, basta a
   interseção; sem interseção, nega. */
describe("autorização RBAC (negação por padrão)", () => {
  const admin: AuthenticatedIdentity = { subject: "u1", roles: ["admin"] };
  const reception: AuthenticatedIdentity = { subject: "u2", roles: ["reception"] };
  const noRoles: AuthenticatedIdentity = { subject: "u3", roles: [] };

  it("rota sem papel declarado exige apenas autenticação (qualquer identidade passa)", () => {
    expect(isAuthorized(noRoles, [])).toBe(true);
    expect(isAuthorized(admin, [])).toBe(true);
  });

  it("rota com papel declarado passa quando há interseção", () => {
    expect(isAuthorized(admin, ["admin"])).toBe(true);
    expect(isAuthorized(reception, ["admin", "reception"])).toBe(true);
  });

  it("sem interseção (papel ausente ou insuficiente) nega", () => {
    expect(isAuthorized(noRoles, ["admin"])).toBe(false);
    expect(isAuthorized(reception, ["admin"])).toBe(false);
    expect(isAuthorized(admin, ["reception"])).toBe(false);
  });
});
