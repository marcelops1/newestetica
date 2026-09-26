import { Module } from "@nestjs/common";
import type { PrismaClient } from "../generated/prisma/client";
import { createPrismaClientFromEnv } from "../shared/prisma/client-factory";
import { AnonymizePatientUseCase } from "./application/use-cases/anonymize-patient.use-case";
import { CreatePatientUseCase } from "./application/use-cases/create-patient.use-case";
import { GetPatientByIdUseCase } from "./application/use-cases/get-patient-by-id.use-case";
import { ListPatientsUseCase } from "./application/use-cases/list-patients.use-case";
import { UpdatePatientUseCase } from "./application/use-cases/update-patient.use-case";
import { PrismaPatientRepository } from "./infrastructure/persistence/patient.repository.impl";
import { PatientsController } from "./presentation/controllers/patients.controller";
import { IdentityPendingGuard } from "../shared/http/identity-pending.guard";

export const PATIENTS_PRISMA_CLIENT = Symbol("PATIENTS_PRISMA_CLIENT");
export const PATIENT_REPOSITORY = Symbol("PATIENT_REPOSITORY");

/* Cliente próprio do módulo (mesmo padrão dos demais): a factory é compartilhada
   (kernel), a instância não. Sem UnitOfWork: escrita de entidade única (decisão 3).
   O `IdentityPendingGuard` é provider local — bloqueio honesto até a Identidade. */
@Module({
  controllers: [PatientsController],
  providers: [
    { provide: PATIENTS_PRISMA_CLIENT, useFactory: createPrismaClientFromEnv },
    {
      provide: PATIENT_REPOSITORY,
      useFactory: (prisma: PrismaClient) => new PrismaPatientRepository(prisma),
      inject: [PATIENTS_PRISMA_CLIENT],
    },
    {
      provide: CreatePatientUseCase,
      useFactory: (patients: PrismaPatientRepository) =>
        new CreatePatientUseCase(patients),
      inject: [PATIENT_REPOSITORY],
    },
    {
      provide: ListPatientsUseCase,
      useFactory: (patients: PrismaPatientRepository) =>
        new ListPatientsUseCase(patients),
      inject: [PATIENT_REPOSITORY],
    },
    {
      provide: GetPatientByIdUseCase,
      useFactory: (patients: PrismaPatientRepository) =>
        new GetPatientByIdUseCase(patients),
      inject: [PATIENT_REPOSITORY],
    },
    {
      provide: UpdatePatientUseCase,
      useFactory: (patients: PrismaPatientRepository) =>
        new UpdatePatientUseCase(patients),
      inject: [PATIENT_REPOSITORY],
    },
    {
      provide: AnonymizePatientUseCase,
      useFactory: (patients: PrismaPatientRepository) =>
        new AnonymizePatientUseCase(patients),
      inject: [PATIENT_REPOSITORY],
    },
    IdentityPendingGuard,
  ],
})
export class PatientsModule {}
