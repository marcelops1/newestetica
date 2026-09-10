/* Stryker Mutator — mutation testing do frontend (NÃO integrado ao CI ainda — decisão
   registrada em docs/engineering/07-workflow-de-engenharia.md §13). Executar com: pnpm mutation */
/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
export default {
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: ["lib/**/*.ts", "!lib/**/*.test.ts", "!lib/__tests__/**"],
  thresholds: { high: 80, low: 60, break: 50 },
  reporters: ["html", "clear-text", "progress"],
};
