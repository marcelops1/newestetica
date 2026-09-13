# Verificação — instalar-husky-lint-staged

Change de tooling (sem gatilho docs/07 §7 — sem entrada de usuário, autenticação, dado de paciente ou integração; registro mantido conforme a regra "registro obrigatório para liberar o archive") + revisão com `code-review-and-quality`. Data: 2026-09-13.

## Prova executável do hook (RED→GREEN real — sem exceção docs/07 §4)

- **RED (task 1.1):** com scratch `frontend/lib/__tests__/hook-proof.tmp.ts` contendo erro não-corrigível (`no-unused-vars`) + formatação suja (corrigível), stagear só o scratch e commitar **sem hook** → commit `01903b5` criado, `EXIT_COMMIT=0` — prova que hoje nada barra lint/format localmente. Desfeito com `git reset HEAD~1` (scratch preservado no disco).
- **GREEN corrigível (task 1.2):** com o hook ativo e scratch SÓ com formatação suja → hook rodou `pnpm -C frontend exec eslint --fix "..."` ✔ e `prettier --write "..."` ✔, re-stageou e o commit `2f14e56` saiu com o conteúdo **corrigido** (verificado no diff: espaçamentos normalizados pelo prettier). Desfeito com `git reset HEAD~1` (arquivos reais do hook permaneceram unstaged).
- **GREEN não-corrigível (task 1.3):** com scratch SÓ com apóstrofo/aspas não escapados em JSX → hook falhou: `react/no-unescaped-entities` — 3 errors, `husky - pre-commit script failed (code 1)`, `EXIT_COMMIT=1`, commit **barrado** (HEAD permaneceu `5eb6f9e`; `git ls-tree HEAD` sem o scratch). Scratch removido do stage e do disco; árvore limpa.
- **Commit real (task 1.4):** `b9e9ec4` com os 4 arquivos (`package.json`, `pnpm-lock.yaml`, `.husky/pre-commit`, `lint-staged.config.mjs`); commits seguintes mostram o hook disparando (no-op legítimo: "lint-staged could not find any staged files matching configured tasks").

## Ajustes do apply guiados pela prova executável (design risco nº 2 — prova como critério)

1. **Forma da config:** lint-staged v17 exige função por glob-key (objeto retornado por função de topo → "Function task should return a string or an array of strings"). Config final: `"frontend/**/*.{ts,tsx}": (filenames) => [...]`.
2. **Comando sem shell:** lint-staged não roda comandos via shell — `cd frontend && ...` → ENOENT. Cada tarefa começa em binário real: `pnpm -C frontend exec eslint --fix <files>` / `pnpm -C frontend exec prettier --write <files>`.
3. **Erro não-corrigível real:** diagnóstico executado na hora — na config do projeto `no-unused-vars` é **warning** (não barra), `no-debugger`/`no-dupe-keys`/`react-hooks/rules-of-hooks` não dispararam erro; o erro real não-corrigível usado foi `react/no-unescaped-entities` (error, sem autofix). A tentativa intermediária em que o hook NÃO barrou (unused var passando, exit 0) ficou registrada acima como parte honesta do diagnóstico — e é, por si só, evidência de que a prova é real e não decorativa.

## Revisão security-and-hardening (sem gatilho docs/07 §7 — justificativa)

- [x] **Sem gatilho:** o change não toca entrada de usuário, autenticação/autorização, dados de paciente, integrações externas ou segredos — é tooling de dev (hook git + config de lint). `--no-verify` continua disponível por desenho; a nota do docs/07 declara o CI como gate autoritativo, e o Gitleaks do CI varre o que eventualmente escapar localmente.
- [x] **Segredos:** nenhum segredo/token no hook ou config; `package.json`/lockfile apenas com devDeps públicas (husky, lint-staged).
- [x] **Escopo de arquivos:** lint-staged só atua em `.ts`/`.tsx` dentro de `frontend/` (glob explícito) — nenhum outro arquivo é tocado no pre-commit.

## Revisão code-review-and-quality (5 eixos)

- **Correção:** comportamento provado executavelmente nos dois caminhos (corrige+passa; barra). `prepare: husky` ativa em todo `pnpm install` (visto no log do install durante a recuperação do node_modules).
- **Legibilidade:** hook de 1 linha; config com comentário explicando CWD/paths; normalização tolerante a caminhos raiz-relativos e absolutos.
- **Arquitetura:** toda lógica na config versionada (hook fino); escopo limitado a `frontend/` (onde moram lint/prettier); typecheck/testes fora do hook por desenho (velocidade, CI é autoritativo).
- **Segurança:** sem achados (sem gatilho).
- **Performance:** hook em ~2s para 1 arquivo (medição prática na prova); sem typecheck/testes no caminho do commit.
- **Achados:** nenhum Critical/Required. *FYI:* ajustes 1–3 acima documentados; clones existentes precisam de um `pnpm install` (nota no docs/07).
- **Veredito:** Aprovado.

## Aplicação da seção 13 (registro de aplicados e dispensas)

- **Aplicado — prova executável do hook (RED→GREEN, no lugar de unitários):** RED sem hook (commit sujo passa), GREEN com hook (corrige corrigível; barra não-corrigível) — os três cenários do spec delta executados de verdade no fluxo git real.
- **Aplicado — integração:** hook instalado via `pnpm install` (`prepare`) e disparando em cada commit da branch (saída registrada).
- **Dispensado — OWASP/contrato/schema:** sem entrada de usuário, sem dado sensível, sem fronteira de dados (tooling puro).
- **Dispensado — mutation/E2E/carga (parcimônia):** sem lógica de negócio; jornada do usuário final não é exercida aqui.
- **Exceção docs/07 §4 registrada:** task 2.1 é documentação pura (nota no docs/07) — sem comportamento novo; registrada na própria task.

## Gates executados (task 2.2)

- `pnpm lint` — passou (0 erros; 1 warning pre-existente em `stryker.config.mjs`, fora do escopo)
- `pnpm format` — passou (todos os arquivos no estilo Prettier)
- `pnpm typecheck` — passou (após `pnpm install` restaurar o node_modules do workspace tocado pelo `pnpm add -w`)
- `pnpm test` — 12 arquivos, 98 testes, cobertura **100%** (162/162 stmts, 117/117 branches, 49/49 funcs, 150/150 lines) — inalterada por este change
- `pnpm build` — passou (rotas estáticas/SSG inalteradas)
- `openspec validate --changes` — 1 passed, 0 failed (`change/instalar-husky-lint-staged`)

## TDD (docs/07 §4)

- [x] RED comprovado antes do GREEN (prova executável: commit sujo passando sem hook antes de qualquer código do hook existir); nenhuma exceção usada para o hook (a única exceção registrada é da task 2.1, documentação pura).

## Backlog

- [x] `docs/product/08-backlog-produto.md` **não precisa de alteração** — change de tooling sem Use Case correspondente (conforme design/proposal); nenhum UC reflete lint/formatação.

## Nota de follow-up

- Lacuna conhecida fora do escopo (registrada no change `pagina-blog`): o catálogo (`/tratamentos/[slug]`) chama `notFound()` sem 404 customizada — segue no backlog de dívida documentada, sem relação com este change.
