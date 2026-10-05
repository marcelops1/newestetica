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
  /* IdentityModule instancia o validador real no bootstrap (env obrigatório). */
  process.env.KEYCLOAK_ISSUER = "http://127.0.0.1:1/realms/test";
  process.env.KEYCLOAK_AUDIENCE = "test-client";
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
  "Pacientes",
  "Atendimento",
  "Financeiro",
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
    statuses: ["201", "401", "403", "422"],
    hasBody: true,
  },
  {
    method: "get",
    path: "/patients",
    statuses: ["200", "401", "403", "422"],
    queryParams: ["limit"],
  },
  {
    method: "get",
    path: "/patients/{id}",
    statuses: ["200", "401", "403", "404", "422"],
    pathParams: ["id"],
  },
  {
    method: "patch",
    path: "/patients/{id}",
    statuses: ["200", "401", "403", "404", "422"],
    pathParams: ["id"],
    hasBody: true,
  },
  {
    method: "delete",
    path: "/patients/{id}",
    statuses: ["204", "401", "403", "404", "422"],
    pathParams: ["id"],
  },
  {
    method: "post",
    path: "/patients/{patientId}/attendances",
    statuses: ["201", "401", "403", "404", "422"],
    pathParams: ["patientId"],
    hasBody: true,
  },
  {
    method: "get",
    path: "/patients/{patientId}/attendances",
    statuses: ["200", "401", "403", "404", "422"],
    pathParams: ["patientId"],
    queryParams: ["limit"],
  },
  {
    method: "get",
    path: "/patients/{patientId}/attendances/{id}",
    statuses: ["200", "401", "403", "404", "422"],
    pathParams: ["patientId", "id"],
  },
  {
    method: "get",
    path: "/finance/summary",
    statuses: ["200", "401", "403", "422"],
    queryParams: ["from", "to"],
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
  security?: Array<Record<string, string[]>>;
};

type OpenApiDocumentWithSecurity = OpenApiDocument & {
  components?: {
    securitySchemes?: Record<string, { type?: string; scheme?: string }>;
  };
};

describe("autenticação real documentada (Pacientes + Atendimento + Financeiro)", () => {
  it("as 9 rotas administrativas documentam 401 e 403 fixos de autenticação real", async () => {
    const document = (await fetchDocument()) as unknown as {
      paths: Record<string, Record<string, OpenApiOperation>>;
    };
    const protectedRoutes = EXPECTED_ROUTES.filter(
      (route) =>
        route.path.startsWith("/patients") || route.path.startsWith("/finance"),
    );
    expect(protectedRoutes).toHaveLength(9);

    for (const route of protectedRoutes) {
      const operation = document.paths[route.path]?.[route.method];
      const label = `${route.method} ${route.path}`;

      const unauthorized = operation?.responses?.["401"];
      expect(unauthorized, `${label} sem resposta 401`).toBeTruthy();
      expect(
        unauthorized?.description ?? "",
        `${label} 401 sem descrição`,
      ).toContain("401 fixo");
      expect(
        unauthorized?.content?.["application/json"]?.schema?.properties?.code
          ?.example,
        `${label} 401 sem o código`,
      ).toBe("AUTH_UNAUTHENTICATED");

      const forbidden = operation?.responses?.["403"];
      expect(forbidden, `${label} sem resposta 403`).toBeTruthy();
      expect(
        forbidden?.description ?? "",
        `${label} 403 sem descrição`,
      ).toContain("403 fixo");
      expect(
        forbidden?.content?.["application/json"]?.schema?.properties?.code
          ?.example,
        `${label} 403 sem o código`,
      ).toBe("AUTH_FORBIDDEN");

      expect(
        operation?.summary ?? "",
        `${label} ainda sugere bloqueio honesto`,
      ).not.toContain("bloqueado");
    }
  });

  it("o documento declara o esquema bearer e as 9 rotas administrativas o exigem", async () => {
    const document = (await fetchDocument()) as unknown as {
      paths: Record<string, Record<string, OpenApiOperation>>;
    } & OpenApiDocumentWithSecurity;

    const schemes = document.components?.securitySchemes ?? {};
    expect(schemes.bearer, "sem esquema bearer declarado").toMatchObject({
      type: "http",
      scheme: "bearer",
    });

    const protectedRoutes = EXPECTED_ROUTES.filter(
      (route) =>
        route.path.startsWith("/patients") || route.path.startsWith("/finance"),
    );
    expect(protectedRoutes).toHaveLength(9);

    for (const route of protectedRoutes) {
      const operation = document.paths[route.path]?.[route.method];
      const label = `${route.method} ${route.path}`;
      expect(
        operation?.security ?? [],
        `${label} não exige o esquema bearer`,
      ).toContainEqual({ bearer: [] });
    }
  });
});

type DocumentWithComponents = OpenApiDocument & {
  components?: {
    schemas?: Record<string, { properties?: Record<string, unknown> }>;
  };
};

const CONTRACT_COMPONENTS: Record<string, string[]> = {
  SlotResponseDto: ["available", "durationMinutes", "id", "start"],
  BookingInputDto: ["name", "notes", "phone", "treatment"],
  ProcedureResponseDto: ["categories", "description", "duration", "id", "name"],
  TestimonialResponseDto: ["author", "context", "id", "quote"],
  PostResponseDto: [
    "category",
    "content",
    "excerpt",
    "id",
    "publishedAt",
    "title",
  ],
  PublicBeforeAfterResponseDto: [
    "goal",
    "hasConsent",
    "id",
    "recovery",
    "sessions",
    "summary",
    "title",
  ],
  PatientInputDto: ["fullName", "phone", "purpose"],
  AttendanceInputDto: ["amountCents", "performedAt", "summary"],
  AttendanceResponseDto: [
    "amountCents",
    "createdAt",
    "id",
    "patientId",
    "performedAt",
    "summary",
    "updatedAt",
  ],
  PatientResponseDto: [
    "createdAt",
    "fullName",
    "id",
    "phone",
    "purpose",
    "status",
    "updatedAt",
  ],
  PatientUpdateDto: ["fullName", "phone", "purpose"],
  FinanceSummaryResponseDto: ["count", "currency", "from", "to", "totalCents"],
};

describe("fidelidade dos componentes ao contrato (sem duplicação manual)", () => {
  it("cada componente gerado tem exatamente os campos do contrato, sem omissão nem acréscimo", async () => {
    const response = await fetch(`${baseUrl}/docs-json`);
    const document = (await response.json()) as DocumentWithComponents;
    const schemas = document.components?.schemas ?? {};

    for (const [name, fields] of Object.entries(CONTRACT_COMPONENTS)) {
      const component = schemas[name];
      expect(component, `componente ${name} ausente no schema`).toBeTruthy();
      expect(
        Object.keys(component?.properties ?? {}).sort(),
        `campos do componente ${name}`,
      ).toEqual([...fields].sort());
    }
  });

  it("nenhum componente interno vaza para o wire público", async () => {
    const response = await fetch(`${baseUrl}/docs-json`);
    const document = (await response.json()) as DocumentWithComponents;
    const patientResponse = document.components?.schemas?.PatientResponseDto;
    expect(
      Object.keys(patientResponse?.properties ?? {}),
      "anonymizedAt é detalhe de persistência e não pode aparecer",
    ).not.toContain("anonymizedAt");
  });
});

describe("cobertura total das rotas implementadas", () => {
  it("documenta exatamente as 18 rotas (nenhuma ausente, nenhuma fantasma)", async () => {
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
