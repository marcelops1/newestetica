import { describe, expect, it } from "vitest";
import { fromTokenClaims } from "./claims";

/* Mapeamento puro das claims do Keycloak → identidade (design decisão 2): `sub`
   obrigatório; papéis vêm de `realm_access.roles`; papel desconhecido é filtrado
   (nunca vira autorização); claims malformadas viram nulo (401 na fronteira),
   nunca TypeError. */
describe("mapeamento de claims do token para identidade", () => {
  it("mapeia sub + realm_access.roles conhecidos", () => {
    const identity = fromTokenClaims({
      sub: "00000000-0000-4000-8000-000000000001",
      realm_access: { roles: ["admin", "offline_access"] },
    });

    expect(identity).toEqual({
      subject: "00000000-0000-4000-8000-000000000001",
      roles: ["admin"],
    });
  });

  it("token sem papéis conhecidos vira identidade sem papéis (não vira erro)", () => {
    const identity = fromTokenClaims({ sub: "user-1" });
    expect(identity).toEqual({ subject: "user-1", roles: [] });

    const wrongShape = fromTokenClaims({
      sub: "user-1",
      realm_access: { roles: "admin" },
    });
    expect(wrongShape).toEqual({ subject: "user-1", roles: [] });
  });

  it("claims malformadas (sem sub, tipo errado, nulo) viram nulo sem TypeError", () => {
    for (const claims of [
      {},
      { sub: "" },
      { sub: "   " },
      { sub: 123 },
      { sub: null },
      null,
      undefined,
      "token",
      42,
    ]) {
      expect(
        fromTokenClaims(claims as never),
        `claims hostis: ${JSON.stringify(claims)}`,
      ).toBeNull();
    }
  });

  it("realm_access nulo ou roles de tipo errado viram identidade sem papéis, sem TypeError", () => {
    for (const realmAccess of [null, 42, { roles: null }, { roles: 42 }]) {
      expect(
        fromTokenClaims({ sub: "user-1", realm_access: realmAccess }),
        `realm_access hostil: ${JSON.stringify(realmAccess)}`,
      ).toEqual({ subject: "user-1", roles: [] });
    }
  });

  it("filtra papéis de tipo errado e duplicados dentro do array", () => {
    const identity = fromTokenClaims({
      sub: "user-1",
      realm_access: { roles: ["admin", "admin", 42, null, "reception"] },
    });

    expect(identity).toEqual({ subject: "user-1", roles: ["admin", "reception"] });
  });
});
