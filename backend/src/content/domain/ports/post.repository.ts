import type { Post } from "../entities/post.entity";

export interface PostRepository {
  findAll(): Promise<Post[]>;
  findBySlug(slug: string): Promise<Post | null>;
}
