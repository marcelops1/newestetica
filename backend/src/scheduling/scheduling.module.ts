import { Module } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { CreateBookingUseCase } from "./application/use-cases/create-booking.use-case";
import { ListAvailabilityUseCase } from "./application/use-cases/list-availability.use-case";
import { ConsoleNotificationAdapter } from "./infrastructure/notifications/console-notification.adapter";
import { PrismaBookingRepository } from "./infrastructure/persistence/booking.repository.impl";
import { PrismaSlotRepository } from "./infrastructure/persistence/slot.repository.impl";
import { PrismaUnitOfWork } from "./infrastructure/persistence/unit-of-work/prisma-unit-of-work";
import { PrismaTransactionContext } from "./infrastructure/persistence/unit-of-work/transaction-context";
import { SchedulingController } from "./presentation/controllers/scheduling.controller";

export const PRISMA_CLIENT = Symbol("PRISMA_CLIENT");
export const SLOT_REPOSITORY = Symbol("SLOT_REPOSITORY");
export const BOOKING_REPOSITORY = Symbol("BOOKING_REPOSITORY");
export const UNIT_OF_WORK = Symbol("UNIT_OF_WORK");
export const NOTIFICATION_PORT = Symbol("NOTIFICATION_PORT");

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada para o backend");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

@Module({
  controllers: [SchedulingController],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: createPrismaClient },
    PrismaTransactionContext,
    {
      provide: SLOT_REPOSITORY,
      useFactory: (prisma: PrismaClient, context: PrismaTransactionContext) =>
        new PrismaSlotRepository(prisma, context),
      inject: [PRISMA_CLIENT, PrismaTransactionContext],
    },
    {
      provide: BOOKING_REPOSITORY,
      useFactory: (prisma: PrismaClient, context: PrismaTransactionContext) =>
        new PrismaBookingRepository(prisma, context),
      inject: [PRISMA_CLIENT, PrismaTransactionContext],
    },
    {
      provide: UNIT_OF_WORK,
      useFactory: (prisma: PrismaClient, context: PrismaTransactionContext) =>
        new PrismaUnitOfWork(prisma, context),
      inject: [PRISMA_CLIENT, PrismaTransactionContext],
    },
    { provide: NOTIFICATION_PORT, useClass: ConsoleNotificationAdapter },
    {
      provide: CreateBookingUseCase,
      useFactory: (
        slots: PrismaSlotRepository,
        bookings: PrismaBookingRepository,
        notifications: ConsoleNotificationAdapter,
        unitOfWork: PrismaUnitOfWork,
      ) => new CreateBookingUseCase(slots, bookings, notifications, unitOfWork),
      inject: [
        SLOT_REPOSITORY,
        BOOKING_REPOSITORY,
        NOTIFICATION_PORT,
        UNIT_OF_WORK,
      ],
    },
    {
      provide: ListAvailabilityUseCase,
      useFactory: (slots: PrismaSlotRepository) =>
        new ListAvailabilityUseCase(slots),
      inject: [SLOT_REPOSITORY],
    },
  ],
})
export class SchedulingModule {}
