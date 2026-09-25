/* Stryker Mutator — mutation testing do backend (base compartilhada: ../stryker.config.base.mjs).
   Executar com: pnpm --filter backend mutation (com o Postgres do compose no ar: pnpm infra:up)

   Config de teste: vitest.mutation.config.ts (projeto único) — a suíte normal usa `projects`,
   que o runner do Stryker não resolve. concurrency 1: a integração compartilha o banco de teste. */
import base from "../stryker.config.base.mjs";

/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
export default {
  ...base,
  commandRunner: {
    command: "pnpm exec vitest run --config vitest.mutation.config.ts --bail=1",
  },
  mutate: [
    "src/catalog/**/*.ts",
    "src/scheduling/**/*.ts",
    "src/content/**/*.ts",
    "src/shared/**/*.ts",
    "src/patients/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.module.ts",
  ],
  concurrency: 1,
};
