# Change: instalar-husky-lint-staged

## Why

Hoje lint e format só são verificados manualmente (via prompt) na etapa Apply e depois pelo CI: nada impede localmente a criação de um commit com erro de lint/formatação, e o feedback chega tarde (só no push/PR). Uma terceira camada de defesa local — pre-commit → CI → branch protection — dá feedback em segundos, antes do commit sequer existir.

## What Changes

- Instala `husky` + `lint-staged` como devDependencies na raiz do monorepo (com `prepare: husky` para ativar os hooks no `pnpm install`).
- Cria o hook `.husky/pre-commit` que roda o `lint-staged` sobre arquivos `.ts`/`.tsx` staged dentro de `frontend/`.
- Configura o `lint-staged` (config em função na raiz, com normalização de caminhos) para rodar `eslint --fix` e `prettier --write` via `pnpm --filter frontend exec`: erros corrigíveis são corrigidos e incluídos no commit; erro que o `--fix` não resolve sozinho falha o hook e barra o commit.
- Atualiza `docs/engineering/07-workflow-de-engenharia.md` com nota sobre as três camadas de defesa (pre-commit local, CI, branch protection), deixando claro que o pre-commit **não substitui** as outras duas (é burlável via `--no-verify`; o CI continua sendo o gate autoritativo).
- Prova executável real do comportamento (sem exceção docs/07 §4 — o hook é comportamento executável): sujar arquivo de propósito com erro corrigível e com erro não-corrigível, tentar commitar os dois casos e comprovar que o hook corrige o primeiro e barra o segundo (com limpeza do scratch ao final).
- Branch do change: `chore/instalar-husky-lint-staged` (docs/07 §9: `chore/` para decisão técnica/infra).

## Capabilities

### New Capabilities

- Nenhuma (camada nova dentro de capability existente).

### Modified Capabilities

- `engineering-workflow`: ADDED — hook pre-commit local com lint-staged (terceira camada de defesa, sem substituir CI/branch protection); MODIFIED — nenhum requirement existente muda.

## Impact

- Arquivos novos: `.husky/pre-commit`, `lint-staged.config.mjs` (raiz).
- Arquivos alterados: `package.json` (raiz: devDeps + script `prepare`), `pnpm-lock.yaml` (novas devDeps, revisável no PR), `docs/engineering/07-workflow-de-engenharia.md` (nota das três camadas).
- Nenhum código de produto, nenhum mock, nenhum contrato alterado; `docs/product/08-backlog-produto.md` NÃO muda (change sem impacto em produto/Use Case — sem UC correspondente, como tooling puro).
- Clones existentes precisam rodar `pnpm install` uma vez para ativar os hooks; rollback = remover hook + deps + config.
