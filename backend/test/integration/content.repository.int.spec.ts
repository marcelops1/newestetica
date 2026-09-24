import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaBeforeAfterCaseRepository } from "../../src/content/infrastructure/persistence/before-after-case.repository.impl";
import { PrismaPostRepository } from "../../src/content/infrastructure/persistence/post.repository.impl";
import { PrismaTestimonialRepository } from "../../src/content/infrastructure/persistence/testimonial.repository.impl";
import { createTestPrismaClient, resetDatabase } from "./database";

const prisma = createTestPrismaClient();
const testimonials = new PrismaTestimonialRepository(prisma);
const posts = new PrismaPostRepository(prisma);
const cases = new PrismaBeforeAfterCaseRepository(prisma);

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

beforeEach(async () => {
  await resetDatabase(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaTestimonialRepository (integração com Postgres real)", () => {
  it("faz round-trip de um depoimento íntegro (mapper não vaza o registro do ORM)", async () => {
    await seedTestimonial("depoimento-1");

    const found = await testimonials.findAll();

    expect(found).toHaveLength(1);
    expect(found[0]?.id).toBe("depoimento-1");
    expect(found[0]?.quote).toBe("Relato fictício depoimento-1.");
    expect(found[0]?.author).toBe("Mariana S.");
    expect(found[0]?.context).toBe("Paciente ilustrativa");
  });

  it("lista em ordem determinística por id", async () => {
    await seedTestimonial("depoimento-2");
    await seedTestimonial("depoimento-1");

    const found = await testimonials.findAll();

    expect(found.map((item) => item.id)).toEqual([
      "depoimento-1",
      "depoimento-2",
    ]);
  });
});

describe("PrismaPostRepository (integração com Postgres real)", () => {
  it("faz round-trip de um post íntegro", async () => {
    await seedPost("cuidados-com-a-pele-aos-40", "2026-08-20");

    const found = await posts.findAll();

    expect(found).toHaveLength(1);
    expect(found[0]?.id).toBe("cuidados-com-a-pele-aos-40");
    expect(found[0]?.content).toEqual(["Parágrafo fictício."]);
    expect(found[0]?.publishedAt).toBe("2026-08-20");
  });

  it("lista em ordem determinística: mais recentes primeiro", async () => {
    await seedPost("mais-antigo", "2026-08-01");
    await seedPost("mais-recente", "2026-09-10");
    await seedPost("intermediario", "2026-08-20");

    const found = await posts.findAll();

    expect(found.map((post) => post.id)).toEqual([
      "mais-recente",
      "intermediario",
      "mais-antigo",
    ]);
  });

  it("findBySlug encontra pelo id e responde null para inexistente", async () => {
    await seedPost("cuidados-com-a-pele-aos-40", "2026-08-20");

    const found = await posts.findBySlug("cuidados-com-a-pele-aos-40");
    expect(found?.id).toBe("cuidados-com-a-pele-aos-40");

    await expect(posts.findBySlug("nao-existe")).resolves.toBeNull();
  });
});

describe("PrismaBeforeAfterCaseRepository (integração com Postgres real)", () => {
  it("findConsented exclui caso sem consentimento mesmo com o registro existindo", async () => {
    await seedCase("resultado-com", true);
    await seedCase("resultado-sem", false);

    const consented = await cases.findConsented();

    expect(consented.map((item) => item.id)).toEqual(["resultado-com"]);
    expect(consented.every((item) => item.hasConsent)).toBe(true);
  });

  it("sem nenhum caso consentido responde lista vazia (sem erro)", async () => {
    await seedCase("resultado-sem", false);

    await expect(cases.findConsented()).resolves.toEqual([]);
  });

  it("lista consentidos em ordem determinística por id", async () => {
    await seedCase("resultado-2", true);
    await seedCase("resultado-1", true);

    const consented = await cases.findConsented();

    expect(consented.map((item) => item.id)).toEqual([
      "resultado-1",
      "resultado-2",
    ]);
  });
});
