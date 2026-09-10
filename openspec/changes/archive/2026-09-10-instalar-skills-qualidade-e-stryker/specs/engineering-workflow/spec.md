## ADDED Requirements

### Requirement: Ferramenta concreta de mutation testing

A seção 13 do docs/07 SHALL referenciar Stryker Mutator como ferramenta concreta de mutation testing (`npx stryker run` no workspace frontend, meta de mutation score 80%), com a decisão registrada de que mutation NÃO integra o CI nem os gates ainda.

#### Scenario: Leitura do padrão de mutation

- **WHEN** alguém lê o item de mutation testing na seção 13
- **THEN** encontra ferramenta, comando, meta e a decisão de não integração ao CI

### Requirement: Cobertura de contrato/schema e princípios via skills instaladas

A seção 13 do docs/07 SHALL anotar testes de contrato/schema como cobertos via skill `api-and-interface-design` (a aplicar quando `contracts/` nascer) e SHALL conter nota curta formalizando KISS/YAGNI via `code-simplification` e registrando SOLID como coberto pelo eixo Arquitetura de `code-review-and-quality` (decisão consciente, sem checklist dedicado); o mapeamento em `AGENTS.md` (seção 12) SHALL incluir as duas linhas correspondentes.

#### Scenario: Contrato futuro

- **WHEN** `contracts/` for desenhado
- **THEN** o mapeamento indica `api-and-interface-design` como skill obrigatória

#### Scenario: Diff maior que o necessário

- **WHEN** um diff parece maior que o necessário antes da revisão
- **THEN** o mapeamento indica `code-simplification` antes de `code-review-and-quality`
