import { describe, expect, it } from "vitest";
import { Post } from "../../domain/entities/post.entity";
import { InMemoryPostRepository } from "../../../../test/fakes/in-memory-post.repository";
import { ListPostsUseCase } from "./list-posts.use-case";

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

function makeUseCase(): ListPostsUseCase {
  return new ListPostsUseCase(
    new InMemoryPostRepository([
      makePost("cuidados-com-a-pele-aos-40"),
      makePost("hidratacao-alem-do-verao"),
    ]),
  );
}

describe("ListPostsUseCase", () => {
  it("lista todos os posts da base", async () => {
    const posts = await makeUseCase().execute();

    expect(posts.map((post) => post.id)).toEqual([
      "cuidados-com-a-pele-aos-40",
      "hidratacao-alem-do-verao",
    ]);
  });

  it("base vazia responde lista vazia sem erro", async () => {
    const useCase = new ListPostsUseCase(new InMemoryPostRepository([]));

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
