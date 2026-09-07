import { describe, expect, it } from "vitest";
import { normalizeText, searchProcedures } from "../catalog";
import { proceduresMock } from "../mocks/procedures";

describe("normalizeText", () => {
  it("ignora caixa e acentos", () => {
    expect(normalizeText("Hidratação Facial")).toBe("hidratacao facial");
  });
});

describe("searchProcedures", () => {
  it("filtra por nome parcial", () => {
    const result = searchProcedures(proceduresMock, "limpeza", "todos");
    expect(result.map((item) => item.id)).toEqual(["limpeza-de-pele"]);
  });

  it("combina categoria e texto", () => {
    const result = searchProcedures(proceduresMock, "massagem", "facial");
    expect(result).toEqual([]);
  });

  it("texto vazio retorna tudo da categoria", () => {
    const result = searchProcedures(proceduresMock, "  ", "todos");
    expect(result.length).toBe(proceduresMock.length);
  });
});
