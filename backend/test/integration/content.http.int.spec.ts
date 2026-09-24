import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { PostSchema, TestimonialSchema } from "@newestetica/contracts";
import { ContentModule } from "../../src/content/content.module";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

async function seedTestimonial(id: string): Promise<void> {
  await prisma.testimonial.create({
    data: {
      id,
      quote: `Relato fictício ${id}.`,
      author: "Mariana S.",
      context: "Paciente ilustrativa",
    },
  });
}

async function seedPost(id: string, publishedAt: string): Promise<void> {
  await prisma.post.create({
    data: {
      id,
      title: `Post ${id}`,
      excerpt: "Resumo 100% fictício.",
      category: "Cuidados diários",
      content: ["Parágrafo fictício."],
      publishedAt: new Date(publishedAt),
    },
  });
}

async function seedCase(id: string, hasConsent: boolean): Promise<void> {
  await prisma.beforeAfterCase.create({
    data: {
      id,
      title: `Caso ${id}`,
      summary: "Resumo 100% fictício.",
      sessions: "1 sessão",
      recovery: "Imediato (sem downtime)",
      goal: "Firmeza",
      hasConsent,
    },
  });
}

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  app = await NestFactory.create(ContentModule, { logger: false });
  await app.listen(0);
  baseUrl = await app.getUrl();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("Content HTTP (contrato da Presentation)", () => {
  it("GET /testimonials lista os depoimentos no formato do contrato", async () => {
    await seedTestimonial("depoimento-2");
    await seedTestimonial("depoimento-1");

    const response = await fetch(`${baseUrl}/testimonials`);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<Record<string, unknown>>;
    expect(body.map((item) => item.id)).toEqual([
      "depoimento-1",
      "depoimento-2",
    ]);
    for (const item of body) {
      expect(
        TestimonialSchema.safeParse(item).success,
        JSON.stringify(item),
      ).toBe(true);
    }
  });

  it("GET /testimonials sem itens responde lista vazia", async () => {
    const response = await fetch(`${baseUrl}/testimonials`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
  });

  it("GET /posts lista os posts com os mais recentes primeiro", async () => {
    await seedPost("mais-antigo", "2026-08-01");
    await seedPost("mais-recente", "2026-09-10");

    const response = await fetch(`${baseUrl}/posts`);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<Record<string, unknown>>;
    expect(body.map((item) => item.id)).toEqual([
      "mais-recente",
      "mais-antigo",
    ]);
    for (const item of body) {
      expect(PostSchema.safeParse(item).success, JSON.stringify(item)).toBe(
        true,
      );
    }
  });

  it("GET /posts/:slug retorna o post e 404 estruturado para inexistente", async () => {
    await seedPost("cuidados-com-a-pele-aos-40", "2026-08-20");

    const found = await fetch(`${baseUrl}/posts/cuidados-com-a-pele-aos-40`);
    expect(found.status).toBe(200);
    const foundBody = (await found.json()) as Record<string, unknown>;
    expect(PostSchema.safeParse(foundBody).success).toBe(true);
    expect(foundBody.id).toBe("cuidados-com-a-pele-aos-40");

    const missing = await fetch(`${baseUrl}/posts/nao-existe`);
    expect(missing.status).toBe(404);
    const missingBody = (await missing.json()) as { code: string };
    expect(missingBody.code).toBe("POST_NOT_FOUND");
  });

  it("GET /posts/:slug com slug acima do limite responde 422 estruturado", async () => {
    const response = await fetch(
      `${baseUrl}/posts/${encodeURIComponent("x".repeat(10_000))}`,
    );

    expect(response.status).toBe(422);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("GET /posts/:slug com injeção responde 404 (string opaca, sem erro interno)", async () => {
    await seedPost("cuidados-com-a-pele-aos-40", "2026-08-20");

    const response = await fetch(
      `${baseUrl}/posts/${encodeURIComponent("' OR '1'='1")}`,
    );

    expect(response.status).toBe(404);
    const body = (await response.json()) as { code: string };
    expect(body.code).toBe("POST_NOT_FOUND");
  });

  it("GET /before-after lista somente casos com consentimento", async () => {
    await seedCase("resultado-com", true);
    await seedCase("resultado-sem", false);

    const response = await fetch(`${baseUrl}/before-after`);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<{ id: string }>;
    expect(body.map((item) => item.id)).toEqual(["resultado-com"]);
  });

  it("GET /before-after sem consentidos responde lista vazia sem erro", async () => {
    await seedCase("resultado-sem", false);

    const response = await fetch(`${baseUrl}/before-after`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
  });
});
