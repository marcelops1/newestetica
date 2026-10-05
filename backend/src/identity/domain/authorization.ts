import type { AuthenticatedIdentity } from "./claims";

/* Política pura de autorização (design decisão 2): negação por padrão. Rota sem
   papel declarado exige apenas identidade autenticada; com papel declarado, basta a
   interseção. Quem decide o status (403) e o corpo fixo é a fronteira (guard);
   aqui só existe a decisão. */
export function isAuthorized(
  identity: AuthenticatedIdentity,
  requiredRoles: readonly string[],
): boolean {
  if (requiredRoles.length === 0) {
    return true;
  }
  return requiredRoles.some((role) =>
    (identity.roles as readonly string[]).includes(role),
  );
}
