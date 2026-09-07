# Change: frontend-foundation-mocks

## Why

O projeto está na fase de documentação de fundação concluída (ver `docs/05-estado-atual.md`) e a estratégia aprovada é frontend-first com dados mockados para validação visual com a Fabiana Rosa antes de qualquer backend. Hoje a pasta `frontend/` contém apenas o `AGENTS.md` — não existe base executável. Este change planeja a fundação do frontend com mocks, sem implementar código ainda.

## What Changes

- Inicializar a base Next.js (App Router) + TypeScript + Tailwind na pasta `frontend/` do monorepo pnpm, com scripts e quality gates (lint, format, typecheck, testes, build).
- Criar a organização de pastas aprovada (`app/`, `components/`, `features/`, `lib/`, `styles/`) preparada para trocar mocks por API real com baixo impacto.
- Centralizar os tokens do Design System aprovado (cores, tipografia, espaçamento, radius/sombra) como fonte única de estilo.
- Estruturar as 9 seções do site público conforme o protótipo visual aprovado (Header, Hero, Simulador/quiz, Tratamentos, Resultados, Diferenciais, Depoimentos, CTA final, Footer), mobile-first e diretrizes UX 40+.
- Criar a camada de dados mockados (procedimentos, depoimentos, antes/depois, slots de agenda) respeitando consentimento e sem dados reais de pacientes.
- Explicitamente fora: backend real, Keycloak/2FA, banco de dados, e-mail transacional, integrações reais, pagamento, área logada da paciente.

## Capabilities

### New Capabilities

- `frontend-foundation`: base Next.js no monorepo — inicialização do app, estrutura de pastas, scripts e quality gates.
- `design-tokens`: tokens centralizados do Design System (cores, tipografia, espaçamento, radius/sombra/borda) e regras de uso.
- `public-site-structure`: estrutura das 9 seções do site público conforme protótipo aprovado, mobile-first, legibilidade e UX 40+.
- `mock-data`: camada de dados mockados do site público (catálogo, depoimentos, antes/depois, slots) com regras de consentimento, sem dados reais e preparada para troca pela API real.

### Modified Capabilities

- Nenhuma (ainda não existem specs aprovadas em `openspec/specs/`).

## Impact

- Afeta apenas a pasta `frontend/` (hoje contém só `AGENTS.md`) e nada do backend, contratos ou infra.
- Não altera comportamento existente (não há código de produto).
- Cria as primeiras specs de domínio em `openspec/specs/`, que passam a ser fonte da verdade para a fundação do frontend.
- Pré-requisito dos changes futuros de telas/fluxos e, depois da validação visual, dos contratos e do backend.
