import { describe, expect, it } from "vitest";
import { getPostBySlug, getPostCategories, getPosts } from "../data";

describe("contrato dos posts do blog", () => {
  it("todo post tem categoria, título, resumo, conteúdo e data não-vazios", () => {
    const posts = getPosts();
    expect(posts.length).toBeGreaterThanOrEqual(4);
    for (const post of posts) {
      expect(post.category.length).toBeGreaterThan(0);
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.excerpt.length).toBeGreaterThan(0);
      expect(post.content.length).toBeGreaterThan(0);
      for (const paragraph of post.content) {
        expect(paragraph.length).toBeGreaterThan(0);
      }
      expect(post.publishedAt.length).toBeGreaterThan(0);
    }
  });

  it("abas derivadas não têm categoria órfã e seguem a ordem dos mocks", () => {
    const posts = getPosts();
    const categories = getPostCategories();
    expect(categories.length).toBeGreaterThan(0);
    for (const category of categories) {
      expect(posts.some((post) => post.category === category)).toBe(true);
    }
    const unique = new Set(posts.map((post) => post.category));
    expect(categories).toEqual([...unique]);
  });

  it("todo conteúdo é educativo e tranquilizador (sem alarmismo)", () => {
    const posts = getPosts();
    for (const post of posts) {
      expect(post.content.join(" ").toLowerCase()).not.toMatch(
        /perigo|risco|cuidado!|errado|errada|proibido|nunca faça/,
      );
    }
  });
});

describe("getPostBySlug", () => {
  it("retorna o post para slug existente", () => {
    const post = getPostBySlug("cuidados-com-a-pele-aos-40");
    expect(post?.title).toBe("Cuidados com a pele a partir dos 40");
  });

  it("retorna indefinido para slug inexistente", () => {
    expect(getPostBySlug("nao-existe")).toBeUndefined();
  });
});
