## MODIFIED Requirements

### Requirement: Hook pre-commit local com lint-staged

O repositório SHALL ter hook pre-commit (husky) que roda lint-staged sobre arquivos `.ts`/`.tsx` staged dentro de `frontend/`, arquivos `.ts` staged dentro de `backend/` (excluindo `backend/src/generated/**`, código Prisma gerado) e arquivos `.ts` staged dentro de `contracts/`: erros de lint/formatação corrigíveis automaticamente SHALL ser corrigidos e incluídos no commit; erro que o `--fix` não resolve sozinho SHALL falhar o hook e barrar o commit (código de saída diferente de zero, nada commitado). Cada pasta SHALL ser lintada com seu próprio config (CWD da pasta via `pnpm -C <pasta> exec`, caminhos relativos à pasta). O pre-commit SHALL NOT substituir o CI nem o branch protection — as três camadas (pre-commit local, CI, branch protection) SHALL estar descritas em `docs/engineering/07-workflow-de-engenharia.md` como defesas independentes, com o CI como gate autoritativo.

#### Scenario: Arquivo sujo corrigível é corrigido no commit

- **WHEN** um arquivo staged contém apenas erro de lint/formatação corrigível automaticamente
- **THEN** o hook corrige o arquivo, o commit é criado com o conteúdo corrigido e o comando sai com zero

#### Scenario: Erro não-corrigível barra o commit

- **WHEN** um arquivo staged contém erro que o `--fix` não resolve sozinho
- **THEN** o hook falha, o commit é barrado e nada é commitado

#### Scenario: Bypass local não dispensa o CI

- **WHEN** um commit é criado com `--no-verify`
- **THEN** o commit local é criado, e o CI continua exigindo gates verdes no push/PR como condição de merge

#### Scenario: Arquivo backend sujo passa pelo hook

- **WHEN** um arquivo `.ts` de `backend/` (fora de `src/generated/`) é stageado com erro de lint/formatação
- **THEN** o hook o linta com o config do backend (`pnpm -C backend exec`), corrigindo o corrigível ou barrando o não-corrigível

#### Scenario: Arquivo contracts sujo passa pelo hook

- **WHEN** um arquivo `.ts` de `contracts/` é stageado com erro de lint/formatação
- **THEN** o hook o linta com o config de contracts (`pnpm -C contracts exec`), corrigindo o corrigível ou barrando o não-corrigível

#### Scenario: Código gerado do Prisma é ignorado pelo hook

- **WHEN** o stage contém apenas arquivos sob `backend/src/generated/`
- **THEN** o hook não tenta lintar nem formatar esses caminhos (o commit passa pelo hook sem invocação do eslint/prettier sobre eles)
