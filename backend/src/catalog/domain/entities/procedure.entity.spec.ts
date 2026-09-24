import { describe, expect, it } from "vitest";
import { InvalidProcedure } from "../errors/errors";
import { Procedure } from "./procedure.entity";

const base = {
  id: "limpeza-de-pele",
  name: "Limpeza de pele",
  description: "Cuidado suave para uma pele fresca e bem cuidada.",
  duration: "Cerca de 60 minutos",
  categories: ["facial"] as const,
};

describe("Procedure (entidade de domínio)", () => {
  it("cria procedimento válido e nasce ativo", () => {
    const procedure = Procedure.create({
      ...base,
      categories: [...base.categories],
    });

    expect(procedure.id).toBe("limpeza-de-pele");
    expect(procedure.name).toBe("Limpeza de pele");
    expect(procedure.description).toContain("Cuidado suave");
    expect(procedure.duration).toBe("Cerca de 60 minutos");
    expect(procedure.categories).toEqual(["facial"]);
    expect(procedure.isActive).toBe(true);
  });

  it("aceita múltiplas categorias válidas", () => {
    const procedure = Procedure.create({
      ...base,
      categories: ["facial", "rejuvenescimento"],
    });

    expect(procedure.categories).toEqual(["facial", "rejuvenescimento"]);
  });

  it("rejeita campos obrigatórios vazios ou só com espaços", () => {
    for (const field of ["id", "name", "description", "duration"] as const) {
      expect(() =>
        Procedure.create({
          ...base,
          categories: [...base.categories],
          [field]: "   ",
        }),
      ).toThrow(InvalidProcedure);
    }
  });

  it("rejeita lista de categorias vazia", () => {
    expect(() => Procedure.create({ ...base, categories: [] })).toThrow(
      InvalidProcedure,
    );
  });

  it("rejeita categoria fora do vocabulário facial/corporal/rejuvenescimento", () => {
    expect(() =>
      Procedure.create({
        ...base,
        categories: ["capilar" as unknown as "facial"],
      }),
    ).toThrow(InvalidProcedure);
  });

  it("restore preserva item inativo", () => {
    const procedure = Procedure.restore({
      ...base,
      categories: [...base.categories],
      isActive: false,
    });

    expect(procedure.isActive).toBe(false);
  });

  it("restore também valida o snapshot (defesa na entrada vinda do banco)", () => {
    expect(() =>
      Procedure.restore({
        ...base,
        categories: [...base.categories],
        name: "   ",
      }),
    ).toThrow(InvalidProcedure);
  });
});
