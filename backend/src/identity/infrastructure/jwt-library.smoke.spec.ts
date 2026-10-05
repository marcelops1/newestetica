import { describe, expect, it } from "vitest";
import {
  SignJWT,
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  jwtVerify,
} from "jose";

/* Fumaça da decisão 1 do design: a biblioteca JWT escolhida precisa funcionar sob o
   backend CommonJS/Node 24 (require(esm)) e expor as primitivas que o validador usa —
   assinatura/verificação, chaves locais e par de chaves para os testes. */
describe("biblioteca JWT (jose) disponível e utilizável no backend", () => {
  it("expõe as primitivas de emissão/verificação e de chave que o validador usa", async () => {
    expect(typeof SignJWT).toBe("function");
    expect(typeof jwtVerify).toBe("function");
    expect(typeof createLocalJWKSet).toBe("function");
    expect(typeof generateKeyPair).toBe("function");
    expect(typeof exportJWK).toBe("function");

    /* Round-trip mínimo: prova que a lib funciona de verdade sob o runtime do backend. */
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    const jwks = createLocalJWKSet({
      keys: [{ ...(await exportJWK(publicKey)), kid: "smoke", alg: "RS256" }],
    });
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "RS256", kid: "smoke" })
      .setIssuer("https://issuer.fake/realms/test")
      .setAudience("test-client")
      .setExpirationTime("5m")
      .sign(privateKey);

    const { payload } = await jwtVerify(token, jwks, {
      issuer: "https://issuer.fake/realms/test",
      audience: "test-client",
      algorithms: ["RS256"],
    });

    expect(payload.role).toBe("admin");
  });
});
