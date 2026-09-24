import type { ViteUserConfig } from "vitest/config";

/* Settings compartilhados dos testes que tocam o Postgres de integração (suíte normal
   e mutation testing). Fonte única para environment, globalSetup e limites de tempo —
   os paths são resolvidos a partir da raiz do backend, como antes. */
export const integrationTestSettings: ViteUserConfig["test"] = {
  environment: "node",
  globalSetup: ["test/integration/global-setup.ts"],
  fileParallelism: false,
  testTimeout: 30_000,
  hookTimeout: 30_000,
};
