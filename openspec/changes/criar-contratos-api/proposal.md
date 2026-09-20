# Change: criar-contratos-api

## Why

A validação visual com a Fabiana liberou o Épico 4, e a ordem de entrega aprovada é contratos antes do backend (02 §11, 04 §10) — mas `contracts/` está vazio e nenhum formato de dado do site público tem contrato formal. Sem isso, o primeiro módulo NestJS nasceria sem fonte de verdade para validar payloads, e a troca dos mocks pela API real (Épico 5) seria feita no escuro. Criar os contratos **antes** de qualquer código de backend, espelhando os mocks que já existem e já foram validados.

## What Changes

- `contracts/` ganha pacote com schemas Zod + tipos inferidos para os bounded contexts que já têm equivalente mockado no frontend: Catálogo (procedimentos), Agendamento (solicitação de booking + slots de disponibilidade) e Conteúdo Público (depoimentos, antes/depois, posts do blog, contato, orçamento, quiz/contato institucional).
- Cada schema tem teste de contrato provando que os mocks atuais do frontend (`frontend/lib/mocks/*`, `booking.ts`, `quote.ts`, `contact.ts`) são compatíveis — divergência, se houver, é mapeada explicitamente (exigência já prevista na spec `mock-data`).
- Identidade e Acesso, Pacientes, Atendimento/Histórico e Financeiro Básico ficam **fora**: nascem com os módulos NestJS correspondentes (Feature 4.2), quando houver mock ou caso de uso real para espelhar — nenhum contrato é inventado sem equivalente observável.
- Explicitamente fora: qualquer código de backend (NestJS, controllers, persistência), Keycloak/2FA, migração do frontend para a API real (Épico 5), specs de produto, backlog/05 além da atualização de status do Use Case 4.1.1.

## Capabilities

### New Capabilities

- `api-contracts`: contratos de API versionados em `contracts/` (schemas Zod + tipos) para Catálogo, Agendamento e Conteúdo Público, com testes de contrato contra os mocks vigentes — ver `specs/api-contracts/spec.md`.

### Modified Capabilities

- Nenhuma (nenhum requirement existente muda; a spec `mock-data` já prevê este momento — o cenário "contrato definido → mocks compatíveis ou divergência mapeada" é satisfeito, não alterado).

## Impact

- Novos: `contracts/package.json`, `contracts/tsconfig*.json` (se o padrão do monorepo exigir), `contracts/src/<context>/*.ts` (schemas + tipos), `contracts/src/<context>/*.test.ts` (testes de contrato contra os mocks), `specs/api-contracts/spec.md`.
- Nova dependência: `zod` no pacote `contracts` (única dependência de runtime; sem duplicar definição entre validação e tipo via `z.infer`).
- Editados: `docs/product/08-backlog-produto.md` (status do Use Case 4.1.1), `pnpm-workspace.yaml` somente se o glob atual não cobrir (hoje já lista `contracts`).
- Sem impacto em código de produto do frontend (nenhum import trocado nesta change), backend, specs de produto existentes, mocks ou dados.
