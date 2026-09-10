# Verificação — instalar-skills-qualidade-e-stryker

Avaliação contra `docs/security/03-seguranca.md` e docs/07 §7. Data: 2026-09-10.

## Gatilhos de docs/07 §7

**Sem gatilho direto.** Instalação de tooling/docs: skills de terceiros copiadas fiéis (Markdown), devDependencies, config e edições em AGENTS.md/docs-07. Sem código de produto, sem entrada de usuário, sem auth, sem dado de paciente, sem integração, sem segredos.

## Supply chain (security-and-hardening)

- [x] Dois pacotes novos (`@stryker-mutator/core`, `@stryker-mutator/vitest-runner`) entram como devDependencies, via `pnpm --filter frontend add -D` — instalação auditada pelo gerenciador nativo; lockfile da raiz commitado (`pnpm-lock.yaml`, +1136 linhas de resolução).
- [x] CI preserva o lockfile e roda auditoria/varredura (`.github/workflows/quality.yml` intocado — `git diff main --stat -- .github/` vazio e `grep stryker .github/` sem resultados: mutation FORA do CI por decisão registrada).
- [x] `pnpm install` concluiu sem erro e `stryker --version` responde `10.0.0` (compatível com Vitest 5 — risco do design.md resolvido).

## Fidelidade das skills

- [x] 4 cópias (`api-and-interface-design`, `code-simplification` × `.opencode/skills/` e `.agents/skills/`) idênticas à origem (raw.githubusercontent.com/main) — `diff` byte a byte sem divergências.

## Gates executados (task 2.1)

- `pnpm lint` — passou
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 6 arquivos, 26 testes, cobertura 100% (statements/branches/functions/lines)
- `pnpm build` — passou (`Compiled successfully`)
- `openspec validate --all` — 8 passed, 0 failed (INFO pré-existente em `public-site-structure`)

Nada quebrou com as devDependencies do Stryker (gates todos verdes após `pnpm install`).

## Decisões registradas

- Mutation FORA do CI e do script `test` (docs/07 §13; `grep -r stryker .github/` vazio confirma).
- SOLID sem checklist dedicado — decisão consciente, coberto pelo eixo Arquitetura de `code-review-and-quality` (nota na §13).
