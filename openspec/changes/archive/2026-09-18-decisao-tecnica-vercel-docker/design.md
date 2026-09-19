## Context

Ver `proposal.md` (Why). Ponto de partida: 04 com 18 seções numeradas (decisões até §16 "NÃO foi escolhido", §17 regras, §18 referências); nenhuma referência externa a números de seção — só referências ao arquivo (verificado por grep em `docs/`, `openspec/specs/`, `AGENTS.md` e `README.md`). `infra/docker/` existe vazio (sem arquivos). 05 sem menção das decisões como pendentes (grep por `vercel|docker` só acha o comentário de árvore "Docker, Keycloak…" em 02 e no README). Spec `architecture-docs`: 4 requirements sobre conteúdos dos diagramas C4 e nota de manutenção.

## Goals / Non-Goals

**Goals:**

- Decisões registradas no formato vigente, rastreáveis (motivo + alternativas), sem decisão implícita restante sobre deploy/infra.

**Non-Goals:**

- Implementar `docker-compose`, `vercel.json` ou fazer deploy; mudar specs, backlog ou código; reavaliar o mérito das escolhas (motivos e alternativas vêm do escopo aprovado).

## Decisions

### 1. Duas seções novas antes das Referências + linhas na tabela de Stack; Referências 18→20

Rationale: decisões numeradas em sequência preservam o formato do arquivo; renumerar uma única seção é seguro porque o grep prova zero referências externas a números. Alternativas consideradas: apendar após o §18 (rejeitada — conteúdo depois das referências quebra a estrutura); arquivo dedicado separado (rejeitada — o 04 é a fonte oficial e o §17 autoriza documentar nele).

### 2. `skip_specs: true`, sem delta em `architecture-docs`

Rationale: nenhum SHALL muda. C1 lista sistemas externos **integrados ao produto** (Keycloak, e-mail futuro, calendário futuro) — Vercel (hospedagem) e Docker (orquestração local) não são sistemas externos nesse sentido; C2 enumera contêineres (Frontend, Backend, PostgreSQL, Keycloak) — plataforma de deploy não altera a lista; a nota de manutenção dispara só com mudança de camada, e este change altera só docs. Delta idêntico seria vazio e inventar texto violaria "não inventar requirement". Alternativa considerada: delta MODIFIED repetindo requirements (rejeitada — merge no-op, só ruído).

### 3. Nenhuma implementação (compose, `vercel.json`, deploy)

Rationale: decisão ≠ implementação; `infra/docker/` segue vazio até o backend (Épicos 2+/contratos). Alternativa considerada: criar `docker-compose` esqueleto agora (rejeitada — sem backend para orquestrar; complexidade antecipada, YAGNI).

### 4. No 05, só os 2 bullets em "Decisões técnicas já tomadas"

Rationale: não há menção pendente a remover (grep); "Deploy de ambiente" segue corretamente em "O que ainda NÃO existe" (decisão registrada ≠ deploy feito).

## Risks / Trade-offs

- [Risco] Renumerar Referências confunde links futuros para "§18" → Mitigação: grep prova que ninguém referencia números hoje; seções numeradas em sequência são o padrão do arquivo.
- [Trade-off] Nenhum relevante: só texto, sem comportamento.
