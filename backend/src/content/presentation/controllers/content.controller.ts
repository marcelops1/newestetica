import { Controller, Get, Param, UseFilters } from "@nestjs/common";
import {
  PublicBeforeAfterListSchema,
  type Post,
  type PublicBeforeAfter,
  type Testimonial,
} from "@newestetica/contracts";
import { z } from "zod";
import { GetPostBySlugUseCase } from "../../application/use-cases/get-post-by-slug.use-case";
import { ListBeforeAfterUseCase } from "../../application/use-cases/list-before-after.use-case";
import { ListPostsUseCase } from "../../application/use-cases/list-posts.use-case";
import { ListTestimonialsUseCase } from "../../application/use-cases/list-testimonials.use-case";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

const SlugSchema = z.string().min(1).max(200);

@Controller()
@UseFilters(DomainExceptionFilter)
export class ContentController {
  constructor(
    private readonly listTestimonials: ListTestimonialsUseCase,
    private readonly listPosts: ListPostsUseCase,
    private readonly getPostBySlug: GetPostBySlugUseCase,
    private readonly listBeforeAfter: ListBeforeAfterUseCase,
  ) {}

  @Get("testimonials")
  async listTestimonialsRoute(): Promise<Testimonial[]> {
    const testimonials = await this.listTestimonials.execute();
    /* Allowlist explícita do contrato: a entidade nunca cruza o wire. */
    return testimonials.map((item) => ({
      id: item.id,
      quote: item.quote,
      author: item.author,
      context: item.context,
    }));
  }

  @Get("posts")
  async listPostsRoute(): Promise<Post[]> {
    const posts = await this.listPosts.execute();
    return posts.map((item) => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      category: item.category,
      content: item.content,
      publishedAt: item.publishedAt,
    }));
  }

  @Get("posts/:slug")
  async postBySlug(
    @Param("slug", new ZodValidationPipe(SlugSchema)) slug: string,
  ): Promise<Post> {
    const post = await this.getPostBySlug.execute(slug);
    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      content: post.content,
      publishedAt: post.publishedAt,
    };
  }

  @Get("before-after")
  async listBeforeAfterRoute(): Promise<PublicBeforeAfter[]> {
    const cases = await this.listBeforeAfter.execute();
    const payload = cases.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      sessions: item.sessions,
      recovery: item.recovery,
      goal: item.goal,
      hasConsent: item.hasConsent,
    }));
    /* Camada 3 da invariante de consentimento: a saída é validada contra o contrato
       público (`hasConsent: z.literal(true)`). Se um caso sem consentimento escapar do
       banco por falha da query, o parse falha (fail-closed) em vez de servi-lo. */
    return PublicBeforeAfterListSchema.parse(payload);
  }
}
