import { createServer, type Server } from "node:http";
import {
  SignJWT,
  exportJWK,
  generateKeyPair,
  type JWK,
} from "jose";

/* JWKS fake local (design decisão 3): chaves RSA de verdade geradas em memória,
   servidas num HTTP local — os testes de validação/guarda usam tokens assinados de
   verdade contra este JWKS, sem Keycloak no ar. Conta requisições para provar cache
   (sem fetch por requisição) e permite rotação de chave e "queda" do servidor. */

export type FakeJwksKey = {
  kid: string;
  privateKey: Awaited<ReturnType<typeof generateKeyPair>>["privateKey"];
  publicJwk: JWK;
};

export type FakeJwks = {
  issuer: string;
  audience: string;
  jwksUrl: string;
  requestCount(): number;
  currentKey(): FakeJwksKey;
  rotate(): Promise<FakeJwksKey>;
  respond: (up: boolean) => void;
  sign: (
    claims: Record<string, unknown>,
    options?: {
      key?: FakeJwksKey;
      alg?: string;
      kid?: string | null;
      issuer?: string;
      audience?: string;
      expiresIn?: string | number;
      notBefore?: string | number;
      noSignature?: boolean;
    },
  ) => Promise<string>;
  close: () => Promise<void>;
};

async function generateKey(kid: string): Promise<FakeJwksKey> {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  return { kid, privateKey, publicJwk };
}

export async function startFakeJwks(options?: {
  audience?: string;
}): Promise<FakeJwks> {
  const audience = options?.audience ?? "newestetica-frontend";
  let keys: FakeJwksKey[] = [await generateKey("key-1")];
  let requests = 0;
  let responding = true;

  const server: Server = createServer((request, response) => {
    if (request.url !== "/protocol/openid-connect/certs") {
      response.writeHead(404).end();
      return;
    }
    if (!responding) {
      response.writeHead(503).end();
      return;
    }
    requests += 1;
    const body = JSON.stringify({
      keys: keys.map((key) => ({
        ...key.publicJwk,
        kid: key.kid,
        alg: "RS256",
        use: "sig",
        kty: "RSA",
      })),
    });
    response.writeHead(200, { "content-type": "application/json" }).end(body);
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("fake JWKS sem porta");
  }
  const base = `http://127.0.0.1:${address.port}`;
  const issuer = `${base}/realms/newestetica-fake`;

  return {
    issuer,
    audience,
    jwksUrl: `${base}/protocol/openid-connect/certs`,
    requestCount: () => requests,
    currentKey: () => keys[keys.length - 1]!,
    async rotate() {
      const rotated = await generateKey(`key-${keys.length + 1}`);
      keys = [rotated];
      return rotated;
    },
    respond(up) {
      responding = up;
    },
    async sign(claims, signOptions = {}) {
      const key = signOptions.key ?? keys[keys.length - 1]!;
      const alg = signOptions.alg ?? "RS256";
      let builder = new SignJWT(claims).setProtectedHeader({
        alg,
        ...(signOptions.kid === null
          ? {}
          : { kid: signOptions.kid ?? key.kid }),
      });
      builder = builder
        .setIssuer(signOptions.issuer ?? issuer)
        .setAudience(signOptions.audience ?? audience)
        .setExpirationTime(signOptions.expiresIn ?? "5m");
      if (signOptions.notBefore !== undefined) {
        builder = builder.setNotBefore(signOptions.notBefore);
      }
      if (signOptions.noSignature) {
        /* Token "alg: none": header sem assinatura real. */
        const header = Buffer.from(
          JSON.stringify({ alg: "none", typ: "JWT" }),
        ).toString("base64url");
        const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
        return `${header}.${body}.`;
      }
      return builder.sign(key.privateKey);
    },
    async close() {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    },
  };
}
