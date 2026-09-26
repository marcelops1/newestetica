import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller()
export class HealthController {
  @Get("health")
  @ApiOperation({ summary: "Verifica se o backend está no ar" })
  @ApiOkResponse({
    description: "Backend saudável.",
    schema: {
      type: "object",
      properties: { status: { type: "string", example: "ok" } },
    },
  })
  health(): { status: string } {
    return { status: "ok" };
  }
}
