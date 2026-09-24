import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["coverage/", "dist/", "src/generated/", ".stryker-tmp/"] },
  tseslint.configs.recommended,
  {
    rules: {
      /* Convenção do repo: parâmetro intencionalmente não usado leva prefixo `_`
         (ex.: hook com default que ignora o argumento). */
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
