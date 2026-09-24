import { Prisma, type PrismaClient } from "../../../generated/prisma/client";
import type { Booking } from "../../domain/entities/booking.entity";
import { SlotAlreadyBooked } from "../../domain/errors/errors";
import type { BookingRepository } from "../../domain/ports/booking.repository";
import { toBookingPersistence } from "./mappers/booking.mapper";
import type { PrismaTransactionContext } from "./transaction-context";

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export class PrismaBookingRepository implements BookingRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly transactionContext: PrismaTransactionContext,
  ) {}

  private get client(): Prisma.TransactionClient {
    return this.transactionContext.current() ?? this.prisma;
  }

  async save(booking: Booking): Promise<void> {
    const data = toBookingPersistence(booking);
    try {
      await this.client.booking.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new SlotAlreadyBooked(booking.slotId);
      }
      throw error;
    }
  }
}
