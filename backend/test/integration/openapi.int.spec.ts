import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { setupSwagger } from "../../src/swagger";
import { testDatabaseUrl } from "./database";

let app: INestApplication;
let baseUrl: string;

beforeAll(async () => {
  process.env.DATABASE_URL = testDatabaseUrl();
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication({ logger: false });
  setupSwagger(app);
  await app.listen(0);
  baseUrl = await app.getUrl();
});

afterAll(async () => {
  await app.close();
});

describe("documentação OpenAPI servida pelo backend", () => {
  it("GET /docs responde 200 com a interface Swagger", async () => {
    const response = await fetch(`${baseUrl}/docs`);

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html.toLowerCase()).toContain("swagger");
  });

  it("GET /docs-json responde 200 com documento OpenAPI 3.x parseável", async () => {
    const response = await fetch(`${baseUrl}/docs-json`);

    expect(response.status).toBe(200);
    const document = (await response.json()) as {
      openapi?: string;
      info?: { title?: string };
    };
    expect(document.openapi).toMatch(/^3\./);
    expect(document.info?.title).toBeTruthy();
  });
});
