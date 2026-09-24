import { Module } from "@nestjs/common";
import { CatalogModule } from "./catalog/catalog.module";
import { ContentModule } from "./content/content.module";
import { HealthController } from "./health/health.controller";
import { SchedulingModule } from "./scheduling/scheduling.module";

@Module({
  imports: [SchedulingModule, CatalogModule, ContentModule],
  controllers: [HealthController],
})
export class AppModule {}
