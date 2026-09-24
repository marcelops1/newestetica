import { defineConfig } from "vitest/config";
import { integrationTestSettings } from "./vitest.shared";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/main.ts",
        "src/app.controller.ts",
        "src/**/*.module.ts",
        "src/**/*.spec.ts",
        "src/generated/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.spec.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["test/integration/**/*.int.spec.ts"],
          ...integrationTestSettings,
        },
      },
    ],
  },
});
