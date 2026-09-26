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

- **Site público do Épico 1 completo com mocks** (10 rotas): Home (`/`), Catálogo (`/tratamentos` + detalhe por slug), Sobre (`/sobre`), Antes/Depois (`/antes-depois`), Depoimentos (`/depoimentos`), Orçamento (`/orcamento`), Contato (`/contato`) e Blog (`/blog` + artigo por slug) — com agendamento self-service via modal mockado, Header com drawer e navegação canônica única para Header e rodapé; Blog e Contato têm acesso no rodapé e Orçamento como CTA "Pedir Orçamento" no Header (desktop + drawer).
- **Qualidade**: 15 arquivos e 109 testes a 100% de cobertura; gates (`lint`, `format`, `typecheck`, `test`, `build`) em 3 camadas — pre-commit local (husky + lint-staged), CI (`.github/workflows/quality.yml` com auditoria e Gitleaks) e branch protection exigindo o check "quality gates".
- **OpenSpec**: 8 specs de domínio (76 requirements) e 27 changes arquivados (23 com specs sincronizadas; 4 com `skip_specs`, incluindo este); 23 PRs mergeados em `main`.
- **Validação visual com a Fabiana**: concluída em 2026-09-19 — o Épico 4 (Backend) está liberado.
- **Ainda não existe**: backend real, Keycloak/2FA, contratos (`contracts/` vazio), tipos compartilhados (`shared/` vazio) e painel admin.

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

### Backend e documentação da API (Swagger)

O backend sobe com o stack local (`make up` — ver `Makefile`) e expõe a documentação da API:

- UI: <http://127.0.0.1:3001/docs>
- Schema OpenAPI: <http://127.0.0.1:3001/docs-json>

A documentação reflete **somente os módulos implementados até agora** (Agendamento, Catálogo, Conteúdo Público e Pacientes) e é gerada a partir dos contratos de `contracts/` — sem duplicar campos. As rotas de Pacientes aparecem marcadas como bloqueadas (`403 AUTH_NOT_IMPLEMENTED` do guard até o módulo de Identidade). Em produção, `/docs` e `/docs-json` ficam desabilitadas por padrão (só com `SWAGGER_ENABLED=true`).

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

## Multi-IA por design

O projeto foi desenhado para continuar com qualquer IA agentic (Claude Code, Gemini, Codex, opencode e afins) que tenha acesso a um terminal e leia o `AGENTS.md`:

- o CLI do OpenSpec é **dependência do projeto** (`@fission-ai/openspec`, fixado no `package.json`) — basta `pnpm install` e usar `pnpm exec openspec` (nunca `npx openspec`: o pacote público com esse nome é outro);
- specs e changes são **Markdown versionados** em `openspec/`, a fonte da verdade do produto;
- as skills são **texto de referência** em `.opencode/skills/` e `.agents/skills/`, carregadas sob demanda pelas etapas do `docs/engineering/07-workflow-de-engenharia.md`.

Qualquer máquina com Node >= 24 e pnpm 9.15.0 roda o fluxo completo sem instalação global prévia.

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
