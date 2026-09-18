# 05 — Estado Atual — Newestetica

> **Fonte oficial do estado atual do projeto.** Este documento diz o que já foi decidido, o que já existe e o que ainda falta. Qualquer IA deve consultar este arquivo para não trabalhar com premissas desatualizadas.

---

## 1. Objetivo deste documento

Dar uma fotografia clara e atualizada do projeto, respondendo:

- Em que fase estamos?
- O que já foi documentado?
- O que já foi decidido?
- O que ainda não existe?
- Qual é a próxima prioridade?

---

## 2. Fase Atual

**Fase atual: Site público do Épico 1 completo com mocks (pré-validação)**

O projeto concluiu a documentação base e implementou as 9 features do site público com dados mockados — Home, Sobre, Catálogo, Antes/Depois, Depoimentos, Agendamento (modal), Orçamento, Contato e Blog (10 rotas) — com Header e rodapé na navegação canônica, 14 arquivos e 104 testes a 100% de cobertura, e 19 PRs mergeados em `main`.

**Estamos na fase de validação visual com a Fabiana Rosa.**
22 changes arquivados com specs sincronizadas; o backend ainda não começou, conforme a estratégia frontend-first.

---

## 3. O que já existe

### Estrutura de pastas

A estrutura do monorepo já foi criada:

- `AGENTS.md`
- `docs/` (produto, arquitetura, segurança, engenharia, QA/dados/infra + protótipo visual aprovado)
- `openspec/` (7 specs de domínio e 22 changes arquivados)
- `frontend/` (Next.js implementado — ver abaixo)
- `backend/` (só `AGENTS.md`, sem código)
- `shared/` (vazio, sem tipos compartilhados ainda)
- `contracts/` (vazio, sem contratos ainda)
- `infra/`
- `observability/`
- `backups/`

### Documentação já criada

- `AGENTS.md` (porta de entrada obrigatória para IAs, com pipeline multi-modelo)
- `frontend/AGENTS.md`
- `backend/AGENTS.md`
- `docs/product/00-visao-do-produto.md`
- `docs/product/01-persona-e-ux-40+.md`
- `docs/architecture/02-arquitetura.md`
- `docs/security/03-seguranca.md`
- `docs/architecture/04-decisoes-tecnicas.md`
- `docs/product/05-estado-atual.md` (este arquivo)
- `docs/product/06-design-system.md`
- `docs/engineering/07-workflow-de-engenharia.md` (fonte única do fluxo de engenharia)
- `docs/product/08-backlog-produto.md` (backlog Épico > Feature > Use Case)
- `docs/architecture/c1-context.md`, `c2-container.md`, `c3-component.md` (C4 do frontend real)
- `docs/product/prototypes/home-nano-banana.html` (tema visual oficial aprovado)
- `docs/README.md` e READMEs de `requirements/`, `data/`, `qa/`, `infra/`
- `.github/pull_request_template.md` (checklist da Definition of Done)

### Decisões de produto já tomadas

- Público-alvo: mulheres 40–60
- Tom: acolhedor, caloroso e empático
- Escopo do MVP definido (site público + agendamento + painel admin)
- Estratégia Frontend-first com mocks
- Multi-clínica apenas no futuro
- Consentimento obrigatório para fotos de antes/depois
- Tema visual oficial: nano banana (protótipo em `docs/product/prototypes/`)

### Decisões técnicas já tomadas

- Frontend: Next.js (App Router) + TypeScript + Tailwind
- Backend: NestJS + PostgreSQL (monolito modular)
- Auth: Keycloak + 2FA
- Monorepo com pnpm
- Repository Pattern + Data Mapper
- Meta de cobertura de testes > 80% (real: 100%)
- Quality gates obrigatórios em 3 camadas (pre-commit, CI, branch protection)
- UI/UX Pro Max no frontend
- Stryker instalado para mutation testing manual (fora do CI)

### Design System

- Paleta, tipografia, spacing e componentes definidos
- Protótipo visual aprovado como base do site público
- Estrutura de seções definida (Hero, Quiz, Tratamentos, Antes/Depois, Depoimentos, CTA, etc.)
- Tokens implementados em código (`frontend/styles/tokens.css` como fonte única)
- Aplicado nas 10 rotas do Épico 1, incluindo Header com drawer e navegação canônica (`NAV_DESTINATIONS` como fonte única de Header e rodapé)

### Frontend implementado (com mocks)

- Base Next.js (App Router) + TypeScript + Tailwind no workspace pnpm, com scripts `dev`, `lint`, `format`, `typecheck`, `test` e `build`
- Organização `app/`, `components/`, `features/`, `lib/`, `styles/` com camada de dados isolada para troca futura pela API real
- 10 rotas: `/`, `/tratamentos`, `/tratamentos/[slug]`, `/sobre`, `/antes-depois`, `/depoimentos`, `/orcamento`, `/contato`, `/blog`, `/blog/[slug]`
- Home completa alinhada ao protótipo nano banana: Header com drawer, Hero em duas colunas, Quiz, Tratamentos com filtros, Resultados com comparador acessível, Diferenciais, Depoimentos, CTA final, rodapé e modal de agendamento (envio 100% mockado, 4 estados)
- Páginas com busca/filtro client-side (catálogo, blog), formulários mockados com 4 estados (orçamento, contato), 404 acolhedoras por slug
- Mocks tipados e fictícios (procedimentos, depoimentos, antes/depois com consentimento, slots, posts, quiz, contatos) + 14 arquivos e 104 testes a 100% de cobertura
- Quality gates passando (lint, format, typecheck, testes, build); 19 PRs mergeados

