# Newestetica

Sistema completo para a clínica de estética da Fabiana Rosa, focado em mulheres de 40 a 60 anos.

O produto cobre o site público (apresentação, catálogo, agendamento, depoimentos, blog) e o painel administrativo (pacientes, agenda, procedimentos, histórico, financeiro básico e usuários).

## Visão rápida

- Público principal: mulheres 40–60 anos
- Tom: acolhedor, caloroso e empático
- Estratégia: Frontend-first com dados mockados → validação visual com a Fabiana → backend
- Stack: Next.js + NestJS + PostgreSQL + Keycloak
- Processo: Spec-Driven Development (OpenSpec) — inegociável

## Documentação oficial

Antes de qualquer trabalho, leia nesta ordem:

1. AGENTS.md — regras obrigatórias para IAs e colaboradores
2. docs/00-visao-do-produto.md
3. docs/01-persona-e-ux-40+.md
4. docs/02-arquitetura.md
5. docs/03-seguranca.md
6. docs/04-decisoes-tecnicas.md
7. docs/05-estado-atual.md

## Estrutura do monorepo

```text
newestetica/
├── frontend/       # Next.js (site público + painel admin)
├── backend/        # NestJS (monolito modular)
├── shared/         # Tipos e utilitários compartilhados
├── contracts/      # Contratos de API
├── infra/          # Docker, Keycloak, infra
├── openspec/       # Specs e changes (fonte da verdade)
└── docs/           # Documentação oficial
```

## Estado atual

O projeto está na fase de documentação de fundação.

- Documentação base concluída
- Ainda não há código de produto implementado
- Próximo passo: estrutura inicial do frontend com dados mockados (após formalização via OpenSpec, se necessário)

Consulte sempre docs/05-estado-atual.md para o status mais recente.

## Regras importantes

- Nenhuma implementação de produção sem passar pelo fluxo OpenSpec
- Frontend nasce com dados mockados
- Mobile-first e diretrizes de UX 40+ são obrigatórios
- Segurança e consentimento de fotos são requisitos de domínio

## Modelos de IA recomendados

Função: Orquestração / Planejamento → Modelo: GLM-5.3
Função: Codificação → Modelo: DeepSeek V4 ou GLM-5.3 Flash
Função: Frontend / UI → Modelo: Kimi K3
Função: Revisão → Modelo: DeepSeek V4 Pro

O uso de outros modelos é permitido, desde que as regras do AGENTS.md e do OpenSpec sejam respeitadas.
