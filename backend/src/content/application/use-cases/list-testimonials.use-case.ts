import type { Testimonial } from "../../domain/entities/testimonial.entity";
import type { TestimonialRepository } from "../../domain/ports/testimonial.repository";

export class ListTestimonialsUseCase {
  constructor(private readonly testimonials: TestimonialRepository) {}

  async execute(): Promise<Testimonial[]> {
    return this.testimonials.findAll();
  }
}
