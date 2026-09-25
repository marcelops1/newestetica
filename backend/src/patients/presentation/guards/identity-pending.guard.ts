import {
  ForbiddenException,
  Injectable,
  type CanActivate,
} from "@nestjs/common";

/* Bloqueio honesto até a Identidade (design decisão 8): nega TODAS as requisições com
   403 e declara a verdade — não simula autenticação nem finge um token. Quando a
   Identidade existir (UC 4.2.1), este guard é SUBSTITUÍDO pelo guard real de
   Keycloak/RBAC; a troca é próximo passo obrigatório, não implícito. */
export const AUTH_NOT_IMPLEMENTED_CODE = "AUTH_NOT_IMPLEMENTED";
export const AUTH_NOT_IMPLEMENTED_MESSAGE =
  "Autenticação ainda não implementada para este módulo — aguardando Identidade e Acesso (UC 4.2.1)";

@Injectable()
export class IdentityPendingGuard implements CanActivate {
  canActivate(): boolean {
    throw new ForbiddenException({
      code: AUTH_NOT_IMPLEMENTED_CODE,
      message: AUTH_NOT_IMPLEMENTED_MESSAGE,
    });
  }
}
