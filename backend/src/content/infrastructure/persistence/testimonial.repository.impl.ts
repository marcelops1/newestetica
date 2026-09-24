import type { PrismaClient } from "../../../generated/prisma/client";
import type { Testimonial } from "../../domain/entities/testimonial.entity";
import type { TestimonialRepository } from "../../domain/ports/testimonial.repository";
import { toTestimonialDomain } from "./mappers/testimonial.mapper";

/* Sem UnitOfWork: só leitura de entidade única (design decisão 3). Ordem estável por id
   para a listagem pública ser determinística (design decisão 7). */
export class PrismaTestimonialRepository implements TestimonialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Testimonial[]> {
    const records = await this.prisma.testimonial.findMany({
      orderBy: { id: "asc" },
    });
    return records.map(toTestimonialDomain);
  }
}
