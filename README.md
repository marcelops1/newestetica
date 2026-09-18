# Newestetica

Sistema completo para a clínica de estética da Fabiana Rosa, focado em mulheres de 40 a 60 anos.

O produto cobre o site público (apresentação, catálogo, agendamento, depoimentos, blog) e o painel administrativo (pacientes, agenda, procedimentos, histórico, financeiro básico e usuários).

## Visão rápida

- Público principal: mulheres 40–60 anos
- Tom: acolhedor, caloroso e empático
- Estratégia: Frontend-first com dados mockados → validação visual com a Fabiana → backend
- Stack: Next.js + NestJS + PostgreSQL + Keycloak
- Processo: Spec-Driven Development (OpenSpec) — inegociável

## O que existe hoje

- **Site público do Épico 1 completo com mocks** (10 rotas): Home (`/`), Catálogo (`/tratamentos` + detalhe por slug), Sobre (`/sobre`), Antes/Depois (`/antes-depois`), Depoimentos (`/depoimentos`), Orçamento (`/orcamento`), Contato (`/contato`) e Blog (`/blog` + artigo por slug) — com agendamento self-service via modal mockado, Header com drawer e navegação canônica única para Header e rodapé.
- **Qualidade**: 15 arquivos e 106 testes a 100% de cobertura; gates (`lint`, `format`, `typecheck`, `test`, `build`) em 3 camadas — pre-commit local (husky + lint-staged), CI (`.github/workflows/quality.yml` com auditoria e Gitleaks) e branch protection exigindo o check "quality gates".
- **OpenSpec**: 7 specs de domínio (72 requirements) e 24 changes arquivados (22 com specs sincronizadas); 19 PRs mergeados em `main`.
- **Ainda não existe**: validação visual com a Fabiana (pendente), backend real, Keycloak/2FA, contratos (`contracts/` vazio), tipos compartilhados (`shared/` vazio) e painel admin.

Consulte sempre `docs/product/05-estado-atual.md` para o status mais recente.

## Como rodar

Pré-requisitos: Node >= 24 e pnpm 9.15.0.

```bash
pnpm install
pnpm dev        # frontend em modo desenvolvimento
pnpm lint       # ESLint
pnpm format     # checagem Prettier
pnpm typecheck  # tsc --noEmit
pnpm test       # vitest com cobertura (threshold 80%)
pnpm build      # build de produção (Next.js)
```

## Documentação oficial

Antes de qualquer trabalho, leia nesta ordem (ver `AGENTS.md`):

1. `AGENTS.md` — regras obrigatórias para IAs e colaboradores
2. `docs/product/00-visao-do-produto.md`
3. `docs/product/01-persona-e-ux-40+.md`
4. `docs/architecture/02-arquitetura.md`
5. `docs/security/03-seguranca.md`
6. `docs/architecture/04-decisoes-tecnicas.md`
7. `docs/product/05-estado-atual.md`
8. `docs/product/06-design-system.md`
9. `docs/engineering/07-workflow-de-engenharia.md`

Backlog do produto: `docs/product/08-backlog-produto.md`.

## Estrutura do monorepo

```text
newestetica/
├── frontend/       # Next.js (site público + painel admin)
├── backend/        # NestJS (monolito modular — ainda sem código)
├── shared/         # Tipos e utilitários compartilhados (vazio por enquanto)
├── contracts/      # Contratos de API (vazio por enquanto)
├── infra/          # Docker, Keycloak, infra
├── openspec/       # Specs e changes (fonte da verdade)
└── docs/           # Documentação oficial
```

## Regras importantes

- Nenhuma implementação de produção sem passar pelo fluxo OpenSpec
- Frontend nasce com dados mockados
- Mobile-first e diretrizes de UX 40+ são obrigatórios
- Segurança e consentimento de fotos são requisitos de domínio

## Modelos de IA recomendados

Função: Orquestração / Planejamento → Modelo: GLM-5.3
Função: Codificação → Modelo: DeepSeek V4 Flash
Função: Revisão → Modelo: DeepSeek V4 Pro
Função: Bootstrap e organização inicial → Modelo: Muse Spark

O uso de outros modelos é permitido, desde que as regras do AGENTS.md e do OpenSpec sejam respeitadas.
