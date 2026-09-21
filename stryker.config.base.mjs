/* Base compartilhada dos configs Stryker (backend e contracts). Mutation testing é
   adoção manual — NÃO integrado ao CI nem aos gates (docs/engineering/07-workflow-de-engenharia.md §13).

   Runner: "command" — o @stryker-mutator/vitest-runner@10.0.0 (última versão) não ativa
   mutantes no vitest 5: o setup grava cobertura em `suite.meta` (API do vitest ≥4.1) que
   não chega, resultando em falso 0% silencioso. O runner também não lida com os `projects`
   do vitest (IDs colidem no merge de cobertura) e o discovery de plugin falha no layout
   pnpm sem `plugins` explícito. O command runner usa exit code e não depende dessas APIs. */
/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
export default {
  testRunner: "command",
  thresholds: { high: 80, low: 60, break: 50 },
  reporters: ["html", "clear-text", "progress"],
  timeoutMS: 120000,
};
