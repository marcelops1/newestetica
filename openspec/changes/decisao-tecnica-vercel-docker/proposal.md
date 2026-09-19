# Change: decisao-tecnica-vercel-docker

## Why

O site público (Épico 1) está completo e pronto para deploy, mas duas decisões que orientam os próximos passos nunca foram registradas formalmente — violando a regra de `docs/architecture/04-decisoes-tecnicas.md` §17 ("toda nova decisão técnica relevante deve ser proposta via OpenSpec quando impactar arquitetura ou padrões, documentada com motivo e alternativas"): **Vercel** como plataforma de deploy do frontend e **Docker** como padrão de orquestração do ambiente do backend futuro. Sem registro, qualquer IA pode assumir — ou inventar — outro destino de deploy/infra.

## What Changes

- Registra em `docs/architecture/04-decisoes-tecnicas.md`, no formato vigente (Escolhido/Motivos/Implicações + alternativas rejeitadas):
  1. **Vercel** como plataforma de deploy do frontend Next.js — integração nativa, preview deployments por PR, simplicidade no estágio atual; rejeitados self-host e outras plataformas; implicações: variáveis de ambiente, domínio customizado quando houver, sem custo de infra própria agora.
  2. **Docker** como padrão de orquestração de ambiente para o backend futuro (Keycloak, PostgreSQL, NestJS) via `docker-compose` em `infra/` — paridade dev/prod, isolamento, facilita onboarding; implicações: `infra/docker/` segue vazio até o backend começar, **nenhuma implementação agora**.
- Atualiza a tabela de Stack (§2) com as duas linhas e a lista de "Decisões técnicas já tomadas" em `docs/product/05-estado-atual.md` (não há menção das decisões como pendentes — verificado por grep; o 05 ganha o registro como tomadas).
- Explicitamente fora: qualquer implementação (`docker-compose`, `vercel.json`, deploys), código, specs, backlog e outras decisões.

## Capabilities

### New Capabilities

- Nenhuma (registro de decisão, sem comportamento).

### Modified Capabilities

- Nenhuma (nenhum requirement muda; `skip_specs: true` — a spec `architecture-docs` cobre conteúdos de diagramas C4 e nota de manutenção, e nenhum SHALL é alterado por registrar Vercel/Docker em 04; avaliação detalhada no design).

## Impact

- `docs/architecture/04-decisoes-tecnicas.md` (tabela + 2 seções novas) e `docs/product/05-estado-atual.md` (2 bullets).
- Sem impacto em código, specs, contratos, mocks, dados ou CI.
