import { Module } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { createPrismaClientFromEnv } from "../shared/prisma/client-factory";
import { GetPostBySlugUseCase } from "./application/use-cases/get-post-by-slug.use-case";
import { ListBeforeAfterUseCase } from "./application/use-cases/list-before-after.use-case";
import { ListPostsUseCase } from "./application/use-cases/list-posts.use-case";
import { ListTestimonialsUseCase } from "./application/use-cases/list-testimonials.use-case";
import { PrismaBeforeAfterCaseRepository } from "./infrastructure/persistence/before-after-case.repository.impl";
import { PrismaPostRepository } from "./infrastructure/persistence/post.repository.impl";
import { PrismaTestimonialRepository } from "./infrastructure/persistence/testimonial.repository.impl";
import { ContentController } from "./presentation/controllers/content.controller";

export const CONTENT_PRISMA_CLIENT = Symbol("CONTENT_PRISMA_CLIENT");
export const TESTIMONIAL_REPOSITORY = Symbol("TESTIMONIAL_REPOSITORY");
export const POST_REPOSITORY = Symbol("POST_REPOSITORY");
export const BEFORE_AFTER_CASE_REPOSITORY = Symbol(
  "BEFORE_AFTER_CASE_REPOSITORY",
);

/* Cliente próprio do módulo (mesmo padrão de Scheduling/Catálogo): a factory é
   compartilhada (kernel), a instância não. Trade-off registrado (design decisão 8): o
   terceiro pool segue conscientemente adiado; provider compartilhado vira change próprio
   no 4º módulo ou sob pressão observada. */

@Module({
  controllers: [ContentController],
  providers: [
    { provide: CONTENT_PRISMA_CLIENT, useFactory: createPrismaClientFromEnv },
    {
      provide: TESTIMONIAL_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaTestimonialRepository(prisma),
      inject: [CONTENT_PRISMA_CLIENT],
    },
    {
      provide: POST_REPOSITORY,
      useFactory: (prisma: PrismaClient) => new PrismaPostRepository(prisma),
      inject: [CONTENT_PRISMA_CLIENT],
    },
    {
      provide: BEFORE_AFTER_CASE_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaBeforeAfterCaseRepository(prisma),
      inject: [CONTENT_PRISMA_CLIENT],
    },
    {
      provide: ListTestimonialsUseCase,
      useFactory: (testimonials: PrismaTestimonialRepository) =>
        new ListTestimonialsUseCase(testimonials),
      inject: [TESTIMONIAL_REPOSITORY],
    },
    {
      provide: ListPostsUseCase,
      useFactory: (posts: PrismaPostRepository) => new ListPostsUseCase(posts),
      inject: [POST_REPOSITORY],
    },
    {
      provide: GetPostBySlugUseCase,
      useFactory: (posts: PrismaPostRepository) =>
        new GetPostBySlugUseCase(posts),
      inject: [POST_REPOSITORY],
    },
    {
      provide: ListBeforeAfterUseCase,
      useFactory: (cases: PrismaBeforeAfterCaseRepository) =>
        new ListBeforeAfterUseCase(cases),
      inject: [BEFORE_AFTER_CASE_REPOSITORY],
    },
  ],
})
export class ContentModule {}
