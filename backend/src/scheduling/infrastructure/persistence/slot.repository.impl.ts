import type { Prisma, PrismaClient } from "../../../generated/prisma/client";
import type { Slot } from "../../domain/entities/slot.entity";
import type { SlotRepository } from "../../domain/ports/slot.repository";
import { toSlotDomain, toSlotPersistence } from "./mappers/slot.mapper";
import type { PrismaTransactionContext } from "./transaction-context";

export class PrismaSlotRepository implements SlotRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly transactionContext: PrismaTransactionContext,
  ) {}

  private get client(): Prisma.TransactionClient {
    return this.transactionContext.current() ?? this.prisma;
  }

  async findAvailable(): Promise<Slot[]> {
    const records = await this.client.slot.findMany({
      where: { available: true },
    });
    return records.map(toSlotDomain);
  }

  async findById(id: string): Promise<Slot | null> {
    const record = await this.client.slot.findUnique({ where: { id } });
    return record ? toSlotDomain(record) : null;
  }

  async save(slot: Slot): Promise<void> {
    const data = toSlotPersistence(slot);
    await this.client.slot.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
}
