import path from "node:path";

/* Lint-staged sobre arquivos .ts/.tsx staged dentro de frontend/,
   .ts staged dentro de backend/ (menos src/generated/, Prisma gerado)
   e .ts staged dentro de contracts/.
   O ESLint resolve a config a partir do CWD, e o lint-staged não roda os
   comandos via shell — então cada tarefa começa em um binário real (pnpm)
   com `-C <pasta>` fixando o diretório, e os caminhos são normalizados
   para relativos à pasta (path.relative tolera raiz-relativo ou absoluto).
   Sem .tsx em backend/contracts (0 arquivos) — YAGNI; o CI cobre o resto. */

const FRONTEND_DIR = path.resolve("frontend");
const BACKEND_DIR = path.resolve("backend");
const CONTRACTS_DIR = path.resolve("contracts");
const GENERATED_DIR = path.resolve("backend/src/generated");

function forDir(dir, name) {
  return (filenames) => {
    const quoted = filenames.map((file) =>
      JSON.stringify(path.relative(dir, file)),
    );
    return [
      `pnpm -C ${name} exec eslint --fix ${quoted.join(" ")}`,
      `pnpm -C ${name} exec prettier --write ${quoted.join(" ")}`,
    ];
  };
}

export default {
  "frontend/**/*.{ts,tsx}": forDir(FRONTEND_DIR, "frontend"),
  "backend/**/*.ts": (filenames) => {
    // Exclui Prisma gerado (defesa em profundidade além do `ignores`
    // do eslint do backend): o hook nunca linta nem formata gerado.
    const live = filenames.filter((file) => {
      const abs = path.resolve(file);
      return (
        abs !== GENERATED_DIR &&
        path.relative(GENERATED_DIR, abs).startsWith("..")
      );
    });
    if (live.length === 0) return [];
    return forDir(BACKEND_DIR, "backend")(live);
  },
  "contracts/**/*.ts": forDir(CONTRACTS_DIR, "contracts"),
};
