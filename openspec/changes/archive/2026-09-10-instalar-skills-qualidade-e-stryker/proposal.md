# Change: instalar-skills-qualidade-e-stryker

## Why

Duas pesquisas concluíram lacunas sem dono no processo: (a) testes — contrato/schema e falha/resiliência sem skill que ensine, mutation sem ferramenta (change `padrao-testes-prioridade`); (b) princípios — KISS/YAGNI sem skill, SOLID só parcial no eixo Arquitetura de `code-review-and-quality`. `api-and-interface-design` cobre contrato-primeiro/testes de contrato/Hyrum/idempotência/resiliência; `code-simplification` cobre KISS/YAGNI (redução preservando comportamento exato, Cerca de Chesterton); Stryker + `@stryker-mutator/vitest-runner` casa com o stack (Vitest + TS). Este change instala os três e ancora na DoD — sem enforcement automático ainda. Substitui a proposta anterior `instalar-skill-api-design-e-stryker` (só proposta, nunca aplicada), incorporada aqui em escopo maior.

## What Changes

- Instala `api-and-interface-design` e `code-simplification` (cópia fiel de `skills/<nome>/SKILL.md` do repositório addyosmani/agent-skills, sem modificar conteúdo) em `.opencode/skills/<nome>/` e `.agents/skills/<nome>/`.
- Adiciona `@stryker-mutator/core` e `@stryker-mutator/vitest-runner` como devDependencies em `frontend/package.json`.
- Cria `frontend/stryker.config.mjs` (testRunner vitest, coverageAnalysis perTest, mutate `frontend/lib/**/*.ts` excluindo testes, thresholds high 80 / low 60 / break 50, reporters html + clear-text + progress).
- Script `"mutation": "stryker run"` em `frontend/package.json` — NÃO integrado ao CI nem ao script `test` ainda.
- `AGENTS.md` seção 12, +2 linhas:
  - Design de API/contrato/interface entre módulos → `api-and-interface-design` (sempre ao desenhar `contracts/` ou fronteira entre módulos do backend)
  - Simplificar após feature funcionar / revisar complexidade → `code-simplification` (KISS/YAGNI; sempre antes de `code-review-and-quality` quando o diff parecer maior que o necessário)
- docs/07 seção 13: mutation referencia Stryker (`npx stryker run`, meta de mutation score 80%, não integrado ao CI ainda); contrato/schema anotados como cobertos via `api-and-interface-design`, a aplicar quando `contracts/` nascer; nota curta: KISS/YAGNI formalizados via `code-simplification`; SOLID coberto pelo eixo Arquitetura de `code-review-and-quality` (sem checklist item-a-item dedicado — decisão consciente, não lacuna crítica).
- Explicitamente fora: integrar mutation ao CI/gates, mudar thresholds, checklist SOLID dedicado, criar skill nova de mutation.

## Capabilities

### New Capabilities

- Nenhuma (tooling + docs dentro de capability existente).

### Modified Capabilities

- `engineering-workflow`: MODIFIED — seção 13 ganha ferramenta de mutation, cobertura de contrato via skill instalada e nota KISS/YAGNI/SOLID; mapeamento de skills no AGENTS.md acompanha (+2 linhas).

## Impact

- Arquivos novos: 2 skills × 2 diretórios, `frontend/stryker.config.mjs`.
- Arquivos alterados: `frontend/package.json` (+2 devDeps, +1 script), `AGENTS.md` (§12, +2 linhas), docs/07 (§13, 3 trechos).
- Nenhum código de produto, gate, threshold ou CI tocado; `pnpm install` passa a baixar 2 pacotes dev.
- A proposta anterior `instalar-skill-api-design-e-stryker` (branch local, só proposta) é abandonada por incorporação.
