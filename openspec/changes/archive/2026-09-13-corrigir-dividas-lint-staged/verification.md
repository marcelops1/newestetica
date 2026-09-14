# Verificação — corrigir-dividas-lint-staged

Change de tooling (sem gatilho docs/07 §7 — sem entrada de usuário, autenticação, dado de paciente ou integração; registro mantido conforme a regra "registro obrigatório para liberar o archive") + revisão com `code-review-and-quality`. Data: 2026-09-13.

## Dívida 1 — saída honrosa (a aresta não existe; a tese do spec foi provada, não a correção)

- **Deleção pura (task 1.1):** scratch limpo commitado (`4f76a27`) → `git rm` (deleção staged) → commit da deleção → **PASSOU**: `lint-staged could not find any staged files.` + `EXIT_COMMIT=0` (commit `8141187` criado). O lint-staged v17 já exclui caminhos deletados sozinho — a dívida 1 **não existe na prática**.
- **Caso misto (validação da tolerância):** deleção staged + arquivo existente com erro real (`react/no-unescaped-entities`, 2 errors) → hook lintou **só o arquivo existente** (o path deletado nunca foi invocado) e **barrou** o commit: `husky - pre-commit script failed (code 1)`, `EXIT_COMMIT=1`, HEAD permaneceu `c30766a`. A tolerância do lint-staged **não é passe-livre**.
- **Desfecho:** task 1.2 REMOVIDA — nenhum filtro `fs.existsSync` foi adicionado sem problema real (YAGNI); spec delta ajustado para redação de comportamento (deleção passa; misto barra) e o requirement foi sincronizado assim no archive. 3 commits de prova desfeitos, árvore limpa de scratch.

## Dívida 2 — corrigida com prova executável (exceção §4 NÃO invocada)

- **RED (task 2.1):** com `lint-staged.config.mjs` temporariamente sujo (espaçamentos + const não-usada), `pnpm format` → **exit 0** e `pnpm lint` → **exit 0** — prova que a raiz não era coberta pelos gates. Arquivo restaurado.
- **GREEN (task 2.2):** scripts raiz estendidos — `lint` = `node --check lint-staged.config.mjs && pnpm --filter frontend lint`; `format` = `pnpm --filter frontend exec prettier --check ../lint-staged.config.mjs && pnpm --filter frontend format` (sem dependência nova, sem config nova, CI cobre automaticamente via scripts da raiz). Re-provas executáveis:
  - sujeira de **formatação** → `format` = **exit 1 (falha)**; `lint` = exit 0 (correto — `node --check` valida sintaxe, não estilo);
  - **sintaxe** quebrada (`import path from "node:path" {`) → `lint` = **exit 1 (falha)**;
  - arquivo restaurado → ambos exit 0.
- **Decisão de TDD:** prova executável mantida como teste — a exceção docs/07 §4 foi avaliada e **não invocada** (o wiring é executável e as provas já cobrem os dois ramos); registro explícito no lugar da exceção, conforme o critério da própria task.

## Revisão security-and-hardening (sem gatilho docs/07 §7 — justificativa)

- [x] **Sem gatilho:** tooling de dev (scripts de gate + config de hook); sem entrada de usuário, auth, dado de paciente, integração ou segredos. Gitleaks do CI inalterado.
- [x] **Segredos:** nenhum segredo/token introduzido; `package.json` só com wiring de scripts (zero dependência nova — lockfile intocado).

## Revisão code-review-and-quality (5 eixos)

- **Correção:** dívida 1 resolvida por constatação com prova (nada a corrigir — comportamento exigido pelo spec já se cumpre); dívida 2 com os dois ramos provados (estilo reprova format; sintaxe reprova lint).
- **Legibilidade:** `node --check` é stdlib e autoexplicativo; o prettier reutiliza o binário do frontend (mesmos defaults).
- **Arquitetura:** cobertura dos arquivos de tooling sem duplicar toolchain; CI passa a exigir via scripts da raiz que já roda; zero dependência nova (lockfile intocado).
- **Segurança:** sem achados (sem gatilho).
- **Performance:** `node --check` ≈ instantâneo; `prettier --check` de 1 arquivo ≈ ms — impacto de gate desprezível.
- **Achados:** nenhum Critical/Required. *FYI:* `node --check` não valida imports/semântica (limitação consciente, registrada no design); a saída honrosa da dívida 1 encolheu o escopo conforme previsto (design risco nº 1).
- **Veredito:** Aprovado.

## Aplicação da seção 13 (registro de aplicados e dispensas)

- **Aplicado — prova executável (both debts):** deleção pura (passa), caso misto (barra com erro real), formatação suja (format falha), sintaxe quebrada (lint falha), restaurado (ambos passam).
- **Aplicado — integração:** provas no fluxo git real com o hook ativo (pre-commit de produção).
- **Dispensado — OWASP/contrato/schema:** sem entrada de usuário, sem dado sensível, sem fronteira de dados (tooling puro).
- **Dispensado — mutation/E2E/carga (parcimônia):** sem lógica de negócio.
- **Exceção docs/07 §4:** avaliada e **não invocada** (prova executável cobriu o comportamento).

## Gates executados (task 3.1)

- `pnpm lint` — passou (0 erros; 1 warning pre-existente em `stryker.config.mjs`, fora do escopo)
- `pnpm format` — passou (incluindo o novo `--check` do `.mjs` da raiz)
- `pnpm typecheck` — passou (`tsc --noEmit`)
- `pnpm test` — 12 arquivos, 98 testes, cobertura **100%** (162/162 stmts, 117/117 branches, 49/49 funcs, 150/150 lines) — inalterada
- `pnpm build` — passou (rotas estáticas/SSG inalteradas)
- `openspec validate --changes` — 1 passed, 0 failed (`change/corrigir-dividas-lint-staged`)

## TDD (docs/07 §4)

- [x] Dívida 1: RED executado — e a constatação foi a **saída honrosa** (commit de deleção já passa; a correção planejada foi removida em vez de inventada); caso misto provado. [x] Dívida 2: RED real antes do GREEN, nos dois ramos. Nenhuma exceção invocada.

## Backlog

- [x] `docs/product/08-backlog-produto.md` **não precisa de alteração** — tooling sem Use Case correspondente (mesma decisão do change de origem).
