import type { Testimonial } from "../entities/testimonial.entity";

/** Porta só de leitura: todo depoimento é público por desenho do contrato. */
export interface TestimonialRepository {
  findAll(): Promise<Testimonial[]>;
}
