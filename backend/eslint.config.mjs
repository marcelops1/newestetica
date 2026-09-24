import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["coverage/", "dist/", "src/generated/", ".stryker-tmp/"] },
  tseslint.configs.recommended,
);
