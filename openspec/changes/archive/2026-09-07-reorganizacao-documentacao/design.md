## Context

Ver `proposal.md` (Why). Ponto de partida: 9 docs + protótipos todos em `docs/`; referências cruzadas usam caminhos planos (`docs/03-seguranca.md`). Restrição: só mover + atualizar caminhos + seção 7 do `AGENTS.md`.

## Goals / Non-Goals

**Goals:**

- Tema localizável em uma linha de mapa; histórico e links intactos.

**Non-Goals:**

- Reescrever conteúdo; mudar decisões; tocar em código.

## Decisions

### 1. `git mv` + commits semânticos por etapa lógica

Rationale: preserva `git log --follow`; commits por etapa (`docs(reorganizacao): ...`) permitem reverter por fatia.
Alternativas consideradas: mover sem git (rejeitado: perde histórico) e commit único gigante (rejeitado: irreversível por parte).

### 2. READMEs mapa de um parágrafo por pasta

Rationale: custo mínimo que responde "o que mora aqui e para quem é" sem nova taxonomia para decorar.
Alternativas consideradas: sem READMEs (rejeitado: pastas vazias de contexto) e índice central gigante (rejeitado: duplica o mapa da raiz).

### 3. Protótipos acompanham `product/`

Rationale: protótipo é referência visual de produto; `docs/prototypes/` move junto para `docs/product/prototypes/`, atualizando a única referência conhecida.
Alternativas consideradas: deixar em `docs/` (rejeitado: fura o padrão temático).

### 4. Seção 7 do AGENTS.md com papéis reais

Rationale: registrar o uso real observado (orquestração, implementação, revisão, bootstrap) mantendo escolha livre evita decisão implícita sobre modelos.
Alternativas consideradas: não tocar (rejeitado: papéis reais ficariam só na conversa, violando AGENTS.md regra 11).

## Risks / Trade-offs

- [Risco] Referência esquecida quebra navegação → Mitigação: `grep -r "docs/0"` precisa retornar vazio + revisão do diff.
- [Risco] Conflito com branches paralelas que citam caminhos antigos → Mitigação: mudança mecânica e grepável, fácil de rebasear.
- [Trade-off] Diffs de move poluem `git log` curto → Aceito: `--follow` preserva a arqueologia; ganho organizacional compensa.
