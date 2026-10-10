import { spawnSync } from "node:child_process";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  createTestPrismaClient,
  resetDatabase,
  testDatabaseUrl,
} from "./database";

/* Testes do seed de desenvolvimento (`prisma/seed.mjs`): ferramental, não rota.
   Caso 1 — guarda de produção: o seed recusa rodar com NODE_ENV=production
   (exit ≠ 0, mensagem clara) antes de encostar no banco.
   Caso 2 — idempotência: rodar duas vezes não duplica nem altera contagens, e
   nenhuma tabela fora do escopo do seed (paciente/atendimento) recebe linha. */

const backendRoot = path.resolve(__dirname, "../..");
const seedScript = path.join(backendRoot, "prisma", "seed.mjs");

function runSeed(env: Record<string, string>) {
  return spawnSync(process.execPath, [seedScript], {
    cwd: backendRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

type Counts = {
  procedures: number;
  activeProcedures: number;
  testimonials: number;
  posts: number;
  beforeAfterCases: number;
  consentedCases: number;
  slots: number;
  availableSlots: number;
  patients: number;
  attendances: number;
};

describe("seed de desenvolvimento", () => {
  beforeAll(async () => {
    const prisma = createTestPrismaClient();
    await resetDatabase(prisma);
    await prisma.$disconnect();
  });

  it("recusa rodar com NODE_ENV=production (exit ≠ 0, mensagem clara)", () => {
    const result = runSeed({
      NODE_ENV: "production",
      DATABASE_URL: testDatabaseUrl(),
    });

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(
      "Seed recusado: NODE_ENV=production",
    );
  });

  it("é idempotente: rodar duas vezes mantém as contagens e não cria paciente/atendimento", async () => {
    const prisma = createTestPrismaClient();

    async function counts(): Promise<Counts> {
      const [
        procedures,
        activeProcedures,
        testimonials,
        posts,
        beforeAfterCases,
        consentedCases,
        slots,
        availableSlots,
        patients,
        attendances,
      ] = await prisma.$transaction([
        prisma.procedure.count(),
        prisma.procedure.count({ where: { isActive: true } }),
        prisma.testimonial.count(),
        prisma.post.count(),
        prisma.beforeAfterCase.count(),
        prisma.beforeAfterCase.count({ where: { hasConsent: true } }),
        prisma.slot.count(),
        prisma.slot.count({ where: { available: true } }),
        prisma.patient.count(),
        prisma.attendance.count(),
      ]);
      return {
        procedures,
        activeProcedures,
        testimonials,
        posts,
        beforeAfterCases,
        consentedCases,
        slots,
        availableSlots,
        patients,
        attendances,
      };
    }

    try {
      const first = runSeed({
        NODE_ENV: "development",
        DATABASE_URL: testDatabaseUrl(),
      });
      expect(first.status).toBe(0);

      const firstCounts = await counts();

      const second = runSeed({
        NODE_ENV: "development",
        DATABASE_URL: testDatabaseUrl(),
      });
      expect(second.status).toBe(0);

      const secondCounts = await counts();

      /* Mesmas contagens depois da segunda execução — sem duplicar nem sumir. */
      expect(secondCounts).toEqual(firstCounts);

      /* O seed cobre o que promete: 6 procedimentos ativos (de 7, 1 inativo),
         5 depoimentos, 4 posts, 2 casos com consentimento (de 3, 1 sem) e
         9 horários (de 1 indisponível que a rota pública filtra). */
      expect(firstCounts.procedures).toBe(7);
      expect(firstCounts.activeProcedures).toBe(6);
      expect(firstCounts.testimonials).toBe(5);
      expect(firstCounts.posts).toBe(4);
      expect(firstCounts.beforeAfterCases).toBe(3);
      expect(firstCounts.consentedCases).toBe(2);
      expect(firstCounts.slots).toBe(9);
      expect(firstCounts.availableSlots).toBe(8);

      /* Fora do escopo do seed: nenhuma linha criada nas duas execuções. */
      expect(firstCounts.patients).toBe(0);
      expect(firstCounts.attendances).toBe(0);
    } finally {
      await prisma.$disconnect();
    }
  });
});
