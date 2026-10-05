import { SetMetadata } from "@nestjs/common";

/* Decorator de papéis do guard do kernel (design decisão 2): a rota declara os
   papéis aceitos; sem declaração, o guard exige apenas autenticação (negação por
   padrão no nível de autorização — nada é público por esquecimento). */
export const ROLES_METADATA = "auth:required-roles";

export const Roles = (...roles: string[]) => SetMetadata(ROLES_METADATA, roles);
