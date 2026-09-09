## ADDED Requirements

### Requirement: Template de PR com checklist

`.github/pull_request_template.md` SHALL conter um checklist com estes itens: gates locais (lint, format, typecheck, test, build); TDD (task de teste RED antes da implementação, ou exceção docs/07 §4 registrada); gatilho de segurança (docs/07 §7) avaliado e registrado em `verification.md`; `docs/product/08-backlog-produto.md` atualizado quando aplicável; pergunta C2/C3 (o change alterou containers ou componentes? se sim, `docs/architecture/c2-container.md` e/ou `c3-component.md` atualizados); archive com specs sincronizadas.

#### Scenario: PR aberto já contém o checklist

- **WHEN** alguém abre um pull request no repositório
- **THEN** o corpo do PR já contém o checklist preenchível, sem precisar copiar de outro lugar

#### Scenario: Change que alterou camada não esquece o C4

- **WHEN** um change alterou containers ou componentes do frontend/backend
- **THEN** o item C2/C3 do checklist exige que `docs/architecture/c2-container.md` e/ou `c3-component.md` tenham sido atualizados antes do merge

### Requirement: DoD referencia o checklist do PR

A Definition of Done em `docs/engineering/07-workflow-de-engenharia.md` (seção 6) SHALL referenciar o checklist do PR como o mecanismo que a torna auto-verificável no momento da abertura do PR.

#### Scenario: Definition of Done aponta para o checklist

- **WHEN** alguém lê a Definition of Done (docs/07, seção 6)
- **THEN** encontra a referência ao checklist do PR como mecanismo auto-verificável na abertura do PR
