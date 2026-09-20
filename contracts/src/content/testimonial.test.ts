import { describe, expect, it } from "vitest";
import { testimonialsMock } from "../../../frontend/lib/mocks/testimonials";
import { TestimonialSchema } from "./testimonial";

describe("contrato de Testimonial (conteúdo público)", () => {
  it("todo depoimento mockado do frontend é compatível", () => {
    for (const item of testimonialsMock) {
      const result = TestimonialSchema.safeParse(item);
      expect(result.success, `depoimento mockado ${item.id}`).toBe(true);
    }
  });

  it("rejeita depoimento sem relato, autoria ou contexto", () => {
    expect(
      TestimonialSchema.safeParse({
        id: "depoimento-exemplo",
        quote: "",
        author: "M. S.",
        context: "Paciente ilustrativa",
      }).success,
    ).toBe(false);
    expect(
      TestimonialSchema.safeParse({
        id: "depoimento-exemplo",
        quote: "Relato 100% fictício.",
        author: "M. S.",
      }).success,
    ).toBe(false);
    expect(
      TestimonialSchema.safeParse({
        id: "depoimento-exemplo",
        quote: "Relato 100% fictício.",
        author: "M. S.",
        context: "",
      }).success,
    ).toBe(false);
  });
});
