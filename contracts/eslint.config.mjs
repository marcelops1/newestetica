import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["coverage/", "dist/", ".stryker-tmp/"] },
  tseslint.configs.recommended,
);
