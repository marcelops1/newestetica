# Change: corrigir-vulnerabilidades-dependencias-2

## Why

O passo "Auditoria de dependências" do CI (`pnpm audit --audit-level high`, dentro do job obrigatório `quality gates`) reprova em toda a `main` por advisories publicados depois dos merges anteriores: 3 advisories high novos (4 high no total, 1 já ignorado). É o mesmo padrão do change `corrigir-vulnerabilidades-dependencias` (2026-10-04) — a auditoria quebra a main por advisories publicados após o merge das correções. Com o gate vermelho, nenhum PR mergeia.

Advisories:

1. `next >=16.0.0 <16.3.8`: SSRF no Image Optimization (GHSA-cjq9-62q9-8jv4). Caminho: frontend > next@16.3.6. Corrigido em >=16.3.8. **O frontend não usa `next/image`** (confirmado por `rg` — zero ocorrências fora de node_modules), mas o gate exige a correção.
2. `sharp <0.35.5` (GHSA-wq5f-xc86-pv6w), caminho: frontend > next@16.3.6 > sharp@0.35.4. Corrigido em >=0.35.5. Transitório, só usado por next/image — que o frontend não usa.
3. `source-map-js >=1.0.0 <1.2.2` (GHSA-68fv-2mgg-jv7q), caminhos via postcss/@prisma (32+ paths, incluindo o backend). Corrigido em >=1.2.2.

`braces` segue ignorado por `auditConfig.ignoreGhsas` (aceite formal já registrado em `docs/security/03-seguranca.md` §12) — não mexer.

## What Changes

- Sobe `next` e `eslint-config-next` de `16.3.6` para `16.3.8` no frontend (versões fixas, sem `^`, como hoje), cobrindo os advisories 1 e 2. Após o install, verificar se `sharp` resolving em `>=0.35.5` (a versão nova do next deve trazê-lo); só adicionar override `sharp@<0.35.5` → `^0.35.5` se ainda restar versão vulnerável — override disjunto, no estilo dos existentes (`deepmerge-ts`, `mysql2`).
- Override `source-map-js@<1.2.2` → `^1.2.2` na raiz (advisory 3), mesmo estilo.
- Prova executável: `pnpm audit --audit-level high` com exit 0 (antes: exit 1) + confirmação por `pnpm why` de que nenhuma versão vulnerável restou nos 3 pacotes.
- Gates completos nos 3 workspaces (lint, format, typecheck, test, build) — backend com `make up` e `make down` no fim; frontend 15/109 e backend 85/394 iguais ao baseline. Advisories moderate não bloqueiam o gate: listados como pendência no verification.md.
- Nenhum comportamento de produto muda: só versões resolvidas no lockfile, sem alteração de código.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

Nenhuma — `skip_specs: true` (ver justificativa abaixo).

**Justificativa do `skip_specs`:** specs descrevem comportamento observável do produto; este change altera apenas versões resolvidas de dependências diretas/transitórias, sem mudar nenhum comportamento, fluxo, escopo ou funcionalidade. Inventar um requirement para satisfazer a validação seria burla do processo. A garantia é o gate do CI passando (`pnpm audit --audit-level high` com saída 0) mais os gates de build/teste verdes nos três workspaces — mesmo critério do change anterior já arquivado.

## Impact

- `frontend/package.json` (`next`, `eslint-config-next` 16.3.6 → 16.3.8) + `pnpm-lock.yaml`.
- `package.json` (raiz: `overrides` de `source-map-js`, e de `sharp` **apenas se** o install não resolver sozinho).
- `docs/engineering/07-workflow-de-engenharia.md` §14 (somente se houver aprendizado novo: auditoria quebrando a main por advisories publicados após os merges — registrar o padrão de recorrência).
- Nenhum código de produto, mock ou contrato alterado; C4 intocado; CI intocado.
