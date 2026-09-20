import { describe, expect, it } from "vitest";
import { proceduresMock } from "../../../frontend/lib/mocks/procedures";
import { ProcedureSchema } from "./procedure";

describe("contrato de Procedure (catálogo)", () => {
  it("todo procedimento mockado do frontend é compatível", () => {
    for (const item of proceduresMock) {
      const result = ProcedureSchema.safeParse(item);
      expect(result.success, `procedimento mockado ${item.id}`).toBe(true);
    }
  });

  it("aceita procedimento válido com categorias conhecidas", () => {
    const result = ProcedureSchema.safeParse({
      id: "procedimento-exemplo",
      name: "Procedimento Exemplo",
      description: "Descrição 100% fictícia para o teste.",
      duration: "Aprox. 30 min",
      categories: ["facial", "rejuvenescimento"],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita categoria fora do vocabulário facial/corporal/rejuvenescimento", () => {
    const result = ProcedureSchema.safeParse({
      ...proceduresMock[0],
      categories: ["capilar"],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita lista de categorias vazia e campos obrigatórios ausentes", () => {
    expect(
      ProcedureSchema.safeParse({ ...proceduresMock[0], categories: [] }).success,
    ).toBe(false);
    expect(
      ProcedureSchema.safeParse({
        id: "procedimento-sem-campos",
        name: "Sem descrição nem duração",
        categories: ["facial"],
      }).success,
    ).toBe(false);
  });

  it("rejeita id vazio", () => {
    expect(
      ProcedureSchema.safeParse({ ...proceduresMock[0], id: "" }).success,
    ).toBe(false);
  });
});
