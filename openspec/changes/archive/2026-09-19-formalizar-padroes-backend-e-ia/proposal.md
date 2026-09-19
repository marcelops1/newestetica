# Change: formalizar-padroes-backend-e-ia

## Why

Antes de iniciar o Épico 4 (Backend), quatro pilares estão implícitos ou dispersos e precisam de registro explícito: (1) as camadas `domain/application/infrastructure/presentation` existem em 02 §7 e `backend/AGENTS.md`, mas sem o nome "Clean Architecture" nem a regra de dependência escrita; (2) testes de Integração e Contrato para backend não detalham o *como* (Testcontainers/banco real via Docker — já decidido em 04 §19); (3) testes Adversariais não existem como categoria própria, só diluídos em OWASP; (4) não há mecanismo declarado para saber se os prompts de desenvolvimento continuam funcionando bem quando o modelo muda (a escolha de modelo é livre por AGENTS.md §7). Registrar agora evita decisões implícitas divergentes quando o backend começar.

## What Changes

- `docs/architecture/02-arquitetura.md` (§7) e `backend/AGENTS.md`: nomeiam "Clean Architecture" e a regra de dependência (`domain/` não importa nada externo; `application/` depende só de `domain/`; `infrastructure/` implementa interfaces do `domain/`, nunca o inverso; `presentation/` depende de `application/`).
- `docs/engineering/07-workflow-de-engenharia.md` §13: detalha Integração e Contrato para backend (PostgreSQL real em container via Docker Compose, decisão 04 §19; contratos via `api-and-interface-design` quando `contracts/` nascer) e adiciona "Testes Adversariais" como subcategoria explícita de segurança.
- Nova seção 14 no docs/07 ("Regressão de prompts de desenvolvimento", ao final — sem renumeração: Referências é o §12, não o último): formaliza que a pipeline de revisão em estágios já cumpre parcialmente o papel, de forma **agnóstica de modelo** (nenhum nome de modelo como parte da regra); prática leve com registro seed de padrões que funcionaram e sinais de degradação (sem automação agora).
- `docs/product/08-backlog-produto.md`: uma linha na intro da Feature 4.2 estendendo a arquitetura exigida com a regra de dependência (cobre os 7 UCs sem editar um a um).
- Explicitamente fora: qualquer código de backend, specs, automação de prompt-regression, reavaliação das decisões existentes.

## Capabilities

### New Capabilities

- Nenhuma (padrões de engenharia, sem comportamento de produto).

### Modified Capabilities

- Nenhuma (nenhum requirement muda; `skip_specs: true` — avaliação no design: nem `architecture-docs` nem `engineering-workflow` têm SHALL alterado).

## Impact

- `docs/architecture/02-arquitetura.md`, `backend/AGENTS.md`, `docs/engineering/07-workflow-de-engenharia.md` (§13 + §14 nova) e uma linha em `docs/product/08-backlog-produto.md`.
- Sem impacto em código, specs, contratos, mocks, dados ou CI (gates rodam como regressão).
