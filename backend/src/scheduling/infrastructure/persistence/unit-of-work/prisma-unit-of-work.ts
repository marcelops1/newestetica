import type { PrismaClient } from "../../../../generated/prisma/client";
import type { UnitOfWork } from "../../../domain/ports/unit-of-work.port";
import type { PrismaTransactionContext } from "./transaction-context";

export class PrismaUnitOfWork implements UnitOfWork {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly transactionContext: PrismaTransactionContext,
  ) {}

  execute<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      this.transactionContext.run(tx, work),
    );
  }
}
