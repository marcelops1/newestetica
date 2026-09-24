import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const DEFAULT_TEST_DATABASE_URL =
  "postgresql://newestetica:changeme-dev@127.0.0.1:5432/newestetica_test";

export function testDatabaseUrl(): string {
  return process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
}

export function createTestPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: testDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.beforeAfterCase.deleteMany();
  await prisma.post.deleteMany();
  await prisma.testimonial.deleteMany();
}
