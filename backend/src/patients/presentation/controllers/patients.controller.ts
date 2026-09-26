import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";
import {
  PatientInputSchema,
  PatientSchema,
  PatientUpdateSchema,
  type Patient as PatientResponse,
} from "@newestetica/contracts";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { AnonymizePatientUseCase } from "../../application/use-cases/anonymize-patient.use-case";
import { CreatePatientUseCase } from "../../application/use-cases/create-patient.use-case";
import { GetPatientByIdUseCase } from "../../application/use-cases/get-patient-by-id.use-case";
import {
  MAX_PATIENTS_LIMIT,
  ListPatientsUseCase,
} from "../../application/use-cases/list-patients.use-case";
import { UpdatePatientUseCase } from "../../application/use-cases/update-patient.use-case";
import type { Patient } from "../../domain/entities/patient.entity";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";
import {
  AUTH_NOT_IMPLEMENTED_CODE,
  AUTH_NOT_IMPLEMENTED_MESSAGE,
  IdentityPendingGuard,
} from "../guards/identity-pending.guard";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";

class PatientInputDto extends createZodDto(PatientInputSchema) {}
class PatientUpdateDto extends createZodDto(PatientUpdateSchema) {}
class PatientResponseDto extends createZodDto(PatientSchema) {}

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
   (`MAX_PATIENTS_LIMIT`) — nunca um literal duplicado. */
export const ListPatientsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_PATIENTS_LIMIT).optional(),
});

type PatientListResponse = PatientResponse[];
type PatientItemResponse = PatientResponse;

/* Allowlist explícita do contrato: a entidade nunca cruza o wire; timestamps viram
   ISO string e `anonymizedAt` (detalhe de persistência) fica de fora. */
function toResponse(patient: Patient): PatientItemResponse {
  return {
    id: patient.id,
    fullName: patient.fullName,
    phone: patient.phone,
    purpose: patient.purpose,
    status: patient.status,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  };
}

@ApiTags("Pacientes (bloqueado até a Identidade)")
@Controller("patients")
@UseGuards(IdentityPendingGuard)
@UseFilters(DomainExceptionFilter)
export class PatientsController {
  constructor(
    private readonly createPatient: CreatePatientUseCase,
    private readonly listPatients: ListPatientsUseCase,
    private readonly getPatientById: GetPatientByIdUseCase,
    private readonly updatePatient: UpdatePatientUseCase,
    private readonly anonymizePatient: AnonymizePatientUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Cadastra uma paciente (bloqueado até a Identidade)" })
  @ApiForbiddenResponse({
    description: FORBIDDEN_DESCRIPTION,
    schema: FORBIDDEN_SCHEMA,
  })
  @ApiCreatedResponse({
    description: "Paciente cadastrada.",
    type: PatientResponseDto,
  })
  @ApiUnprocessableEntityResponse({ description: "Dados inválidos." })
  async create(
    @Body(new ZodValidationPipe(PatientInputSchema)) input: PatientInputDto,
  ): Promise<PatientItemResponse> {
    const patient = await this.createPatient.execute(input);
    return toResponse(patient);
  }

  @Get()
  @ApiOperation({ summary: "Lista as pacientes ativas (bloqueado até a Identidade)" })
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
    description: "Pacientes ativas (anonimizadas nunca aparecem).",
    type: PatientResponseDto,
    isArray: true,
  })
  @ApiUnprocessableEntityResponse({ description: "Limite inválido." })
  async list(
    @Query(new ZodValidationPipe(ListPatientsQuerySchema))
    query: {
      limit?: number;
    },
  ): Promise<PatientListResponse> {
    const patients = await this.listPatients.execute(query);
    return patients.map(toResponse);
  }

  @Get(":id")
  @ApiOperation({ summary: "Consulta uma paciente pelo id (bloqueado até a Identidade)" })
  @ApiParam({ name: "id", description: "Identificador da paciente." })
  @ApiForbiddenResponse({
    description: FORBIDDEN_DESCRIPTION,
    schema: FORBIDDEN_SCHEMA,
  })
  @ApiOkResponse({ description: "Paciente ativa.", type: PatientResponseDto })
  @ApiNotFoundResponse({
    description: "Não encontrada (inexistente ou anonimizada, sem distinção).",
  })
  @ApiUnprocessableEntityResponse({ description: "Id inválido." })
  async byId(
    @Param("id", new ZodValidationPipe(IdSchema)) id: string,
  ): Promise<PatientItemResponse> {
    const patient = await this.getPatientById.execute(id);
    return toResponse(patient);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza uma paciente (bloqueado até a Identidade)" })
  @ApiParam({ name: "id", description: "Identificador da paciente." })
  @ApiForbiddenResponse({
    description: FORBIDDEN_DESCRIPTION,
    schema: FORBIDDEN_SCHEMA,
  })
  @ApiOkResponse({
    description: "Paciente atualizada.",
    type: PatientResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Não encontrada (inexistente ou anonimizada, sem distinção).",
  })
  @ApiUnprocessableEntityResponse({ description: "Dados inválidos." })
  async update(
    @Param("id", new ZodValidationPipe(IdSchema)) id: string,
    @Body(new ZodValidationPipe(PatientUpdateSchema))
    changes: PatientUpdateDto,
  ): Promise<PatientItemResponse> {
    const patient = await this.updatePatient.execute(id, changes);
    return toResponse(patient);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({
    summary: "Anonimiza uma paciente (bloqueado até a Identidade)",
  })
  @ApiParam({ name: "id", description: "Identificador da paciente." })
  @ApiForbiddenResponse({
    description: FORBIDDEN_DESCRIPTION,
    schema: FORBIDDEN_SCHEMA,
  })
  @ApiNoContentResponse({
    description: "PII substituída por placeholders; sem corpo.",
  })
  @ApiNotFoundResponse({
    description: "Não encontrada (inexistente ou anonimizada, sem distinção).",
  })
  @ApiUnprocessableEntityResponse({ description: "Id inválido." })
  async anonymize(
    @Param("id", new ZodValidationPipe(IdSchema)) id: string,
  ): Promise<void> {
    await this.anonymizePatient.execute(id);
  }
}
