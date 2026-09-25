import { Module } from "@nestjs/common";
import { CatalogModule } from "./catalog/catalog.module";
import { ContentModule } from "./content/content.module";
import { HealthController } from "./health/health.controller";
import { PatientsModule } from "./patients/patients.module";
import { SchedulingModule } from "./scheduling/scheduling.module";

@Module({
  imports: [SchedulingModule, CatalogModule, ContentModule, PatientsModule],
  controllers: [HealthController],
})
export class AppModule {}
