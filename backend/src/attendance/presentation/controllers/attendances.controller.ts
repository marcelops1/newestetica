import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import {
  AttendanceInputSchema,
  AttendanceSchema,
  type Attendance as AttendanceResponse,
} from "@newestetica/contracts";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { CreateAttendanceUseCase } from "../../application/use-cases/create-attendance.use-case";
import { GetAttendanceByIdUseCase } from "../../application/use-cases/get-attendance-by-id.use-case";
import {
  ListAttendancesUseCase,
  MAX_ATTENDANCES_LIMIT,
} from "../../application/use-cases/list-attendances.use-case";
import type { Attendance } from "../../domain/entities/attendance.entity";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";
import {
  AUTH_401_DESCRIPTION,
  AUTH_401_SCHEMA,
  AUTH_403_DESCRIPTION,
  AUTH_403_SCHEMA,
} from "../../../shared/http/auth/auth-swagger";
import { Roles } from "../../../shared/http/auth/roles.decorator";
import { JwtAuthGuard } from "../../../shared/http/auth/jwt-auth.guard";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";

class AttendanceInputDto extends createZodDto(AttendanceInputSchema) {}
class AttendanceResponseDto extends createZodDto(AttendanceSchema) {}

const IdSchema = z.string().min(1).max(200);

/* Exportado para o teste de acoplamento: o teto do schema É o teto do núcleo
   (`MAX_ATTENDANCES_LIMIT`) — nunca um literal duplicado. */
export const ListAttendancesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_ATTENDANCES_LIMIT).optional(),
});

type AttendanceListResponse = AttendanceResponse[];
type AttendanceItemResponse = AttendanceResponse;

/* Allowlist explícita do contrato: a entidade nunca cruza o wire; timestamps viram
   ISO string e nenhum campo interno (nome de paciente, por exemplo) entra. O tipo de
   retorno é o do próprio contrato — divergência reprova no typecheck e no teste. */
function toResponse(attendance: Attendance): AttendanceItemResponse {
  return {
    id: attendance.id,
    patientId: attendance.patientId,
    summary: attendance.summary,
    amountCents: attendance.amountCents,
    performedAt: attendance.performedAt.toISOString(),
    createdAt: attendance.createdAt.toISOString(),
    updatedAt: attendance.updatedAt.toISOString(),
  };
}

/* Autenticação real (UC 4.2.1): guard do kernel — sem token válido 401, papel
   insuficiente 403 — e RBAC operacional: `admin` e `reception` (dia a dia da
   recepção registra e consulta o histórico). */
@ApiTags("Atendimento")
@ApiBearerAuth()
@Controller("patients/:patientId/attendances")
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class AttendancesController {
  constructor(
    private readonly createAttendance: CreateAttendanceUseCase,
    private readonly listAttendances: ListAttendancesUseCase,
    private readonly getAttendanceById: GetAttendanceByIdUseCase,
  ) {}

  @Post()
  @Roles("admin", "reception")
  @ApiOperation({ summary: "Registra um atendimento" })
  @ApiParam({ name: "patientId", description: "Identificador da paciente." })
  @ApiUnauthorizedResponse({
    description: AUTH_401_DESCRIPTION,
    schema: AUTH_401_SCHEMA,
  })
  @ApiForbiddenResponse({
    description: AUTH_403_DESCRIPTION,
    schema: AUTH_403_SCHEMA,
  })
  @ApiCreatedResponse({
    description: "Atendimento registrado.",
    type: AttendanceResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Paciente não encontrada (inexistente ou anonimizada).",
  })
  @ApiUnprocessableEntityResponse({ description: "Dados inválidos." })
  async create(
    @Param("patientId", new ZodValidationPipe(IdSchema)) patientId: string,
    @Body(new ZodValidationPipe(AttendanceInputSchema))
    input: AttendanceInputDto,
  ): Promise<AttendanceItemResponse> {
    const attendance = await this.createAttendance.execute({
      patientId,
      ...input,
    });
    return toResponse(attendance);
  }

  @Get()
  @Roles("admin", "reception")
  @ApiOperation({ summary: "Lista o histórico da paciente" })
  @ApiParam({ name: "patientId", description: "Identificador da paciente." })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Limite de itens (padrão 100, máximo 500).",
    schema: { type: "integer", minimum: 1, maximum: 500 },
  })
  @ApiUnauthorizedResponse({
    description: AUTH_401_DESCRIPTION,
    schema: AUTH_401_SCHEMA,
  })
  @ApiForbiddenResponse({
    description: AUTH_403_DESCRIPTION,
    schema: AUTH_403_SCHEMA,
  })
  @ApiOkResponse({
    description:
      "Histórico operacional da paciente (anonimizada nunca aparece).",
    type: AttendanceResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: "Paciente não encontrada (inexistente ou anonimizada).",
  })
  @ApiUnprocessableEntityResponse({ description: "Limite inválido." })
  async list(
    @Param("patientId", new ZodValidationPipe(IdSchema)) patientId: string,
    @Query(new ZodValidationPipe(ListAttendancesQuerySchema))
    query: { limit?: number },
  ): Promise<AttendanceListResponse> {
    const attendances = await this.listAttendances.execute({
      patientId,
      ...query,
    });
    return attendances.map(toResponse);
  }

  @Get(":id")
  @Roles("admin", "reception")
  @ApiOperation({ summary: "Consulta um atendimento pelo id" })
  @ApiParam({ name: "patientId", description: "Identificador da paciente." })
  @ApiParam({ name: "id", description: "Identificador do atendimento." })
  @ApiUnauthorizedResponse({
    description: AUTH_401_DESCRIPTION,
    schema: AUTH_401_SCHEMA,
  })
  @ApiForbiddenResponse({
    description: AUTH_403_DESCRIPTION,
    schema: AUTH_403_SCHEMA,
  })
  @ApiOkResponse({ description: "Atendimento.", type: AttendanceResponseDto })
  @ApiNotFoundResponse({
    description:
      "Não encontrado (inexistente, anonimizado ou de outra paciente, sem distinção).",
  })
  @ApiUnprocessableEntityResponse({ description: "Id inválido." })
  async byId(
    @Param("patientId", new ZodValidationPipe(IdSchema)) patientId: string,
    @Param("id", new ZodValidationPipe(IdSchema)) id: string,
  ): Promise<AttendanceItemResponse> {
    const attendance = await this.getAttendanceById.execute(patientId, id);
    return toResponse(attendance);
  }
}
