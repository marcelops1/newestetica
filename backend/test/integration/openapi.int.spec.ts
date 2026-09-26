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

type Operation = {
  summary?: string;
  tags?: string[];
  parameters?: Array<{ name: string; in: string }>;
  requestBody?: unknown;
  responses?: Record<string, unknown>;
};

type OpenApiDocument = {
  paths: Record<string, Record<string, Operation>>;
};

const API_TAGS = [
  "Agendamento",
  "Catálogo",
  "Conteúdo Público",
  "Pacientes (bloqueado até a Identidade)",
  "Health",
];

const EXPECTED_ROUTES: Array<{
  method: string;
  path: string;
  statuses: string[];
  pathParams?: string[];
  queryParams?: string[];
  hasBody?: boolean;
}> = [
  { method: "get", path: "/health", statuses: ["200"] },
  { method: "get", path: "/slots/available", statuses: ["200"] },
  {
    method: "post",
    path: "/slots/{slotId}/bookings",
    statuses: ["201", "404", "409", "422"],
    pathParams: ["slotId"],
    hasBody: true,
  },
  {
    method: "get",
    path: "/procedures",
    statuses: ["200", "422"],
    queryParams: ["category"],
  },
  {
    method: "get",
    path: "/procedures/{slug}",
    statuses: ["200", "404", "422"],
    pathParams: ["slug"],
  },
  { method: "get", path: "/testimonials", statuses: ["200"] },
  { method: "get", path: "/posts", statuses: ["200"] },
  {
    method: "get",
    path: "/posts/{slug}",
    statuses: ["200", "404", "422"],
    pathParams: ["slug"],
  },
  { method: "get", path: "/before-after", statuses: ["200"] },
  {
    method: "post",
    path: "/patients",
    statuses: ["201", "403", "422"],
    hasBody: true,
  },
  {
    method: "get",
    path: "/patients",
    statuses: ["200", "403", "422"],
    queryParams: ["limit"],
  },
  {
    method: "get",
    path: "/patients/{id}",
    statuses: ["200", "403", "404", "422"],
    pathParams: ["id"],
  },
  {
    method: "patch",
    path: "/patients/{id}",
    statuses: ["200", "403", "404", "422"],
    pathParams: ["id"],
    hasBody: true,
  },
  {
    method: "delete",
    path: "/patients/{id}",
    statuses: ["204", "403", "404", "422"],
    pathParams: ["id"],
  },
];

async function fetchDocument(): Promise<OpenApiDocument> {
  const response = await fetch(`${baseUrl}/docs-json`);
  return (await response.json()) as OpenApiDocument;
}

type OpenApiOperation = Operation & {
  responses?: Record<
    string,
    {
      description?: string;
      content?: Record<
        string,
        { schema?: { properties?: Record<string, { example?: unknown }> } }
      >;
    }
  >;
};

describe("bloqueio de Pacientes explícito na documentação", () => {
  it("as 5 rotas de Pacientes documentam o 403 honesto (guard + UC 4.2.1)", async () => {
    const document = (await fetchDocument()) as unknown as {
      paths: Record<string, Record<string, OpenApiOperation>>;
    };
    const patientRoutes = EXPECTED_ROUTES.filter((route) =>
      route.path.startsWith("/patients"),
    );
    expect(patientRoutes).toHaveLength(5);

    for (const route of patientRoutes) {
      const operation = document.paths[route.path]?.[route.method];
      const label = `${route.method} ${route.path}`;
      const forbidden = operation?.responses?.["403"];
      expect(forbidden, `${label} sem resposta 403`).toBeTruthy();
      const description = forbidden?.description ?? "";
      expect(description, `${label} 403 sem o guard`).toContain(
        "IdentityPendingGuard",
      );
      expect(description, `${label} 403 sem o UC`).toContain("UC 4.2.1");
      const code =
        forbidden?.content?.["application/json"]?.schema?.properties?.code
          ?.example;
      expect(code, `${label} 403 sem o código`).toBe("AUTH_NOT_IMPLEMENTED");
      expect(operation?.summary ?? "", `${label} sugere acesso livre`).toContain(
        "bloqueado",
      );
    }
  });
});

describe("cobertura total das rotas implementadas", () => {
  it("documenta exatamente as 14 rotas (nenhuma ausente, nenhuma fantasma)", async () => {
    const document = await fetchDocument();
    const actual = Object.entries(document.paths)
      .flatMap(([path, methods]) =>
        Object.keys(methods).map((method) => `${method} ${path}`),
      )
      .sort();
    const expected = EXPECTED_ROUTES.map(
      (route) => `${route.method} ${route.path}`,
    ).sort();

    expect(actual).toEqual(expected);
  });

  it("cada operação tem resumo, tag de módulo e as respostas reais", async () => {
    const document = await fetchDocument();

    for (const route of EXPECTED_ROUTES) {
      const operation = document.paths[route.path]?.[route.method];
      const label = `${route.method} ${route.path}`;
      expect(operation, `${label} ausente`).toBeTruthy();
      if (!operation) {
        continue;
      }

      expect(operation.summary, `${label} sem resumo`).toBeTruthy();
      expect(
        (operation.tags ?? []).some((tag) => API_TAGS.includes(tag)),
        `${label} sem tag de módulo`,
      ).toBe(true);

      for (const status of route.statuses) {
        expect(
          operation.responses?.[status],
          `${label} sem resposta ${status}`,
        ).toBeTruthy();
      }

      for (const param of route.pathParams ?? []) {
        expect(
          (operation.parameters ?? []).some(
            (item) => item.name === param && item.in === "path",
          ),
          `${label} sem parâmetro de path ${param}`,
        ).toBe(true);
      }

      for (const param of route.queryParams ?? []) {
        expect(
          (operation.parameters ?? []).some(
            (item) => item.name === param && item.in === "query",
          ),
          `${label} sem parâmetro de query ${param}`,
        ).toBe(true);
      }

      if (route.hasBody) {
        expect(operation.requestBody, `${label} sem requestBody`).toBeTruthy();
      }
    }
  });
});
