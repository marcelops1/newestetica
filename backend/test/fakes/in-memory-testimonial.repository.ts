import type { Testimonial } from "../../src/content/domain/entities/testimonial.entity";
import type { TestimonialRepository } from "../../src/content/domain/ports/testimonial.repository";

export class InMemoryTestimonialRepository implements TestimonialRepository {
  private readonly testimonials: Testimonial[];

  constructor(initial: Testimonial[] = []) {
    this.testimonials = [...initial];
  }

  async findAll(): Promise<Testimonial[]> {
    return [...this.testimonials];
  }
}
