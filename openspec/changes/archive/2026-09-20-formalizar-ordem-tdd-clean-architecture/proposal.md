# Change: formalizar-ordem-tdd-clean-architecture

## Why

A regra de dependência da Clean Architecture está documentada (02 §7, `backend/AGENTS.md`), mas a ORDEM de construção com TDD por camada nunca foi formalizada — nada impede hoje que um módulo do backend nasça pelo banco (infra primeiro) e arraste regras de negócio para dentro do ORM. Com a Feature 4.2 à porta (um módulo por bounded context), essa ordem precisa virar regra permanente antes do primeiro módulo.

## What Changes

- Nova seção 15 em `docs/engineering/07-workflow-de-engenharia.md` ("Ordem de construção TDD por camada (Clean Architecture)"), após a seção 14, com referência cruzada na seção 6 (Definition of Done) e ajuste na seção de Referências se necessário.
- Conteúdo: princípio "o banco de dados é um detalhe"; ordem obrigatória Domain → Application → Infrastructure → Presentation, cada camada só começando com a anterior testada e verde; regra de bloqueio verificável nas tasks de Changes futuros de módulo backend.
- Explicitamente fora: qualquer código de produto, mudança em specs de produto, backlog/05, alteração da regra de dependência em si (02 §7 intacto).

## Capabilities

### New Capabilities

- Nenhuma (regra de processo, sem capability de produto).

### Modified Capabilities

- Nenhuma (nenhum requirement existente muda de comportamento).

## Impact

- Novo: seção 15 em `docs/engineering/07-workflow-de-engenharia.md` + `verification.md` do change com as revisões.
- Editados: seção 6 (referência cruzada) e seção de Referências do 07, se necessário.
- `skip_specs: true` (precedente: `formalizar-padroes-backend-e-ia`, que formalizou a regra de dependência sem delta de spec).
- Sem impacto em código, specs de produto, mocks, contratos ou dados.
