import { Controller, Get, Param, UseFilters } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import {
  PostSchema,
  PublicBeforeAfterListSchema,
  TestimonialSchema,
  type Post,
  type PublicBeforeAfter,
  type Testimonial,
} from "@newestetica/contracts";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { GetPostBySlugUseCase } from "../../application/use-cases/get-post-by-slug.use-case";
import { ListBeforeAfterUseCase } from "../../application/use-cases/list-before-after.use-case";
import { ListPostsUseCase } from "../../application/use-cases/list-posts.use-case";
import { ListTestimonialsUseCase } from "../../application/use-cases/list-testimonials.use-case";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";

class TestimonialResponseDto extends createZodDto(TestimonialSchema) {}
class PostResponseDto extends createZodDto(PostSchema) {}
class PublicBeforeAfterResponseDto extends createZodDto(
  PublicBeforeAfterListSchema.element,
) {}

const SlugSchema = z.string().min(1).max(200);

@ApiTags("Conteúdo Público")
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
  @ApiOperation({ summary: "Lista os depoimentos públicos" })
  @ApiOkResponse({
    description: "Depoimentos públicos (autoria fictícia).",
    type: TestimonialResponseDto,
    isArray: true,
  })
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
  @ApiOperation({ summary: "Lista os posts do blog (mais recentes primeiro)" })
  @ApiOkResponse({
    description: "Posts públicos.",
    type: PostResponseDto,
    isArray: true,
  })
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
  @ApiOperation({ summary: "Consulta um post do blog pelo slug" })
  @ApiParam({ name: "slug", description: "Identificador do post." })
  @ApiOkResponse({ description: "Post público.", type: PostResponseDto })
  @ApiNotFoundResponse({ description: "Post não encontrado." })
  @ApiUnprocessableEntityResponse({ description: "Slug inválido." })
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
  @ApiOperation({
    summary: "Lista os casos de antes/depois com consentimento explícito",
  })
  @ApiOkResponse({
    description:
      "Somente casos com consentimento explícito (nada sem consentimento é servido).",
    type: PublicBeforeAfterResponseDto,
    isArray: true,
  })
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