### Workflow de engenharia e gates

- `docs/engineering/07-workflow-de-engenharia.md` como fonte única do fluxo (TDD obrigatório, skill por etapa, Definition of Done única)
- Scripts reais na raiz do monorepo delegando aos workspaces (`lint`, `format`, `typecheck`, `test`, `build`)
- Threshold de cobertura em 80% (linhas, funções, branches, statements) reprovando o build (real: 100%)
- 3 camadas de defesa: pre-commit local (husky + lint-staged) → CI (`.github/workflows/quality.yml`: gates, auditoria de dependências, Gitleaks) → branch protection (check "quality gates" obrigatório, enforce_admins)
- Template de PR com checklist auto-verificável da Definition of Done

---

## 4. O que ainda NÃO existe

- Validação visual com a Fabiana Rosa (aceite pendente)
- Backend real (`backend/` só tem `AGENTS.md`; NestJS + PostgreSQL não iniciados)
- Integração com Keycloak / 2FA
- Contratos de API (`contracts/` vazio)
- Tipos compartilhados (`shared/` vazio)
- Painel admin (Épico 2 inteiro Não iniciado)
- Integrações reais (e-mail transacional, calendários, WhatsApp API)
- Banco de dados real
- Deploy de ambiente

---

## 5. Estado do OpenSpec

- Specs de domínio aprovadas em `openspec/specs/` (7 specs, 72 requirements): `architecture-docs` (4), `design-tokens` (7), `docs-organization` (3), `engineering-workflow` (15), `frontend-foundation` (4), `mock-data` (12), `public-site-structure` (27)
- 22 changes arquivados, com specs sincronizadas:
  - Fundação e docs (5): `frontend-foundation-mocks`, `reorganizacao-documentacao`, `documentacao-c4`, `sincronizar-c4-frontend`, `align-home-to-nano-banana-prototype`
  - Páginas do Épico 1 (7): `pagina-sobre`, `catalogo-procedimentos`, `pagina-antes-depois`, `pagina-depoimentos`, `pagina-orcamento`, `pagina-contato`, `pagina-blog`
  - Navegação (3): `corrigir-navegacao-header`, `corrigir-menu-resultados-depoimentos`, `corrigir-navegacao-footer`
  - Agendamento (1): `booking-flow-polish`
  - Qualidade e workflow (6): `engineering-workflow-hardening`, `template-pr-checklist-c4`, `instalar-skills-qualidade-e-stryker`, `padrao-testes-prioridade`, `instalar-husky-lint-staged`, `corrigir-dividas-lint-staged`
- Nenhum change ativo além de revisões de estado como esta
- O processo OpenSpec é **inegociável** e deve ser usado antes de qualquer implementação

---

## 6. Próximos passos recomendados (ordem)

1. Validar visualmente com a Fabiana Rosa (checklists em `openspec/changes/archive/2026-09-07-frontend-foundation-mocks/validation-checklist.md`), registrando aprovações e ajustes
2. Change `admin-shell-mocks` (shell do painel admin com mocks — Épico 2)
3. Depois da validação e do shell: contratos em `contracts/` + backend real

---

## 7. Regras práticas para qualquer IA neste momento

- Não implementar código de produto sem Change OpenSpec
- Não inventar novas funcionalidades fora do MVP
- Não alterar decisões já documentadas sem passar pelo OpenSpec
- Usar os arquivos de `docs/` e o `AGENTS.md` como fonte da verdade
- Respeitar o Design System e o protótipo visual aprovado
- Não usar dados reais de pacientes em mocks
- Se faltar informação, perguntar — não assumir

---

## 8. Resumo executivo

| Item | Status |
| ------ | -------- |
| Visão de produto | Definida |
| Persona e UX 40+ | Definida |
| Arquitetura de alto nível | Definida |
| Segurança | Definida |
| Decisões técnicas | Definidas |
| Design System | Definido e aplicado nas 10 rotas |
| Protótipo visual (nano banana) | Aprovado e aplicado no site público |
| OpenSpec com specs de domínio | 7 specs / 72 requirements |
| Changes arquivados | 22, com specs sincronizadas |
| Workflow de engenharia unificado | Definido em docs/07 |
| TDD obrigatório | Regra absoluta (AGENTS.md, docs/02, docs/04, docs/07) |
| CI com gates automáticos | 3 camadas (pre-commit, CI, branch protection) |
| Código frontend (Épico 1 + mocks) | Completo: 10 rotas, 104 testes, 100% cobertura, 19 PRs |
| Código backend | Não iniciado |
| Contratos e tipos compartilhados | Não iniciados (`contracts/` e `shared/` vazios) |
| Painel admin | Não iniciado |
| Validação com Fabiana | Pendente |

---

## 9. Referências cruzadas

- `AGENTS.md`
- `docs/product/00-visao-do-produto.md`
- `docs/product/01-persona-e-ux-40+.md`
- `docs/architecture/02-arquitetura.md`
- `docs/security/03-seguranca.md`
- `docs/architecture/04-decisoes-tecnicas.md`
- `docs/product/06-design-system.md`
- `docs/engineering/07-workflow-de-engenharia.md`
- `docs/product/08-backlog-produto.md`
- `docs/product/prototypes/home-nano-banana.html`
