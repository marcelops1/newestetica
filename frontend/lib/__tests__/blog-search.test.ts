import { describe, expect, it } from "vitest";
import { postsMock } from "../mocks/schedule";
import { formatDateBR, searchPosts } from "../blog";

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

describe("formatDateBR (data legível e determinística)", () => {
  it("formata data ISO válida em pt-BR", () => {
    expect(formatDateBR("2026-08-20")).toBe("20 de agosto de 2026");
  });

  it("retorna a entrada crua quando não é uma data ISO", () => {
    expect(formatDateBR("não-é-data")).toBe("não-é-data");
  });

  it("retorna a entrada crua para mês fora do calendário", () => {
    expect(formatDateBR("2026-13-01")).toBe("2026-13-01");
    expect(formatDateBR("2026-00-10")).toBe("2026-00-10");
  });

  it("retorna a entrada crua para dia fora do calendário", () => {
    expect(formatDateBR("2026-08-32")).toBe("2026-08-32");
    expect(formatDateBR("2026-08-00")).toBe("2026-08-00");
  });
});
