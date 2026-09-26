import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./swagger";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
