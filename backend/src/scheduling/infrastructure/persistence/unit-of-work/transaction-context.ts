import { AsyncLocalStorage } from "node:async_hooks";
import type { Prisma } from "../../../../generated/prisma/client";

export class PrismaTransactionContext {
  private readonly storage = new AsyncLocalStorage<Prisma.TransactionClient>();

  run<T>(client: Prisma.TransactionClient, work: () => Promise<T>): Promise<T> {
    return this.storage.run(client, work);
  }

  current(): Prisma.TransactionClient | undefined {
    return this.storage.getStore();
  }
}
