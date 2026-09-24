import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { PublicBeforeAfterListSchema } from "@newestetica/contracts";
import { ContentModule } from "../../src/content/content.module";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

/* Prova dedicada da invariante central (task 4.5): "nada sem consentimento é servido
   publicamente". O banco contém um caso COM e um SEM consentimento; a resposta HTTP
   precisa conter exatamente o consentido. A garantia é provada pela falha: com o filtro
   ausente/ingênuo, o caso sem consentimento aparece na resposta e este arquivo reprova
   (ver evidência RED no verification.md). */

const prisma = createTestPrismaClient();
let app: INestApplication;
let baseUrl: string;

const WITH_CONSENT = "resultado-com-consentimento";
const WITHOUT_CONSENT = "resultado-sem-consentimento";

async function seedCase(id: string, hasConsent: boolean): Promise<void> {
  await prisma.beforeAfterCase.create({
    data: {
      id,
      title: `Caso fictício ${id}`,
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

describe("exclusão de consentimento na leitura pública (invariante)", () => {
  it("GET /before-after contém exatamente o caso consentido — o sem consentimento nunca aparece", async () => {
    await seedCase(WITHOUT_CONSENT, false);
    await seedCase(WITH_CONSENT, true);

    const response = await fetch(`${baseUrl}/before-after`);
    const body = (await response.json()) as Array<{ id: string }>;

    expect(response.status).toBe(200);
    expect(body.map((item) => item.id)).toEqual([WITH_CONSENT]);
    expect(body.map((item) => item.id)).not.toContain(WITHOUT_CONSENT);
  });

  it("sem nenhum consentido, a resposta é vazia mesmo com o caso existindo no banco", async () => {
    await seedCase(WITHOUT_CONSENT, false);

    const response = await fetch(`${baseUrl}/before-after`);
    const body = (await response.json()) as Array<{ id: string }>;

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
    expect(JSON.stringify(body)).not.toContain(WITHOUT_CONSENT);
  });

  it("todo item servido valida contra o contrato público (consentimento literal true)", async () => {
    await seedCase(WITHOUT_CONSENT, false);
    await seedCase(WITH_CONSENT, true);

    const response = await fetch(`${baseUrl}/before-after`);
    const body = (await response.json()) as unknown;

    const parsed = PublicBeforeAfterListSchema.safeParse(body);
    expect(parsed.success, JSON.stringify(body)).toBe(true);
    if (parsed.success) {
      expect(parsed.data.every((item) => item.hasConsent === true)).toBe(true);
    }
  });

  it("sonda de bypass: não existe acesso direto ao caso sem consentimento (sem rota de detalhe)", async () => {
    await seedCase(WITHOUT_CONSENT, false);

    const direct = await fetch(`${baseUrl}/before-after/${WITHOUT_CONSENT}`);
    expect(direct.status).toBe(404);

    const withQuery = await fetch(
      `${baseUrl}/before-after?hasConsent=false&id=${WITHOUT_CONSENT}`,
    );
    expect(withQuery.status).toBe(200);
    await expect(withQuery.json()).resolves.toEqual([]);
  });
});
