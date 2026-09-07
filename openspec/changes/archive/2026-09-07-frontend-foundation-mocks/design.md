## Context

Ver `proposal.md` (Why) para a motivação. Estado atual: `frontend/` contém apenas `AGENTS.md`; monorepo pnpm com `frontend`, `backend`, `shared`, `contracts` no workspace; Node >= 24; decisões vigentes em `docs/02-arquitetura.md`, `docs/04-decisoes-tecnicas.md` e `docs/06-design-system.md`. Restrições: sem backend, sem Keycloak, sem integrações reais; tudo com mocks; mobile-first e UX 40+ obrigatórios.

## Goals / Non-Goals

**Goals:**

- Base Next.js executável e verificável pelos quality gates já na fundação.
- Isolamento total da fonte de dados para troca por API real sem reescrever UI.
- Tokens como fonte única, eliminando valores literais divergentes.
- Estrutura das 9 seções pronta para receber conteúdo mockado e validação da Fabiana.

**Non-Goals:**

- Definição dos contratos de API (`contracts/`) — change futuro, após validação visual.
- Painel admin — fora desta fundação; entra em change próprio.
- Escolha de biblioteca de formulários, testes E2E completos ou pipeline de CI — decisões de changes de implementação, não desta fundação.

## Decisions

### 1. Inicializar com `create-next-app` (App Router + TypeScript + Tailwind) dentro de `frontend/`

Rationale: caminho oficial e reproduzível, já alinhado às decisões registradas; evita configuração manual divergente.
Alternativas consideradas: setup manual arquivo a arquivo (rejeitado: lento e propenso a divergir do padrão) e template customizado (rejeitado: over-engineering nesta fase).

### 2. Tokens via CSS variables + tema Tailwind centralizado em `styles/`

Rationale: uma fonte única que serve tanto ao Tailwind quanto a estilos pontuais; facilita auditoria de valores literais e futura troca de tema.
Alternativas consideradas: valores literais nas classes (rejeitado: viola o spec `design-tokens`) e biblioteca de temas externa (rejeitado: dependência desnecessária no MVP).

### 3. Camada de dados em `lib/` com interfaces por entidade + mocks tipados

Rationale: componentes consomem interfaces, nunca arquivos de mock diretamente; a troca por fetch real vira reconfiguração de um ponto. Tipos compartilhados antecipam os contratos sem defini-los.
Alternativas consideradas: mocks importados direto nos componentes (rejeitado: acoplamento que o spec `mock-data` proíbe) e mock service worker (rejeitado: complexidade sem benefício antes da API existir).

### 4. Nove seções como componentes de seção sob `features/` + página que as compõe

Rationale: espelha o protótipo aprovado 1:1, permite validar cada seção isolada com a Fabiana e reutilizar blocos (CTA, depoimentos) depois.
Alternativas consideradas: página monolítica (rejeitado: dificulta revisão por seção) e CMS/headless já (rejeitado: fora do MVP).

### 5. Checklist de validação visual com a Fabiana como critério de saída

Rationale: a estratégia frontend-first só cumpre seu papel se a validação for explícita e registrada (telas, fluxos, textos, experiência por seção).
Alternativas consideradas: validação informal por conversa (rejeitado: perde-se o registro exigido pelo AGENTS.md, regra 11).

## Risks / Trade-offs

- [Risco] Versões do Next.js/React instaladas pelo scaffold divergirem do que o backend/contratos esperarão → Mitigação: fixar versões no lockfile e registrar no change de apply.
- [Risco] Mocks criados agora divergirem dos contratos definidos depois → Mitigação: formato documentado por entidade e task explícita de compatibilização no change de contratos.
- [Risco] Protótipo HTML aprovado usar medidas que o Tailwind não expressa 1:1 → Mitigação: aproximar ao máximo e registrar diferenças visuais para aprovação da Fabiana.
- [Trade-off] Fundação sem painel admin adia parte do MVP → Aceito: site público valida primeiro o risco maior (confiança da paciente); admin entra em change próprio.
