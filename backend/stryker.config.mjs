/* Stryker Mutator — mutation testing do backend (NÃO integrado ao CI ainda — decisão
   registrada em docs/engineering/07-workflow-de-engenharia.md §13). Executar com:
   pnpm --filter backend mutation (com o Postgres do compose no ar: pnpm infra:up)

   Runner: "command" (não "vitest") — o @stryker-mutator/vitest-runner@10.0.0 não
   ativa mutantes no vitest 5 (hooks API mudou; resultado silencioso de 0%), então
   a medição usa a config single-project vitest.mutation.config.ts via exit code.
   concurrency 1: os testes de integração compartilham o banco de teste. */
/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
export default {
  testRunner: "command",
  commandRunner: {
    command: "pnpm exec vitest run --config vitest.mutation.config.ts --bail=1",
  },
  mutate: [
    "src/scheduling/**/*.ts",
    "!src/scheduling/**/*.spec.ts",
    "!src/scheduling/**/*.module.ts",
  ],
  thresholds: { high: 80, low: 60, break: 50 },
  reporters: ["html", "clear-text", "progress"],
  timeoutMS: 120000,
  concurrency: 1,
};
