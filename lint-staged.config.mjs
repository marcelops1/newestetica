import path from "node:path";

/* Lint-staged sobre arquivos .ts/.tsx staged dentro de frontend/.
   O ESLint resolve a config a partir do CWD, e o lint-staged não roda os
   comandos via shell — então cada tarefa começa em um binário real (pnpm)
   com `-C frontend` fixando o diretório, e os caminhos são normalizados
   para relativos a frontend/ (path.relative tolera raiz-relativo ou absoluto). */

const FRONTEND_DIR = path.resolve("frontend");

export default {
  "frontend/**/*.{ts,tsx}": (filenames) => {
    const quoted = filenames.map((file) =>
      JSON.stringify(path.relative(FRONTEND_DIR, file)),
    );
    return [
      `pnpm -C frontend exec eslint --fix ${quoted.join(" ")}`,
      `pnpm -C frontend exec prettier --write ${quoted.join(" ")}`,
    ];
  },
};
