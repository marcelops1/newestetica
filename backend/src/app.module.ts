import { Module } from "@nestjs/common";
import { HealthController } from "./health/health.controller";
import { SchedulingModule } from "./scheduling/scheduling.module";

@Module({
  imports: [SchedulingModule],
  controllers: [HealthController],
})
export class AppModule {}
