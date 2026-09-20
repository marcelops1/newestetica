import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { SchedulingModule } from "./scheduling/scheduling.module";

@Module({
  imports: [SchedulingModule],
  controllers: [AppController],
})
export class AppModule {}
