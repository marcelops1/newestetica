import type { Post } from "../../domain/entities/post.entity";
import type { PostRepository } from "../../domain/ports/post.repository";

export class ListPostsUseCase {
  constructor(private readonly posts: PostRepository) {}

  async execute(): Promise<Post[]> {
    return this.posts.findAll();
  }
}
