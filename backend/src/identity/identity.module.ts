import { Module } from "@nestjs/common";
import { AuthenticateUseCase } from "./application/use-cases/authenticate.use-case";
import {
  JoseTokenValidator,
  createJoseTokenValidatorFromEnv,
} from "./infrastructure/jose-token.validator";
import { JwtAuthGuard } from "../shared/http/auth/jwt-auth.guard";
import { TOKEN_VERIFIER } from "../shared/http/auth/token-verifier";

export const TOKEN_VALIDATOR = Symbol("TOKEN_VALIDATOR");

/* Módulo de Identidade e Acesso (UC 4.2.1): validação de JWT via JWKS do Keycloak e
   RBAC por papel. Sem controller próprio — não há endpoint de login (o fluxo é do
   Keycloak; o frontend o consome no Épico 5). Exporta a porta `TOKEN_VERIFIER` (a
   implementação é o caso de uso, que depende só da porta do domínio) e o guard do
   kernel para os módulos administrativos. Configuração por ambiente com fail-fast
   (KEYCLOAK_ISSUER/KEYCLOAK_AUDIENCE). */
@Module({
  providers: [
    {
      provide: TOKEN_VALIDATOR,
      useFactory: createJoseTokenValidatorFromEnv,
    },
    {
      provide: AuthenticateUseCase,
      useFactory: (validator: JoseTokenValidator) =>
        new AuthenticateUseCase(validator),
      inject: [TOKEN_VALIDATOR],
    },
    {
      provide: TOKEN_VERIFIER,
      useExisting: AuthenticateUseCase,
    },
    JwtAuthGuard,
  ],
  exports: [TOKEN_VERIFIER, JwtAuthGuard],
})
export class IdentityModule {}
