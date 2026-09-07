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

**Fase atual: Frontend público com home completa e mocks (pré-validação)**

O projeto concluiu a documentação base, implementou a fundação do frontend com dados mockados e alinhou a home ao tema visual oficial (nano banana).

**Estamos na fase de validação visual com a Fabiana Rosa.**
Os dois changes de frontend estão arquivados com specs sincronizadas; o backend ainda não começou, conforme a estratégia frontend-first.

---

## 3. O que já existe

### Estrutura de pastas

A estrutura inicial do monorepo já foi criada:

- `AGENTS.md`
- `docs/` (inclui `docs/product/prototypes/` com a referência visual aprovada)
- `openspec/` (com specs de domínio e changes arquivados)
- `frontend/` (Next.js implementado — ver abaixo)
- `backend/`
- `shared/`
- `contracts/`
- `infra/`
- `observability/`
- `backups/`

### Documentação já criada

- `AGENTS.md` (porta de entrada obrigatória para IAs)
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
- `docs/product/prototypes/home-nano-banana.html` (tema visual oficial aprovado)

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
- Meta de cobertura de testes > 80%
- Quality gates obrigatórios
- UI/UX Pro Max no frontend

### Design System

- Paleta, tipografia, spacing e componentes definidos
- Protótipo visual aprovado como base do site público
- Estrutura de seções definida (Hero, Quiz, Tratamentos, Antes/Depois, Depoimentos, CTA, etc.)
- Tokens implementados em código (`frontend/styles/tokens.css` como fonte única)

### Frontend implementado (com mocks)

- Base Next.js (App Router) + TypeScript + Tailwind no workspace pnpm, com scripts `dev`, `lint`, `format`, `typecheck`, `test` e `build`
- Organização `app/`, `components/`, `features/`, `lib/`, `styles/` com camada de dados isolada para troca futura pela API real
- Home completa alinhada ao protótipo nano banana: Header com drawer, Hero em duas colunas, Quiz, Tratamentos com filtros, Resultados com comparador acessível, Diferenciais, Depoimentos, CTA final, rodapé e modal de agendamento (envio 100% mockado)
- Mocks tipados e fictícios (procedimentos, depoimentos, antes/depois com consentimento, slots, posts, quiz, contatos) + 8 testes unitários
- Quality gates passando (lint, format, typecheck, testes, build)

### Workflow de engenharia e gates

- `docs/engineering/07-workflow-de-engenharia.md` criado como fonte única do fluxo (TDD obrigatório, skill por etapa, Definition of Done única)
- Scripts reais na raiz do monorepo delegando aos workspaces (`lint`, `format`, `typecheck`, `test`, `build`)
- Threshold de cobertura em 80% (linhas, funções, branches, statements) reprovando o build
- Pipeline de CI (`.github/workflows/quality.yml`) com gates, auditoria de dependências e varredura de segredos (Gitleaks)

---

## 4. O que ainda NÃO existe

- Validação visual com a Fabiana Rosa (checklists preparados, aceite pendente)
- Backend real (NestJS, PostgreSQL)
- Integração com Keycloak / 2FA
- Contratos de API em `contracts/`
- Painel admin (shell com mocks ainda não iniciado)
- Integrações reais (e-mail transacional, calendários, WhatsApp API)
- Banco de dados real
- Deploy de ambiente

---

## 5. Estado do OpenSpec

- Specs de domínio aprovadas em `openspec/specs/`: `frontend-foundation` (4 req.), `design-tokens` (7 req.), `public-site-structure` (11 req.), `mock-data` (8 req.)
- Changes arquivados:
  - `2026-09-07-frontend-foundation-mocks` (12/13 tasks; 5.2 validação com a Fabiana pendente)
  - `2026-09-07-align-home-to-nano-banana-prototype` (11/11 tasks)
- Change ativo: `engineering-workflow-hardening` (proposal, specs, design e tasks criados; ainda não aplicado nem arquivado)
- Nova spec em progresso (delta no change ativo, ainda não sincronizada): `engineering-workflow`
- Nenhum outro change ativo no momento
- O processo OpenSpec é **inegociável** e deve ser usado antes de qualquer implementação

---

## 6. Próximos passos recomendados (ordem)

1. Validar visualmente com a Fabiana Rosa (checklists em `openspec/changes/archive/2026-09-07-frontend-foundation-mocks/validation-checklist.md`), registrando aprovações e ajustes
2. Change `booking-flow-polish` (polimento do fluxo de agendamento com mocks)
3. Change `admin-shell-mocks` (shell do painel admin com mocks)
4. Depois da validação e dos shells: evoluir para contratos + backend

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
| Design System | Definido e implementado em código |
| Protótipo visual (nano banana) | Aprovado e aplicado na home |
| OpenSpec com specs de domínio | 4 specs aprovadas (+1 delta em progresso) |
| Workflow de engenharia unificado | Definido em docs/07 |
| TDD obrigatório | Regra absoluta (AGENTS.md, docs/02, docs/04, docs/07) |
| CI com gates automáticos | Pipeline criado (gates, auditoria, segredos) |
| Código frontend (home + mocks) | Implementado, gates passando |
| Código backend | Não iniciado |
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
- `docs/product/prototypes/home-nano-banana.html`
