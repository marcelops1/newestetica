/* Stryker Mutator — mutation testing do contracts (base compartilhada: ../stryker.config.base.mjs).
   Executar com: pnpm --filter contracts mutation */
import base from "../stryker.config.base.mjs";

/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
export default {
  ...base,
  commandRunner: {
    command: "pnpm exec vitest run --bail=1",
  },
  mutate: [
    "src/catalog/**/*.ts",
    "src/scheduling/**/*.ts",
    "!src/**/*.test.ts",
  ],
  concurrency: 2,
};
