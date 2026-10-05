/* Papéis do realm Newestetica (docs/security/03-seguranca.md §3): vocabulário fechado
   desta fatia. Papel fora do vocabulário nunca vira autorização — é filtrado no
   mapeamento de claims (negação por padrão). */
export const REALM_ROLES = ["admin", "reception"] as const;

export type Role = (typeof REALM_ROLES)[number];

const KNOWN_ROLES: ReadonlySet<string> = new Set(REALM_ROLES);

export function isKnownRole(value: unknown): value is Role {
  return typeof value === "string" && KNOWN_ROLES.has(value);
}
