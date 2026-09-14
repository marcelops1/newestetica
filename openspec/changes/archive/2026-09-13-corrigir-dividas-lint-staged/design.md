## Context

Ver `proposal.md` (Why) e `specs/engineering-workflow/spec.md` (WHAT). Ponto de partida: `lint-staged.config.mjs` (função por glob-key `"frontend/**/*.{ts,tsx}"`, comandos `pnpm -C frontend exec eslint --fix/prettier --write`, provado executavelmente no change de origem); scripts raiz `lint`/`format` delegam 100% ao `frontend/` (sem cobertura da raiz); raiz sem binários/configs próprios de eslint/prettier, com Node >=24 (stdlib `node --check` disponível) e binário do prettier no workspace frontend; git hooks com CWD na raiz. Restrições: docs/07 §6 (DoD), §9 (branch `chore/`, Conventional Commits), AGENTS.md §7 (processo igual para qualquer modelo).

## Goals / Non-Goals

**Goals:**

- Commit de deleção legítima nunca barrado por path fantasma no hook.
- `lint-staged.config.mjs` sob os mesmos gates que guarda (sintaxe + estilo), sem custo de manutenção novo.
- Prova executável RED→GREEN da dívida 1 (sem exceção §4).

**Non-Goals:**

- Novas dependências, novas configs de lint/format, mudança no CI (coberto via scripts da raiz), typecheck/testes no hook.

## Aplicação da seção 13 (tipos de teste que se aplicam)

| Tipo (docs/07 §13) | Aplica? | Como |
|---|---|---|
| Prova executável do hook — dívida 1 (RED→GREEN, sem exceção §4) | **Sim (sempre — comportamento executável)** | RED: stagear deleção de scratch e commitar → hook falha em path inexistente; GREEN: com o filtro, o mesmo commit passa; mais o caso misto (deleção + erro real continua barrando) |
| Prova executável do wiring — dívida 2 | **Sim (parcial — config, mas verificável executavelmente)** | Sujar formatação/sintaxe do `.mjs` temporariamente → `pnpm format`/`pnpm lint` falham; restaurar → passam. Se confirmado como só-configuração sem lógica nova, a exceção §4 pode ser invocada com registro — mas a prova executável é barata e preferível; o apply decide com honestidade |
| OWASP/contrato/schema | Não — dispensado | Sem entrada de usuário, sem dado sensível, sem fronteira de dados (tooling puro); sem gatilho §7 |
| Mutation/E2E/carga | Não (parcimônia) | Sem lógica de negócio |

## Decisions

### 1. Dívida 1: filtro `fs.existsSync` dentro da função da config (antes do glob-match efetivo)

Rationale: o ponto exato da falha é passar path fantasma às ferramentas; filtrar na fonte (lista recebida → só existentes → glob/match/normalização como hoje) resolve para eslint **e** prettier de uma vez, sem tocar hook, sem tocar comandos. `fs.existsSync` resolve relativo ao CWD (= raiz no hook) e aceita absoluto — mesma robustez da normalização atual.
Alternativas consideradas: `--no-warn-ignored`/flags das ferramentas (rejeitado: depende de semântica de exit de cada ferramenta, frágil); tratar no hook shell (rejeitado: lógica fora da config versionada/testável); ignorar a dívida (rejeitado: risco real de barrar deleção legítima).

### 2. Dívida 2: estender os scripts raiz existentes — `node --check` + prettier do frontend (opção mais simples)

Rationale (pedido explícito de escolher a mais simples): zero dependência nova, zero config nova, zero mudança no CI.
- `lint` (raiz) += `node --check lint-staged.config.mjs` — sintaxe é o que quebraria **todos** os commits se regredir; stdlib, instantâneo.
- `format` (raiz) += `pnpm --filter frontend exec prettier --check ../lint-staged.config.mjs` — estilo com os mesmos defaults que o frontend usa (raiz não tem config prettier, então defaults — idêntico ao comportamento atual dos arquivos do frontend).
Alternativas consideradas: (a) eslint+prettier como devDeps da raiz com configs próprias (rejeitado: duplica toolchain e manutenção por 1 arquivo de 21 linhas); (b) scripts separados `lint:root`/`format:root` + mudança no CI (rejeitado: dobra os pontos de chamada sem ganho — dobrar no script existente cobre o CI automaticamente); (c) deixar sem cobertura (rejeitado: é a própria dívida).

### 3. Prova com scratch descartável + `git reset`, mesmo ritual do change de origem

Rationale: provar no fluxo git real sem poluir o histórico (commits de prova desfeitos, scratch removido, árvore limpa ao final). O caso misto (deleção + erro real) prova que o filtro não virou "passe-livre".
Alternativas consideradas: provar só com `git stash`/dry-run (rejeitado: não exercita o caminho real do hook).

## Risks / Trade-offs

- [Risco] A aresta da deleção nem existir (lint-staged já filtrar deletados sozinho) → Mitigação: a task RED prova primeiro; se o commit de deleção já passar sem correção, registra-se o achado (dívida inexistente na prática), remove-se a task GREEN correspondente e fecha-se só a dívida 2 — sem inventar correção.
- [Risco] `fs.existsSync` com CWD diferente em algum ambiente → Mitigação: hook do git sempre roda com CWD na raiz; `path.resolve` ancora em `FRONTEND_DIR` absoluto como hoje.
- [Risco] `node --check` não validar imports/exports (só sintaxe) → Aceito conscientemente: o valor está em pegar o que quebraria todos os commits (sintaxe); semântica continua coberta por revisão + prova do hook.
- [Trade-off] `format` raiz passa a ter dois comandos encadeados (`&&`) — aceitável: falha do primeiro já reprova, mesma semântica do CI.

## Migration Plan

Dois arquivos alterados (`lint-staged.config.mjs`, `package.json` raiz) na branch `chore/corrigir-dividas-lint-staged`; nenhum `pnpm install` extra necessário (sem dependência nova). Rollback = reverter os dois arquivos.

## Open Questions

Nenhuma que mude spec, abordagem ou tasks. Se a prova RED da dívida 1 mostrar que a aresta não existe, o escopo encolhe (registrado no risco nº 1) em vez de crescer.
