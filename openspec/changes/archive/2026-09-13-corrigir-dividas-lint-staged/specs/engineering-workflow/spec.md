## ADDED Requirements

### Requirement: Hook pre-commit tolerante a deleções no stage

Quando o stage contiver deleção de arquivo `.ts`/`.tsx` de `frontend/`, o hook SHALL passar o commit de deleção sem erro espúrio — paths que não existem mais em disco SHALL NOT ser enviados ao eslint/prettier — e arquivos existentes staged SHALL continuar passando por `eslint --fix` + `prettier --write` normalmente, de modo que um commit que só deleta arquivos (ou deleta entre outros) bata no hook apenas sobre o que existe.

#### Scenario: Commit só de deleção passa pelo hook

- **WHEN** um arquivo `.ts` de `frontend/` é deletado, stageado e commitado
- **THEN** o hook não tenta lintar o caminho inexistente e o commit é criado com sucesso

#### Scenario: Deleção mista com arquivo sujo continua barrando

- **WHEN** o stage contém uma deleção e, ao mesmo tempo, um arquivo existente com erro não-corrigível
- **THEN** o hook ignora o caminho deletado, reprova no arquivo existente e barra o commit

### Requirement: Gates da raiz cobrem arquivos de tooling da raiz

Os scripts `lint` e `format` da raiz SHALL cobrir `lint-staged.config.mjs`: `lint` SHALL validar a sintaxe do arquivo (falha se o arquivo não parses como módulo JS) e `format` SHALL exigir o estilo Prettier nele (falha se fora do estilo) — sem nova dependência e sem config nova, reaproveitando stdlib (`node --check`) e o binário do prettier do workspace frontend; o CI passa a exigir isso automaticamente por rodar os scripts da raiz.

#### Scenario: Config com erro de sintaxe reprova o gate

- **WHEN** `lint-staged.config.mjs` contém erro de sintaxe
- **THEN** `pnpm lint` (raiz) falha com código diferente de zero

#### Scenario: Config fora do estilo reprova o gate

- **WHEN** `lint-staged.config.mjs` está fora do estilo Prettier
- **THEN** `pnpm format` (raiz) falha com código diferente de zero
