import type { PrismaClient } from "../../../generated/prisma/client";
import type { Post } from "../../domain/entities/post.entity";
import type { PostRepository } from "../../domain/ports/post.repository";
import { toPostDomain } from "./mappers/post.mapper";

/* Ordem de blog: mais recentes primeiro (design decisão 7). O slug é o id — `findUnique`
   parametrizado, sem concatenação de SQL. */
export class PrismaPostRepository implements PostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Post[]> {
    const records = await this.prisma.post.findMany({
      orderBy: { publishedAt: "desc" },
    });
    return records.map(toPostDomain);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const record = await this.prisma.post.findUnique({ where: { id: slug } });
    if (!record) {
      return null;
    }
    return toPostDomain(record);
  }
}
