import { defineConfig } from "vitest/config";

/* Config dedicada ao mutation testing (Stryker). O runner não lida bem com o
   vitest "projects" (IDs de teste colidem entre unit e integração no merge de
   cobertura), então o mutation roda com um projeto único contendo toda a suíte.
   A suíte normal continua em vitest.config.ts. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts", "test/integration/**/*.int.spec.ts"],
    globalSetup: ["test/integration/global-setup.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
