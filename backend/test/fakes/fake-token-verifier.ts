import type { VerifiedIdentity } from "../../src/shared/http/auth/token-verifier";

/* Verificador fake para as suítes dos módulos administrativos: o GUARD é o real,
   apenas a resolução token→identidade é substituída (a cadeia jose+JWKS real é
   coberta pelas suítes de identidade). Tokens fixos e papéis do realm. */
export const TEST_IDENTITIES: Record<string, VerifiedIdentity> = {
  "test-admin": { subject: "u-admin-teste", roles: ["admin"] },
  "test-reception": { subject: "u-reception-teste", roles: ["reception"] },
  "test-noroles": { subject: "u-sem-papel-teste", roles: [] },
};

export const FAKE_TOKEN_VERIFIER = {
  verify: async (token: string): Promise<VerifiedIdentity | null> =>
    TEST_IDENTITIES[token] ?? null,
};

export function bearer(token: keyof typeof TEST_IDENTITIES): {
  authorization: string;
} {
  return { authorization: `Bearer ${token}` };
}
