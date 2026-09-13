## Context

Ver `proposal.md` (Why) e `specs/engineering-workflow/spec.md` (WHAT). Ponto de partida: raiz do monorepo com scripts que delegam ao `frontend/` (`lint` = `eslint .`, `format` = `prettier --check .`); CI `quality.yml` roda gates + auditoria + Gitleaks em push/PR (camada 2, autoritativa); sem `.husky`, sem `lint-staged`, sem config de eslint na raiz (o `eslint.config` mora em `frontend/`, e o ESLint resolve config a partir do CWD — detalhe que molda a decisão 2); pnpm 9.15.0 com workspace; hooks do git rodam com CWD na raiz do repo. Restrições: docs/07 §6 (DoD), §9 (branch `chore/`, Conventional Commits), AGENTS.md §7 (modelo livre, processo obrigatório — o hook deve funcionar igual para qualquer agente/modelo que commite).

## Goals / Non-Goals

**Goals:**

- Commit local com erro de lint/formatação corrigível sai corrigido; com erro não-corrigível nem chega a existir.
- Três camadas documentadas (pre-commit, CI, branch protection) com autoridade explícita do CI.
- Prova executável real do comportamento (sem exceção docs/07 §4).

**Non-Goals:**

- Rodar typecheck/testes/build no pre-commit (lentos; ficam no CI — o hook deve responder em segundos).
- Bloquear `--no-verify` (burlável por desenho; o CI cobre).
- Mudar gates, DoD existente, CI ou branch protection (só adicionar a nota das camadas ao docs/07).

## Aplicação da seção 13 (tipos de teste que se aplicam)

| Tipo (docs/07 §13) | Aplica? | Como |
|---|---|---|
| Unitários | Não (parcimônia) | Não há função de produto; o "código" é config + hook — o teste é a prova executável abaixo |
| Prova executável do hook (RED→GREEN, sem exceção §4) | **Sim (sempre — o hook é comportamento executável)** | RED: commitar scratch sujo SEM o hook e provar que passa; GREEN: com o hook, corrigível é corrigido e commit passa, não-corrigível barra o commit |
| OWASP/contrato | Não — dispensado | Sem entrada de usuário, sem dado sensível, sem fronteira de dados (tooling puro); revisão `security-and-hardening` recomendada mas sem gatilho §7 (registrar dispensa no Verify do apply) |
| Integração | **Sim (o próprio hook no fluxo git)** | Hook instalado via `pnpm install` (`prepare`) + tentativa real de commit nos dois casos |
| Mutation/E2E/carga | Não (parcimônia) | Sem lógica de negócio |

## Decisions

### 1. `husky` + `lint-staged` como devDeps da raiz (`pnpm add -D -w`), com `prepare: husky`

Rationale: dupla padrão do ecossistema para pre-commit em JS/TS; `husky init` cria `.husky/pre-commit` e o script `prepare` ativa os hooks em todo `pnpm install` — funciona igual para qualquer agente/modelo (AGENTS.md §7). Versão: latest estável no momento do apply (o lockfile fixa).
Alternativas consideradas: lefthook/simple-git-hooks (rejeitados: binário/config extra sem ganho); só CI (rejeitado: é exatamente a lacuna); hook shell puro sem lint-staged (rejeitado: reinventaria re-stage de arquivos corrigidos e seleção de staged).

### 2. Config `lint-staged.config.mjs` na raiz em forma de função, executando via `pnpm --filter frontend exec`

Rationale: o ESLint resolve config a partir do CWD e a config mora em `frontend/` — então os comandos precisam rodar com CWD em `frontend/` (o que `pnpm --filter frontend exec` garante), e os caminhos precisam ser relativos a `frontend/`. A forma de função normaliza os caminhos em código (`path.relative`), ficando robusta independente de como o lint-staged entrega os paths; chave de glob `"frontend/**/*.{ts,tsx}"` limita ao escopo do lint atual. Ordem: `eslint --fix` primeiro, `prettier --write` depois (o prettier dá o formato final).
Alternativas consideradas: chave estática no `package.json` da raiz (rejeitado: sem normalização de caminhos, quebra no problema CWD/config); config dentro de `frontend/` + `cd` no hook (rejeitado: duas configs e semântica de match fora da raiz); incluir typecheck/testes no hook (rejeitado: lentidão — Non-Goal).

### 3. Hook `.husky/pre-commit` mínimo delegando ao lint-staged

Rationale: hook fino (`pnpm exec lint-staged`) — toda a lógica mora na config versionada e testável; exit code do lint-staged barra o commit sozinho.
Alternativas consideradas: lógica shell no hook (rejeitado: intestável e frágil entre ambientes).

### 4. Nota das três camadas em `docs/engineering/07-workflow-de-engenharia.md` (junto à DoD, seção 6)

Rationale: o usuário pediu a nota na DoD ou seção própria — junto à DoD mantém a Definition of Done como fonte única do "quando está pronto", sem criar seção órfã. Conteúdo prescrito: (1) pre-commit local = feedback rápido, burlável, nunca fonte da verdade; (2) CI = gate autoritativo em push/PR; (3) branch protection = merge bloqueado sem CI verde.
Alternativas consideradas: seção nova isolada (rejeitado: fragmenta a fonte única).

## Risks / Trade-offs

- [Risco] Hooks só ativam para quem rodar `pnpm install` após o merge (clones/ambientes existentes) → Mitigação: nota no docs + CI continua autoritativo; nada quebra para quem não tem o hook.
- [Risco] Mecânica exata de paths do lint-staged divergir do previsto → Mitigação: a task de prova executável (RED→GREEN real) é a verdade — se a forma de função precisar de ajuste, o apply ajusta com a prova verde como critério.
- [Risco] Hook lento irritar e incentivar `--no-verify` → Mitigação: escopo mínimo (só `.ts`/`.tsx` staged de `frontend/`, só lint+format); typecheck/testes ficam no CI por desenho.
- [Trade-off] Novas devDeps + lockfile maior — aceitável: custo padrão de tooling, revisável no PR.

## Migration Plan

`pnpm add -D -w husky lint-staged` + `husky init` + arquivos de config/hook/docs na branch `chore/instalar-husky-lint-staged`; contribuidores existentes rodam `pnpm install` uma vez. Rollback = remover hook, config, deps e nota do docs/07.

## Open Questions

Nenhuma que mude spec, abordagem ou tasks. Versões exatas das devDeps saem do `pnpm add` no apply (lockfile fixa).
