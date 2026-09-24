import { describe, expect, it } from "vitest";
import { BeforeAfterCase } from "../entities/before-after-case.entity";
import { Post } from "../entities/post.entity";
import { Testimonial } from "../entities/testimonial.entity";
import { InMemoryBeforeAfterCaseRepository } from "../../../../test/fakes/in-memory-before-after-case.repository";
import { InMemoryPostRepository } from "../../../../test/fakes/in-memory-post.repository";
import { InMemoryTestimonialRepository } from "../../../../test/fakes/in-memory-testimonial.repository";

function makeTestimonial(id: string): Testimonial {
  return Testimonial.create({
    id,
    quote: "Relato 100% fictício.",
    author: "Mariana S.",
    context: "Paciente ilustrativa",
  });
}

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

function makeCase(id: string, hasConsent: boolean): BeforeAfterCase {
  const props = {
    id,
    title: `Caso ${id}`,
    summary: "Resumo 100% fictício.",
    sessions: "1 sessão",
    recovery: "Imediato (sem downtime)",
    goal: "Firmeza",
  };
  return hasConsent
    ? BeforeAfterCase.restore({ ...props, hasConsent })
    : BeforeAfterCase.create(props);
}

describe("portas do Domain (conteúdo público)", () => {
  it("o fake manual cumpre TestimonialRepository: findAll lista todos", async () => {
    const repository = new InMemoryTestimonialRepository([
      makeTestimonial("depoimento-1"),
      makeTestimonial("depoimento-2"),
    ]);

    const testimonials = await repository.findAll();

    expect(testimonials.map((item) => item.id)).toEqual([
      "depoimento-1",
      "depoimento-2",
    ]);
  });

  it("o fake manual cumpre PostRepository: findAll lista e findBySlug encontra", async () => {
    const repository = new InMemoryPostRepository([
      makePost("cuidados-com-a-pele-aos-40"),
      makePost("hidratacao-alem-do-verao"),
    ]);

    const posts = await repository.findAll();
    const found = await repository.findBySlug("hidratacao-alem-do-verao");

    expect(posts).toHaveLength(2);
    expect(found?.id).toBe("hidratacao-alem-do-verao");
    await expect(repository.findBySlug("nao-existe")).resolves.toBeNull();
  });

  it("findConsented exclui caso sem consentimento mesmo existindo no repositório", async () => {
    const repository = new InMemoryBeforeAfterCaseRepository([
      makeCase("resultado-com", true),
      makeCase("resultado-sem", false),
    ]);

    const consented = await repository.findConsented();

    expect(consented.map((item) => item.id)).toEqual(["resultado-com"]);
    expect(consented.every((item) => item.hasConsent)).toBe(true);
  });
});
