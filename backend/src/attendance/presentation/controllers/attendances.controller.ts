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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
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
  AUTH_NOT_IMPLEMENTED_CODE,
  AUTH_NOT_IMPLEMENTED_MESSAGE,
  IdentityPendingGuard,
} from "../../../shared/http/identity-pending.guard";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";

class AttendanceInputDto extends createZodDto(AttendanceInputSchema) {}
class AttendanceResponseDto extends createZodDto(AttendanceSchema) {}

const FORBIDDEN_DESCRIPTION =
  "Bloqueado pelo IdentityPendingGuard: autenticação ainda não implementada para este módulo (UC 4.2.1).";
const FORBIDDEN_SCHEMA = {
  type: "object",
  properties: {
    code: { type: "string", example: AUTH_NOT_IMPLEMENTED_CODE },
    message: { type: "string", example: AUTH_NOT_IMPLEMENTED_MESSAGE },
  },
};

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
    performedAt: attendance.performedAt.toISOString(),
    createdAt: attendance.createdAt.toISOString(),
    updatedAt: attendance.updatedAt.toISOString(),
  };
}

@ApiTags("Atendimento (bloqueado até a Identidade)")
@Controller("patients/:patientId/attendances")
@UseGuards(IdentityPendingGuard)
@UseFilters(DomainExceptionFilter)
export class AttendancesController {
  constructor(
    private readonly createAttendance: CreateAttendanceUseCase,
    private readonly listAttendances: ListAttendancesUseCase,
    private readonly getAttendanceById: GetAttendanceByIdUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Registra um atendimento (bloqueado até a Identidade)",
  })
  @ApiParam({ name: "patientId", description: "Identificador da paciente." })
  @ApiForbiddenResponse({
    description: FORBIDDEN_DESCRIPTION,
    schema: FORBIDDEN_SCHEMA,
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
  @ApiOperation({
    summary: "Lista o histórico da paciente (bloqueado até a Identidade)",
  })
  @ApiParam({ name: "patientId", description: "Identificador da paciente." })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Limite de itens (padrão 100, máximo 500).",
    schema: { type: "integer", minimum: 1, maximum: 500 },
  })
  @ApiForbiddenResponse({
    description: FORBIDDEN_DESCRIPTION,
    schema: FORBIDDEN_SCHEMA,
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
  @ApiOperation({
    summary: "Consulta um atendimento pelo id (bloqueado até a Identidade)",
  })
  @ApiParam({ name: "patientId", description: "Identificador da paciente." })
  @ApiParam({ name: "id", description: "Identificador do atendimento." })
  @ApiForbiddenResponse({
    description: FORBIDDEN_DESCRIPTION,
    schema: FORBIDDEN_SCHEMA,
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
