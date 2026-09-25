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
  PatientInputSchema,
  PatientUpdateSchema,
  type Patient as PatientResponse,
} from "@newestetica/contracts";
import { z } from "zod";
import { AnonymizePatientUseCase } from "../../application/use-cases/anonymize-patient.use-case";
import { CreatePatientUseCase } from "../../application/use-cases/create-patient.use-case";
import { GetPatientByIdUseCase } from "../../application/use-cases/get-patient-by-id.use-case";
import {
  ListPatientsUseCase,
  MAX_PATIENTS_LIMIT,
} from "../../application/use-cases/list-patients.use-case";
import { UpdatePatientUseCase } from "../../application/use-cases/update-patient.use-case";
import type { Patient } from "../../domain/entities/patient.entity";
import { DomainExceptionFilter } from "../filters/domain-exception.filter";
import { IdentityPendingGuard } from "../guards/identity-pending.guard";
import { ZodValidationPipe } from "../../../shared/http/zod-validation.pipe";

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
  async create(
    @Body(new ZodValidationPipe(PatientInputSchema))
    input: {
      fullName: string;
      phone: string;
      purpose: string;
    },
  ): Promise<PatientItemResponse> {
    const patient = await this.createPatient.execute(input);
    return toResponse(patient);
  }

  @Get()
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
  async byId(
    @Param("id", new ZodValidationPipe(IdSchema)) id: string,
  ): Promise<PatientItemResponse> {
    const patient = await this.getPatientById.execute(id);
    return toResponse(patient);
  }

  @Patch(":id")
  async update(
    @Param("id", new ZodValidationPipe(IdSchema)) id: string,
    @Body(new ZodValidationPipe(PatientUpdateSchema))
    changes: { fullName?: string; phone?: string; purpose?: string },
  ): Promise<PatientItemResponse> {
    const patient = await this.updatePatient.execute(id, changes);
    return toResponse(patient);
  }

  @Delete(":id")
  @HttpCode(204)
  async anonymize(
    @Param("id", new ZodValidationPipe(IdSchema)) id: string,
  ): Promise<void> {
    await this.anonymizePatient.execute(id);
  }
}
