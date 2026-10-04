import { Controller, Get, Module, UseGuards } from "@nestjs/common";
import { IdentityModule } from "../../src/identity/identity.module";
import { JwtAuthGuard } from "../../src/shared/http/auth/jwt-auth.guard";
import { Roles } from "../../src/shared/http/auth/roles.decorator";

/* Sonda reutilizável da fronteira de autenticação (suítes de guard e de ataques):
   módulo isolado com uma rota sem papel declarado (só autenticação) e uma rota
   admin, sob o guard real do kernel. */

@Controller("probe")
@UseGuards(JwtAuthGuard)
export class ProbeController {
  @Get("authenticated")
  authenticated(): { ok: string } {
    return { ok: "authenticated" };
  }

  @Get("admin")
  @Roles("admin")
  adminOnly(): { ok: string } {
    return { ok: "admin" };
  }
}

@Module({ imports: [IdentityModule], controllers: [ProbeController] })
export class ProbeModule {}
