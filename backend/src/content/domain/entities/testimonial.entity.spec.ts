import { describe, expect, it } from "vitest";
import { InvalidContent } from "../errors/errors";
import { Testimonial } from "./testimonial.entity";

const base = {
  id: "depoimento-1",
  quote: "Relato 100% fictício para teste.",
  author: "Mariana S.",
  context: "Paciente ilustrativa",
};

describe("Testimonial (entidade de domínio)", () => {
  it("cria depoimento válido", () => {
    const testimonial = Testimonial.create(base);

    expect(testimonial.id).toBe("depoimento-1");
    expect(testimonial.quote).toBe("Relato 100% fictício para teste.");
    expect(testimonial.author).toBe("Mariana S.");
    expect(testimonial.context).toBe("Paciente ilustrativa");
  });

  it("rejeita campos obrigatórios vazios ou só com espaços", () => {
    for (const field of ["id", "quote", "author", "context"] as const) {
      expect(() => Testimonial.create({ ...base, [field]: "   " })).toThrow(
        InvalidContent,
      );
    }
  });

  it("restore preserva os campos do snapshot", () => {
    const testimonial = Testimonial.restore(base);

    expect(testimonial.id).toBe("depoimento-1");
    expect(testimonial.quote).toContain("fictício");
  });

  it("restore também valida o snapshot (defesa na entrada vinda do banco)", () => {
    expect(() => Testimonial.restore({ ...base, author: "  " })).toThrow(
      InvalidContent,
    );
  });
});
