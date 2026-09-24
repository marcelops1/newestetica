import { describe, expect, it } from "vitest";
import { InvalidContent } from "../errors/errors";
import { Post } from "./post.entity";

const base = {
  id: "cuidados-com-a-pele-aos-40",
  title: "Cuidados com a pele a partir dos 40",
  excerpt: "O que muda na pele com o tempo e como cuidar com suavidade.",
  category: "Cuidados diários",
  content: ["Parágrafo 100% fictício.", "Segundo parágrafo fictício."],
  publishedAt: "2026-08-20",
};

describe("Post (entidade de domínio)", () => {
  it("cria post válido", () => {
    const post = Post.create(base);

    expect(post.id).toBe("cuidados-com-a-pele-aos-40");
    expect(post.title).toContain("Cuidados com a pele");
    expect(post.content).toHaveLength(2);
    expect(post.publishedAt).toBe("2026-08-20");
  });

  it("rejeita campos obrigatórios vazios ou só com espaços", () => {
    for (const field of [
      "id",
      "title",
      "excerpt",
      "category",
      "publishedAt",
    ] as const) {
      expect(() => Post.create({ ...base, [field]: "   " })).toThrow(
        InvalidContent,
      );
    }
  });

  it("rejeita conteúdo sem parágrafos ou com parágrafo vazio", () => {
    expect(() => Post.create({ ...base, content: [] })).toThrow(InvalidContent);
    expect(() => Post.create({ ...base, content: ["Válido.", "  "] })).toThrow(
      InvalidContent,
    );
  });

  it("rejeita data de publicação fora do formato ISO (AAAA-MM-DD)", () => {
    expect(() => Post.create({ ...base, publishedAt: "20/08/2026" })).toThrow(
      InvalidContent,
    );
  });

  it("rejeita data parcial ou com ruído ao redor (regex estritamente ancorada)", () => {
    for (const publishedAt of [
      "2026-08-20T00:00:00",
      "x2026-08-20",
      " 2026-08-20 ",
    ]) {
      expect(() => Post.create({ ...base, publishedAt })).toThrow(
        InvalidContent,
      );
    }
  });

  it("restore preserva os campos e também valida o snapshot", () => {
    const post = Post.restore(base);

    expect(post.publishedAt).toBe("2026-08-20");
    expect(() => Post.restore({ ...base, title: "   " })).toThrow(
      InvalidContent,
    );
  });
});
