import { afterEach, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { setupSwagger } from "../../src/swagger";
import { testDatabaseUrl } from "./database";

/* Gate por ambiente (docs/security/03-seguranca.md §8): produção sem SWAGGER_ENABLED
   esconde /docs e /docs-json; a flag explícita reabilita. */

const originalNodeEnv = process.env.NODE_ENV;
const originalSwaggerEnabled = process.env.SWAGGER_ENABLED;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  if (originalSwaggerEnabled === undefined) {
    delete process.env.SWAGGER_ENABLED;
  } else {
    process.env.SWAGGER_ENABLED = originalSwaggerEnabled;
  }
});

async function bootDocs(
  nodeEnv: string,
  swaggerEnabled: string | undefined,
): Promise<{ app: INestApplication; baseUrl: string }> {
  process.env.NODE_ENV = nodeEnv;
  if (swaggerEnabled === undefined) {
    delete process.env.SWAGGER_ENABLED;
  } else {
    process.env.SWAGGER_ENABLED = swaggerEnabled;
  }
  process.env.DATABASE_URL = testDatabaseUrl();
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  setupSwagger(app);
  await app.listen(0);
  return { app, baseUrl: await app.getUrl() };
}

describe("gate das docs por ambiente", () => {
  it("produção sem SWAGGER_ENABLED esconde /docs e /docs-json (404)", async () => {
    const { app, baseUrl } = await bootDocs("production", undefined);

    try {
      const ui = await fetch(`${baseUrl}/docs`);
      const json = await fetch(`${baseUrl}/docs-json`);
      expect(ui.status).toBe(404);
      expect(json.status).toBe(404);
    } finally {
      await app.close();
    }
  });

  it("produção com SWAGGER_ENABLED=true serve as docs", async () => {
    const { app, baseUrl } = await bootDocs("production", "true");

    try {
      const ui = await fetch(`${baseUrl}/docs`);
      const json = await fetch(`${baseUrl}/docs-json`);
      expect(ui.status).toBe(200);
      expect(json.status).toBe(200);
    } finally {
      await app.close();
    }
  });
});
