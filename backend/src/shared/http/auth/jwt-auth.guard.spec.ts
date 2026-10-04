import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it } from "vitest";
import type { VerifiedIdentity } from "./token-verifier";
import { ROLES_METADATA, Roles } from "./roles.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

/* Guard real do kernel (design decisões 2 e 8): sem token válido → 401 idêntico;
   token válido sem papel exigido → 403 idêntico; rota sem papel declarado só exige
   autenticação. O teste usa um fake do verificador (a validação de verdade é
   coberta contra o JWKS fake na suíte de integração). */

const ADMIN: VerifiedIdentity = { subject: "u-admin", roles: ["admin"] };
const RECEPTION: VerifiedIdentity = {
  subject: "u-reception",
  roles: ["reception"],
};
const NOROLES: VerifiedIdentity = { subject: "u-noroles", roles: [] };

function makeGuard(
  verify: (token: string) => Promise<VerifiedIdentity | null>,
): { guard: JwtAuthGuard; calls: string[] } {
  const calls: string[] = [];
  const verifier = {
    verify: (token: string) => {
      calls.push(token);
      return verify(token);
    },
  };
  return { guard: new JwtAuthGuard(verifier, new Reflector()), calls };
}

function makeContext(
  headers: Record<string, string | string[] | undefined>,
  options: { roles?: string[]; onClass?: boolean } = {},
): { context: ExecutionContext; request: Record<string, unknown> } {
  const request: Record<string, unknown> = { headers };
  const handler = function handler() {};
  const controller = class Controller {};
  if (options.roles) {
    Reflect.defineMetadata(
      ROLES_METADATA,
      options.roles,
      options.onClass ? controller : handler,
    );
  }
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => handler,
    getClass: () => controller,
  } as unknown as ExecutionContext;
  return { context, request };
}

describe("JwtAuthGuard (kernel)", () => {
  it("sem header Authorization responde 401 fixo, sem eco", async () => {
    const { guard, calls } = makeGuard(async () => ADMIN);
    const { context } = makeContext({});

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: 401,
      response: {
        code: "AUTH_UNAUTHENTICATED",
        message: "Autenticação necessária.",
      },
    });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(calls).toHaveLength(0);
  });

  it("header malformado ou de outro esquema responde o MESMO 401 sem chamar o verificador", async () => {
    const { guard, calls } = makeGuard(async () => ADMIN);

    for (const authorization of [
      "Basic dXNlcjpwYXNz",
      "Bearer",
      "Bearer   ",
      "Bearer token extra",
      ["Bearer a", "Bearer b"] as unknown as string,
    ]) {
      const { context } = makeContext({ authorization });
      await expect(
        guard.canActivate(context),
        `header hostil: ${JSON.stringify(authorization)}`,
      ).rejects.toMatchObject({ status: 401 });
    }
    expect(calls).toHaveLength(0);
  });

  it("token gigante responde 401 sem chamar o verificador (teto anti-DoS)", async () => {
    const { guard, calls } = makeGuard(async () => ADMIN);
    const { context } = makeContext({
      authorization: `Bearer ${"x".repeat(8_193)}`,
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: 401,
    });
    expect(calls).toHaveLength(0);
  });

  it("token recusado pelo verificador responde 401 fixo", async () => {
    const { guard, calls } = makeGuard(async () => null);
    const { context } = makeContext({ authorization: "Bearer token-ruim" });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: 401,
      response: {
        code: "AUTH_UNAUTHENTICATED",
        message: "Autenticação necessária.",
      },
    });
    expect(calls).toEqual(["token-ruim"]);
  });

  it("falha inesperada do verificador (infra) falha fechado com 401, sem vazar erro", async () => {
    const { guard } = makeGuard(async () => {
      throw new Error("JWKS fora do ar com detalhe interno");
    });
    const { context } = makeContext({ authorization: "Bearer token" });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: 401,
      response: {
        code: "AUTH_UNAUTHENTICATED",
        message: "Autenticação necessária.",
      },
    });
  });

  it("token válido em rota sem papel declarado passa e anexa a identidade à requisição", async () => {
    const { guard } = makeGuard(async () => RECEPTION);
    const { context, request } = makeContext({
      authorization: "Bearer token-bom",
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.identity).toEqual(RECEPTION);
  });

  it("papel ausente e papel insuficiente respondem o MESMO 403, sem expor dado", async () => {
    const { guard } = makeGuard(async (token) =>
      token === "reception" ? RECEPTION : NOROLES,
    );

    const forbiddenBodies: unknown[] = [];
    for (const token of ["noroles", "reception"]) {
      const { context } = makeContext(
        { authorization: `Bearer ${token}` },
        { roles: ["admin"] },
      );
      try {
        await guard.canActivate(context);
        throw new Error("deveria ter negado");
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        const forbidden = error as ForbiddenException;
        expect(forbidden.getStatus()).toBe(403);
        forbiddenBodies.push(forbidden.getResponse());
      }
    }

    expect(forbiddenBodies[0]).toEqual(forbiddenBodies[1]);
    expect(forbiddenBodies[0]).toEqual({
      code: "AUTH_FORBIDDEN",
      message: "Acesso negado.",
    });
  });

  it("papel exigido presente passa; papel exigido no nível da classe também vale", async () => {
    const { guard } = makeGuard(async () => ADMIN);

    const handlerScoped = makeContext(
      { authorization: "Bearer token-bom" },
      { roles: ["admin"] },
    );
    await expect(guard.canActivate(handlerScoped.context)).resolves.toBe(true);

    const classScoped = makeContext(
      { authorization: "Bearer token-bom" },
      { roles: ["admin"], onClass: true },
    );
    await expect(guard.canActivate(classScoped.context)).resolves.toBe(true);
  });

  it("o decorator @Roles registra os papéis esperados via metadata", () => {
    const handler = function handler() {};
    Roles("admin", "reception")(handler as never);
    expect(Reflect.getMetadata(ROLES_METADATA, handler)).toEqual([
      "admin",
      "reception",
    ]);
  });
});
