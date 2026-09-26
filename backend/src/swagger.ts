import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

/* Gate por ambiente (docs/security/03-seguranca.md §8): fora de produção as docs são
   servidas por padrão; em produção, só com SWAGGER_ENABLED=true. */
export function isSwaggerEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.NODE_ENV !== "production") {
    return true;
  }
  return env.SWAGGER_ENABLED === "true";
}

export function setupSwagger(app: INestApplication): void {
  if (!isSwaggerEnabled()) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle("Newestetica API")
    .setDescription(
      "API do sistema da clínica — reflete somente os módulos implementados até agora. " +
        "As rotas de Pacientes e de Atendimento estão bloqueadas pelo IdentityPendingGuard até o módulo de Identidade.",
    )
    .setVersion("0.1.0")
    .addTag("Agendamento")
    .addTag("Catálogo")
    .addTag("Conteúdo Público")
    .addTag("Pacientes (bloqueado até a Identidade)")
    .addTag("Atendimento (bloqueado até a Identidade)")
    .addTag("Health")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  /* Serve /docs (UI) e /docs-json (schema) — o sufixo JSON é padrão do módulo. */
  SwaggerModule.setup("docs", app, document);
}
