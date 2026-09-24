import { describe, expect, it } from "vitest";
import { Testimonial } from "../../domain/entities/testimonial.entity";
import { InMemoryTestimonialRepository } from "../../../../test/fakes/in-memory-testimonial.repository";
import { ListTestimonialsUseCase } from "./list-testimonials.use-case";

function makeTestimonial(id: string): Testimonial {
  return Testimonial.create({
    id,
    quote: `Relato fictício ${id}.`,
    author: "Mariana S.",
    context: "Paciente ilustrativa",
  });
}

function makeUseCase(): ListTestimonialsUseCase {
  return new ListTestimonialsUseCase(
    new InMemoryTestimonialRepository([
      makeTestimonial("depoimento-1"),
      makeTestimonial("depoimento-2"),
    ]),
  );
}

describe("ListTestimonialsUseCase", () => {
  it("lista todos os depoimentos da base", async () => {
    const testimonials = await makeUseCase().execute();

    expect(testimonials.map((item) => item.id)).toEqual([
      "depoimento-1",
      "depoimento-2",
    ]);
  });

  it("base vazia responde lista vazia sem erro", async () => {
    const useCase = new ListTestimonialsUseCase(
      new InMemoryTestimonialRepository([]),
    );

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
