import { describe, expect, it } from "vitest";
import { postsMock } from "../mocks/schedule";
import { searchPosts } from "../blog";

describe("searchPosts (busca e filtro do blog)", () => {
  it("filtra por título parcial", () => {
    const result = searchPosts(postsMock, "avaliação", "todos");
    expect(result.map((post) => post.id)).toEqual([
      "o-que-esperar-da-primeira-avaliacao",
    ]);
  });

  it("filtra por resumo parcial", () => {
    const result = searchPosts(postsMock, "leveza", "todos");
    expect(result.map((post) => post.id)).toEqual(["hidratacao-alem-do-verao"]);
  });

  it("ignora acentos e caixa (mesma normalização do catálogo)", () => {
    const result = searchPosts(postsMock, "HIDRATACAO", "todos");
    expect(result.map((post) => post.id)).toEqual(["hidratacao-alem-do-verao"]);
  });

  it("combina categoria e texto", () => {
    const result = searchPosts(postsMock, "pele", "Primeira visita");
    expect(result).toEqual([]);
  });

  it("texto vazio retorna tudo da categoria", () => {
    const result = searchPosts(postsMock, "   ", "Cuidados diários");
    expect(result.length).toBe(2);
  });

  it("query com marcação é tratada como texto puro (OWASP)", () => {
    const result = searchPosts(postsMock, "<script>alert(1)</script>", "todos");
    expect(result).toEqual([]);
  });

  it("query com & e aspas é tratada como texto puro (OWASP)", () => {
    const result = searchPosts(postsMock, 'pele & "cuidado"', "todos");
    expect(Array.isArray(result)).toBe(true);
  });
});
