import { describe, expect, it } from "vitest";
import { Post } from "../../domain/entities/post.entity";
import { PostNotFound } from "../../domain/errors/errors";
import { InMemoryPostRepository } from "../../../../test/fakes/in-memory-post.repository";
import { GetPostBySlugUseCase } from "./get-post-by-slug.use-case";

function makePost(id: string): Post {
  return Post.create({
    id,
    title: `Post ${id}`,
    excerpt: "Resumo 100% fictício.",
    category: "Cuidados diários",
    content: ["Parágrafo fictício."],
    publishedAt: "2026-08-20",
  });
}

function makeUseCase(): GetPostBySlugUseCase {
  return new GetPostBySlugUseCase(
    new InMemoryPostRepository([makePost("cuidados-com-a-pele-aos-40")]),
  );
}

describe("GetPostBySlugUseCase", () => {
  it("retorna o post pelo slug", async () => {
    const post = await makeUseCase().execute("cuidados-com-a-pele-aos-40");

    expect(post.id).toBe("cuidados-com-a-pele-aos-40");
    expect(post.title).toContain("cuidados-com-a-pele-aos-40");
  });

  it("slug inexistente responde PostNotFound", async () => {
    await expect(makeUseCase().execute("nao-existe")).rejects.toThrow(
      PostNotFound,
    );
  });

  it("PostNotFound não ecoa o slug consultado (anti-enumeração)", async () => {
    await expect(makeUseCase().execute("segredo-fictício")).rejects.toThrow(
      "Post não encontrado.",
    );
  });
});
