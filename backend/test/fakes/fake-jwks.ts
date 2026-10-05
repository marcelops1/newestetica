import { createServer, type Server } from "node:http";
import { SignJWT, exportJWK, generateKeyPair, type JWK } from "jose";

/* JWKS fake local (design decisão 3): chaves de verdade geradas em memória (RSA para
   o caso legítimo, EC para o ataque de allowlist de algoritmo), servidas num HTTP
   local — os testes de validação/guarda usam tokens assinados de verdade contra este
   JWKS, sem Keycloak no ar. Conta requisições para provar cache (sem fetch por
   requisição) e permite rotação de chave e "queda" do servidor. */

export type FakeJwksKey = {
  kid: string;
  alg: string;
  privateKey: Awaited<ReturnType<typeof generateKeyPair>>["privateKey"];
  publicJwk: JWK;
};

export type FakeJwks = {
  issuer: string;
  audience: string;
  jwksUrl: string;
  requestCount(): number;
  currentKey(): FakeJwksKey;
  addKey(alg: string): Promise<FakeJwksKey>;
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
      secret?: Uint8Array;
    },
  ) => Promise<string>;
  noSignatureToken: (claims: Record<string, unknown>) => string;
  close: () => Promise<void>;
};

async function generateKey(kid: string, alg: string): Promise<FakeJwksKey> {
  const { privateKey, publicKey } = await generateKeyPair(alg);
  const publicJwk = await exportJWK(publicKey);
  return { kid, alg, privateKey, publicJwk };
}

export async function startFakeJwks(options?: {
  audience?: string;
}): Promise<FakeJwks> {
  const audience = options?.audience ?? "newestetica-frontend";
  let keys: FakeJwksKey[] = [await generateKey("key-1", "RS256")];
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
        alg: key.alg,
        use: "sig",
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
    async addKey(alg) {
      const added = await generateKey(`attacker-${keys.length + 1}`, alg);
      keys = [...keys, added];
      return added;
    },
    async rotate() {
      const rotated = await generateKey(`key-${keys.length + 1}`, "RS256");
      keys = [rotated];
      return rotated;
    },
    respond(up) {
      responding = up;
    },
    async sign(claims, signOptions = {}) {
      const key = signOptions.key ?? keys[0]!;
      const alg = signOptions.alg ?? key.alg;
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
      return builder.sign(signOptions.secret ?? key.privateKey);
    },
    noSignatureToken(claims) {
      const header = Buffer.from(
        JSON.stringify({ alg: "none", typ: "JWT" }),
      ).toString("base64url");
      const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
      return `${header}.${body}.`;
    },
    async close() {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    },
  };
}
