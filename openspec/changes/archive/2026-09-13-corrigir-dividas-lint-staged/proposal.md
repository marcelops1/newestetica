# Change: corrigir-dividas-lint-staged

## Why

A revisão do change `instalar-husky-lint-staged` (PR #16, aprovado) deixou 2 dívidas não-bloqueantes registradas: (1) o hook nunca foi testado com arquivo **deletado** no stage — risco real de barrar um commit de deleção legítima, com o eslint/prettier recebendo um path que não existe mais em disco; (2) o próprio `lint-staged.config.mjs` não é coberto pelos gates `pnpm lint`/`pnpm format` (que só enxergam `frontend/`), então a config que guarda todos os commits pode derivar sem checagem. Corrigir agora, com o contexto fresco, evita que a dívida vire incidente (commit legítimo barrado) ou deriva silenciosa.

## What Changes

- Dívida 1: filtro defensivo em `lint-staged.config.mjs` (`fs.existsSync`) para excluir do stage arquivos que não existem mais em disco antes de passá-los ao eslint/prettier — com prova executável RED→GREEN real (deletar arquivo staged e commitar: prova que quebra antes da correção e funciona depois).
- Dívida 2: wiring sem dependência nem config nova — root `lint` ganha `node --check lint-staged.config.mjs` (sintaxe, stdlib) e root `format` ganha `prettier --check` do `.mjs` via o binário do frontend; assim o CI passa a cobrir o arquivo automaticamente, sem mudar o CI. Decisão registrada no `design.md` (opção mais simples dentre as pedidas).
- Sem exceção docs/07 §4 para a dívida 1 (comportamento executável do hook); a dívida 2 usa exceção §4 se confirmada como só-configuração sem lógica nova (a decidir com a prova no apply — ver tasks).
- Branch do change: `chore/corrigir-dividas-lint-staged` (docs/07 §9: `chore/` para decisão técnica/infra).

## Capabilities

### New Capabilities

- Nenhuma (correções dentro de capability existente).

### Modified Capabilities

- `engineering-workflow`: ADDED — hook tolerante a deleções no stage + gates da raiz cobrindo arquivos de tooling da raiz; MODIFIED — nenhum requirement existente muda.

## Impact

- Arquivos alterados: `lint-staged.config.mjs` (filtro de existência), `package.json` (raiz: scripts `lint`/`format` estendidos, sem nova dependência).
- Nenhum código de produto, nenhum mock, nenhum contrato, nenhuma dependência nova, nenhum UC; `docs/product/08-backlog-produto.md` NÃO muda (tooling sem UC, como no change de origem); C4 intocado; CI intocado (coberto automaticamente pelos scripts da raiz).
- Rollback = reverter os dois arquivos.
