import type { Post } from "../../src/content/domain/entities/post.entity";
import type { PostRepository } from "../../src/content/domain/ports/post.repository";

export class InMemoryPostRepository implements PostRepository {
  private readonly posts: Post[];

  constructor(initial: Post[] = []) {
    this.posts = [...initial];
  }

  async findAll(): Promise<Post[]> {
    return [...this.posts];
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return this.posts.find((post) => post.id === slug) ?? null;
  }
}
