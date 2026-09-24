import type { Post } from "../../domain/entities/post.entity";
import { PostNotFound } from "../../domain/errors/errors";
import type { PostRepository } from "../../domain/ports/post.repository";

/* O slug é entrada opaca: nunca é interpretado como caminho, comando ou fragmento de
   query — se não existir, a resposta é o mesmo PostNotFound genérico (anti-enumeração). */
export class GetPostBySlugUseCase {
  constructor(private readonly posts: PostRepository) {}

  async execute(slug: string): Promise<Post> {
    const post = await this.posts.findBySlug(slug);
    if (!post) {
      throw new PostNotFound();
    }
    return post;
  }
}
