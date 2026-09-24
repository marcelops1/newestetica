import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  PostSchema,
  PublicBeforeAfterListSchema,
  TestimonialSchema,
} from "@newestetica/contracts";
import { ContentModule } from "../../src/content/content.module";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const TESTIMONIAL_KEYS = ["author", "context", "id", "quote"];
const POST_KEYS = [
  "category",
  "content",
  "excerpt",
  "id",
  "publishedAt",
  "title",
];
const PUBLIC_BEFORE_AFTER_KEYS = [
  "goal",
  "hasConsent",
  "id",
  "recovery",
  "sessions",
  "summary",
  "title",
];

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
  await prisma.testimonial.create({
    data: {
      id: "depoimento-1",
      quote: "Relato 100% fictício.",
      author: "Mariana S.",
      context: "Paciente ilustrativa",
    },
  });
  await prisma.post.create({
    data: {
      id: "cuidados-com-a-pele-aos-40",
      title: "Cuidados com a pele a partir dos 40",
      excerpt: "Resumo 100% fictício.",
      category: "Cuidados diários",
      content: ["Parágrafo fictício."],
      publishedAt: new Date("2026-08-20"),
    },
  });
  await prisma.beforeAfterCase.create({
    data: {
      id: "resultado-1",
      title: "Caso 100% fictício",
      summary: "Resumo 100% fictício.",
      sessions: "2 sessões (intervalo de 30 dias)",
      recovery: "Imediato (sem downtime)",
      goal: "Firmeza e contorno sutil",
      hasConsent: true,
    },
  });
  await prisma.beforeAfterCase.create({
    data: {
      id: "resultado-sem-consentimento",
      title: "Caso fictício sem consentimento",
      summary: "Resumo 100% fictício.",
      sessions: "1 sessão",
      recovery: "Imediato (sem downtime)",
      goal: "Firmeza",
      hasConsent: false,
    },
  });
});

describe("saída do conteúdo conforme o contrato (verificação nas duas pontas)", () => {
  it("a listagem de depoimentos responde no TestimonialSchema, com chaves exatas", async () => {
    const response = await fetch(`${baseUrl}/testimonials`);
    const body = (await response.json()) as Array<Record<string, unknown>>;

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    for (const item of body) {
      expect(
        TestimonialSchema.safeParse(item).success,
        JSON.stringify(item),
      ).toBe(true);
      expect(Object.keys(item).sort()).toEqual(TESTIMONIAL_KEYS);
    }
  });

  it("a listagem de posts responde no PostSchema, com chaves exatas", async () => {
    const response = await fetch(`${baseUrl}/posts`);
    const body = (await response.json()) as Array<Record<string, unknown>>;

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    for (const item of body) {
      expect(PostSchema.safeParse(item).success, JSON.stringify(item)).toBe(
        true,
      );
      expect(Object.keys(item).sort()).toEqual(POST_KEYS);
    }
  });

  it("o detalhe do post responde no PostSchema, com chaves exatas", async () => {
    const response = await fetch(`${baseUrl}/posts/cuidados-com-a-pele-aos-40`);
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(PostSchema.safeParse(body).success).toBe(true);
    expect(Object.keys(body).sort()).toEqual(POST_KEYS);
  });

  it("a listagem de antes/depois valida contra o PublicBeforeAfterListSchema (consentimento literal)", async () => {
    const response = await fetch(`${baseUrl}/before-after`);
    const body = (await response.json()) as unknown;

    expect(response.status).toBe(200);
    const parsed = PublicBeforeAfterListSchema.safeParse(body);
    expect(parsed.success, JSON.stringify(body)).toBe(true);
  });

  it("cada caso do wire tem chaves exatas do contrato público e hasConsent literal true", async () => {
    const response = await fetch(`${baseUrl}/before-after`);
    const body = (await response.json()) as Array<Record<string, unknown>>;

    expect(body).toHaveLength(1);
    for (const item of body) {
      expect(Object.keys(item).sort()).toEqual(PUBLIC_BEFORE_AFTER_KEYS);
      expect(item.hasConsent).toBe(true);
    }
  });
});
