import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

/* Kernel técnico compartilhado (docs/architecture/02-arquitetura.md §3, exceção do
   kernel): a factory compartilha a CONSTRUÇÃO do cliente, não a instância — cada módulo
   continua criando o seu cliente no provider (3 pools conscientemente adiados, decisão 8
   do change Conteúdo Público; o trigger de provider compartilhado segue intacto). */
export function createPrismaClientFromEnv(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada para o backend");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}
