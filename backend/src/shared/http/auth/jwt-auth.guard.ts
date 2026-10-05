import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_METADATA } from "./roles.decorator";
import {
  AUTH_FORBIDDEN_CODE,
  AUTH_FORBIDDEN_MESSAGE,
  AUTH_UNAUTHENTICATED_CODE,
  AUTH_UNAUTHENTICATED_MESSAGE,
  MAX_TOKEN_LENGTH,
  TOKEN_VERIFIER,
  type TokenVerifier,
  type VerifiedIdentity,
} from "./token-verifier";

/* Guard real do kernel (design decisão 4): substitui o bloqueio honesto nos módulos
   administrativos. Extrai o Bearer do header, verifica via porta e decide por papel
   com negação por padrão. Sem token válido → 401 idêntico; token válido sem o papel
   exigido → 403 idêntico (design decisão 8 — sem distinguir motivo, sem eco).
   O kernel não importa módulos: a verificação vem pela porta `TokenVerifier`. */

type AuthenticatedRequest = {
  headers?: Record<string, string | string[] | undefined>;
  identity?: VerifiedIdentity;
};

const BEARER = /^Bearer\s+(\S+)$/i;

function extractBearerToken(authorization: unknown): string | null {
  if (typeof authorization !== "string") {
    return null;
  }
  const match = BEARER.exec(authorization);
  if (!match) {
    return null;
  }
  const token = match[1]!;
  return token.length > 0 && token.length <= MAX_TOKEN_LENGTH ? token : null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_VERIFIER) private readonly verifier: TokenVerifier,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest | undefined>();
    const token = extractBearerToken(request?.headers?.authorization);
    const identity = token ? await this.verify(token) : null;

    if (!identity) {
      throw new UnauthorizedException({
        code: AUTH_UNAUTHENTICATED_CODE,
        message: AUTH_UNAUTHENTICATED_MESSAGE,
      });
    }
    if (request) {
      request.identity = identity;
    }

    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_METADATA, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    if (
      requiredRoles.length > 0 &&
      !requiredRoles.some((role) => identity.roles.includes(role))
    ) {
      throw new ForbiddenException({
        code: AUTH_FORBIDDEN_CODE,
        message: AUTH_FORBIDDEN_MESSAGE,
      });
    }
    return true;
  }

  /* Falha inesperada do verificador (rede, bug) falha fechado com o mesmo 401 —
     nunca propaga detalhe interno ao cliente. */
  private async verify(token: string): Promise<VerifiedIdentity | null> {
    try {
      return await this.verifier.verify(token);
    } catch {
      return null;
    }
  }
}
