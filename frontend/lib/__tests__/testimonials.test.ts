import { describe, expect, it } from "vitest";
import { getTestimonialsPageCases, initialsOf } from "../testimonials";

describe("casos da página /depoimentos", () => {
  it("expõe ao menos 5 depoimentos fictícios completos", () => {
    const cases = getTestimonialsPageCases();
    expect(cases.length).toBeGreaterThanOrEqual(5);
    for (const item of cases) {
      expect(item.quote).toBeTruthy();
      expect(item.author).toBeTruthy();
      expect(item.context).toBeTruthy();
    }
  });
});

describe("initialsOf (iniciais fictícias)", () => {
  it("usa a primeira letra de cada parte", () => {
    expect(initialsOf("Maria Silva Santos")).toBe("MS");
  });

  it("lida com nome de uma parte", () => {
    expect(initialsOf("Ana")).toBe("A");
  });

  it("ignora espaços duplos sem produzir 'undefined'", () => {
    // Bug real do helper atual: "Maria  Silva" produz "Mundefined".
    expect(initialsOf("Maria  Silva")).toBe("MS");
  });
});