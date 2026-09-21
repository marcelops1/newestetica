/* Stryker Mutator — mutation testing do contracts (NÃO integrado ao CI ainda — decisão
   registrada em docs/engineering/07-workflow-de-engenharia.md §13). Executar com:
   pnpm --filter contracts mutation

   Runner: "command" — mesmo motivo do backend: o @stryker-mutator/vitest-runner@10.0.0
   não ativa mutantes no vitest 5 (hooks API mudou; resultado silencioso de 0%). */
/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
export default {
  testRunner: "command",
  commandRunner: {
    command: "pnpm exec vitest run --bail=1",
  },
  mutate: ["src/scheduling/**/*.ts", "!src/scheduling/**/*.test.ts"],
  thresholds: { high: 80, low: 60, break: 50 },
  reporters: ["html", "clear-text", "progress"],
  timeoutMS: 60000,
  concurrency: 2,
};
