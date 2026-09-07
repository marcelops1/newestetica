import { describe, expect, it } from "vitest";
import { getProcedureBySlug } from "../data";

describe("getProcedureBySlug", () => {
  it("retorna o procedimento para slug existente", () => {
    const item = getProcedureBySlug("limpeza-de-pele");
    expect(item?.name).toBe("Limpeza de pele");
  });

  it("retorna indefinido para slug inexistente", () => {
    expect(getProcedureBySlug("nao-existe")).toBeUndefined();
  });
});
