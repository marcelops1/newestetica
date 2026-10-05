import { isKnownRole, type Role } from "./roles";

/* Identidade autenticada no vocabulário do domínio: sujeito (sub do token) e papéis
   conhecidos do realm. Sem framework, sem HTTP — mapeamento puro. */
export type AuthenticatedIdentity = {
  subject: string;
  roles: readonly Role[];
};

/* O núcleo não confia no token nem no chamador: claims malformadas (sem `sub`, tipo
   errado, nulo) viram nulo — uma única falha de autenticação — nunca TypeError.
   Papéis vêm de `realm_access.roles` (formato do Keycloak); desconhecidos são
   filtrados e duplicados colapsados. */
export function fromTokenClaims(raw: unknown): AuthenticatedIdentity | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }
  const claims = raw as Record<string, unknown>;
  const subject = claims.sub;
  if (typeof subject !== "string" || subject.trim().length === 0) {
    return null;
  }
  return { subject, roles: extractRoles(claims.realm_access) };
}

function extractRoles(realmAccess: unknown): Role[] {
  if (
    typeof realmAccess !== "object" ||
    realmAccess === null ||
    Array.isArray(realmAccess)
  ) {
    return [];
  }
  const rawRoles = (realmAccess as Record<string, unknown>).roles;
  if (!Array.isArray(rawRoles)) {
    return [];
  }
  const roles: Role[] = [];
  for (const role of rawRoles) {
    if (isKnownRole(role) && !roles.includes(role)) {
      roles.push(role);
    }
  }
  return roles;
}
