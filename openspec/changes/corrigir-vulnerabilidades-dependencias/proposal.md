# Change: corrigir-vulnerabilidades-dependencias

## Why

O passo "Auditoria de dependências" do CI (`pnpm audit --audit-level high`, dentro do job obrigatório `quality gates`) reprova em toda a `main` por advisories publicados depois do último merge: 12 vulnerabilidades (1 critical, 5 high, 6 moderate). Com o gate vermelho, nenhum PR — incluindo o do módulo Financeiro — consegue mergear.

## What Changes

- Sobe `next` e `eslint-config-next` de `16.3.4` para `16.3.6` no frontend (versões fixas, sem `^`, como hoje), corrigindo o RCE em `next/og` ImageResponse (critical, GHSA-vcvr-r3jv-pc5j). O frontend não usa `next/og` nem `ImageResponse` (confirmado por busca), mas o gate exige a correção.
- Adiciona `overrides` de `brace-expansion` na raiz mirando as duas linhas vulneráveis (1.x → `^1.1.20`, 5.x → `^5.0.11`), no mesmo estilo dos overrides já existentes (`deepmerge-ts`, `mysql2`).
- Ignora o advisory de `braces` (GHSA-vfj7-8cjw-p6xm, sem versão corrigida) de forma explícita e auditável na configuração do pnpm, com aceite formal de risco registrado em `docs/security/03-seguranca.md` (ID, justificativa e gatilho de revisão).
- Nenhum comportamento de produto muda: só versões resolvidas no lockfile, sem alteração de código.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

Nenhuma — `skip_specs: true` (ver justificativa abaixo).

**Justificativa do `skip_specs`:** specs descrevem comportamento observável do produto; este change altera apenas versões resolvidas de dependências transitórias/diretas, sem mudar nenhum comportamento, fluxo, escopo ou funcionalidade. Inventar um requirement para satisfazer a validação seria burla do processo (a própria instrução do CLI proíbe). A garantia é o gate do CI passando (`pnpm audit --audit-level high` com saída 0) mais os gates de build/teste verdes nos três workspaces.

## Impact

- `frontend/package.json` (`next`, `eslint-config-next` 16.3.4 → 16.3.6) + `pnpm-lock.yaml` (resolução nova).
- `package.json` (raiz: `overrides` de `brace-expansion`) ou `pnpm-workspace.yaml` (`auditConfig.ignoreGhsas` — o experimento do design decide o local efetivo na 9.15.0) + `pnpm-lock.yaml`.
- `docs/security/03-seguranca.md` (aceite formal de risco do `braces`).
- Sem impacto em código de produto, mocks, contratos, specs ou comportamento dos módulos.
