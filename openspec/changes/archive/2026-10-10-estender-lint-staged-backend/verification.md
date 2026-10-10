# Verificação — estender-lint-staged-backend

Change de tooling (sem gatilho docs/07 §7 — sem entrada de usuário, autenticação, dado de paciente ou integração; sem revisão `security-and-hardening` completa por ausência de gatilho, conforme task 5.3). Data: 2026-10-10. Branch: `chore/estender-lint-staged-backend`.

## Prova RED (task 1.1) — o hook ignorava backend/ e contracts/

Com o config original (só `frontend/**`), dois scratch com erro de formatação (`const  x=1`) stageados em `backend/` e `contracts/`:

- Saída do hook: `lint-staged could not find any staged files matching configured tasks.`
- Commit `530dbbf` criado com os arquivos **sujos intactos** (`const  x=1` inalterado) — prova que não havia barreira.
- Limpeza: `git reset --hard HEAD~1` + remoção dos scratch.

## Prova GREEN corrigível (task 3.1) — hook corrige e commita

Com o config novo, mesmos scratch sujos stageados:

- Hook disparou por pasta:
  `pnpm -C backend exec eslint --fix "scratch-lint-probe.ts"` ✔,
  `pnpm -C backend exec prettier --write "scratch-lint-probe.ts"` ✔,
  `pnpm -C contracts exec eslint --fix "scratch-lint-probe.ts"` ✔,
  `pnpm -C contracts exec prettier --write "scratch-lint-probe.ts"` ✔
- Commit criado com conteúdo corrigido (`const x = 1;`), exit 0. Repetido 2x (antes e depois do commit do config). Limpeza: reset + remoção dos scratch.

## Prova GREEN não-corrigível (task 3.2) — hook barra o commit

Scratch com `const unusedVar = 42;` (erro `no-unused-vars`, sem autofix) em ambas as pastas:

- `pnpm -C backend exec eslint --fix` → `2:7 error 'unusedVar' is assigned a value but never used`, idem contracts.
- `husky - pre-commit script failed (code 1)` — HEAD inalterado (`bda8b92`), nada commitado. Repetido 2x. Limpeza: unstage + remoção dos scratch.

## Prova GREEN gerado (task 3.3) — Prisma gerado ignorado, duas camadas

1. `backend/src/generated` está no `.gitignore` — `git add` do arquivo gerado recusado ("caminhos ignorados"); o hook sequer enxerga esses paths.
2. Filtro da função verificado por execução direta (`node --input-type=module`, import do config real):
   - só gerado → `[]` (nenhum comando emitido);
   - misto (gerado + `backend/src/app.ts`) → só o vivo, relativo à pasta: `pnpm -C backend exec eslint --fix "src/app.ts"`;
   - contracts/frontend → relativos corretos (`pnpm -C contracts exec ... "src/index.ts"`, `pnpm -C frontend exec ... "src/app.ts"`).
3. Arquivo gerado tocado durante a prova restaurado do backup (`/tmp/opencode/client.ts.bak`) — nenhum gerado commitado.

## Hook em sessão de agente não-interativa (task 4.1)

**SIM, o hook rodou** — todas as provas acima (RED + 2x GREEN corrigível + 2x GREEN não-corrigível + commit do config) foram executadas nesta sessão de agente (opencode, sem TTY) e o hook disparou normalmente em cada uma. Nenhuma compensação necessária; o precedente "husky não rodou nas execuções não interativas" (Catálogo) não se reproduziu aqui. Hipótese da diferença: o hook do husky roda via `pnpm exec lint-staged` com hooks do git ativos independente de TTY; sessões anteriores provavelmente usaram `--no-verify` ou ambiente sem `pnpm install`.

## Docs (task 4.2)

- `docs/engineering/07-workflow-de-engenharia.md`: item 1 das camadas passa a listar o escopo (`frontend/**/*.{ts,tsx}`, `backend/**/*.ts`, `contracts/**/*.ts`, cada pasta com seu config; `backend/src/generated/**` excluído).
- `docs/product/05-estado-atual.md`: **nada a remover** — a redação vigente já era neutra ("pre-commit local (husky + lint-staged)", sem ressalva "só cobre frontend"). A ressalva "só cobre frontend" vivia nas revisões dos changes do Financeiro e da Identidade (verification.md), não nos docs vigentes.

## Gates (task 5.1)

- `pnpm lint` — exit 0 (frontend: 1 warning pre-existente `import/no-anonymous-default-export`, fora do escopo; backend/contracts limpos).
- `pnpm format` — exit 0 (incluindo `--check` do `lint-staged.config.mjs` da raiz).
- `pnpm typecheck` — exit 0.
- `pnpm test` (com `make up` — Postgres/Keycloak; sem Docker o backend falha com `ECONNREFUSED 127.0.0.1:5432`, pré-requisito conhecido do repo, não deste change): frontend 15 arquivos/109 testes, contracts 15/80, backend 85/394 — tudo passado.
- `pnpm build` — exit 0.
- `pnpm audit --audit-level=high` — 4 high (source-map-js, sharp, next) + 8 moderate + 1 low; **pre-existentes** (lockfile intocado neste change — zero dependência nova; achados vivem em deps do frontend, fora do escopo).

## Revisão code-review-and-quality

- **Correção:** filtro do gerado cobre path igual ao dir e filhos (`abs !== GENERATED_DIR && relative startsWith("..")`); `forDir(dir, name)` explicita o nome em vez de `basename` (legibilidade); frontend byte-equivalente ao anterior (`pnpm -C frontend`, mesmos relativos).
- **Segurança:** sem gatilho (tooling puro, sem entrada/auth/dado/integração); nenhum segredo.
- **Veredito:** aprovado (auto-revisão; sem achados).

## Aplicação da seção 13 (registro de aplicados e dispensas)

- **Aplicado — prova executável:** RED + GREEN (corrigível, não-corrigível, gerado) no fluxo git real com o hook de produção, saídas coladas acima.
- **Dispensado — OWASP/contrato/schema/mutation/E2E/carga:** tooling puro, sem lógica de negócio nem fronteira de dados.
- **Exceção docs/07 §4:** não invocada (prova executável cobriu o comportamento).
- **`skip_specs`:** NÃO se aplica — há delta de spec (requirement MODIFIED em `engineering-workflow`).
