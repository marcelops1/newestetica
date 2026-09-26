import { Module } from "@nestjs/common";
import type { PrismaClient } from "../generated/prisma/client";
import { createPrismaClientFromEnv } from "../shared/prisma/client-factory";
import { IdentityPendingGuard } from "../shared/http/identity-pending.guard";
import { CreateAttendanceUseCase } from "./application/use-cases/create-attendance.use-case";
import { GetAttendanceByIdUseCase } from "./application/use-cases/get-attendance-by-id.use-case";
import { ListAttendancesUseCase } from "./application/use-cases/list-attendances.use-case";
import { PrismaAttendanceRepository } from "./infrastructure/persistence/attendance.repository.impl";
import { PrismaPatientDirectory } from "./infrastructure/persistence/patient-directory.impl";
import { AttendancesController } from "./presentation/controllers/attendances.controller";

export const ATTENDANCE_PRISMA_CLIENT = Symbol("ATTENDANCE_PRISMA_CLIENT");
export const ATTENDANCE_REPOSITORY = Symbol("ATTENDANCE_REPOSITORY");
export const PATIENT_DIRECTORY = Symbol("PATIENT_DIRECTORY");

/* Cliente próprio do módulo (mesmo padrão dos demais): a factory é compartilhada
   (kernel), a instância não (quinto pool conscientemente adiado — decisão 10).
   Sem UnitOfWork: escrita de entidade única (decisão 4). A porta PatientDirectory
   é implementada pelo adapter Prisma próprio — nenhum import do módulo de Pacientes.
   O `IdentityPendingGuard` vem do kernel compartilhado (uma única definição para os
   dois módulos administrativos) — bloqueio honesto até a Identidade. */
@Module({
  controllers: [AttendancesController],
  providers: [
    { provide: ATTENDANCE_PRISMA_CLIENT, useFactory: createPrismaClientFromEnv },
    {
      provide: ATTENDANCE_REPOSITORY,
      useFactory: (prisma: PrismaClient) =>
        new PrismaAttendanceRepository(prisma),
      inject: [ATTENDANCE_PRISMA_CLIENT],
    },
    {
      provide: PATIENT_DIRECTORY,
      useFactory: (prisma: PrismaClient) => new PrismaPatientDirectory(prisma),
      inject: [ATTENDANCE_PRISMA_CLIENT],
    },
    {
      provide: CreateAttendanceUseCase,
      useFactory: (
        attendances: PrismaAttendanceRepository,
        patients: PrismaPatientDirectory,
      ) => new CreateAttendanceUseCase(attendances, patients),
      inject: [ATTENDANCE_REPOSITORY, PATIENT_DIRECTORY],
    },
    {
      provide: ListAttendancesUseCase,
      useFactory: (
        attendances: PrismaAttendanceRepository,
        patients: PrismaPatientDirectory,
      ) => new ListAttendancesUseCase(attendances, patients),
      inject: [ATTENDANCE_REPOSITORY, PATIENT_DIRECTORY],
    },
    {
      provide: GetAttendanceByIdUseCase,
      useFactory: (
        attendances: PrismaAttendanceRepository,
        patients: PrismaPatientDirectory,
      ) => new GetAttendanceByIdUseCase(attendances, patients),
      inject: [ATTENDANCE_REPOSITORY, PATIENT_DIRECTORY],
    },
    IdentityPendingGuard,
  ],
})
export class AttendanceModule {}
