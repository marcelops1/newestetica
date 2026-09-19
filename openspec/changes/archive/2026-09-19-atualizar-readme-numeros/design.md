## Context

Ver `proposal.md` (Why). Ponto de partida: README com "19 PRs mergeados", "24 changes arquivados (22 com specs)", "106 testes" e sem menção ao acesso de Blog/Contato/Orçamento. Números reais levantados por comando: 23 PRs mergeados (#1–#23); 27 arquivados ao final do ciclo (26 no momento da proposta; 4 com `skip_specs` incluindo este change → 23 com specs); 15 arquivos / 109 testes / 100% (172/172 stmts, 117/117 branches, 54/54 funcs, 158/158 lines); 7 specs / 72 requirements (inalterados); 10 rotas (inalteradas); modelos idênticos ao AGENTS.md §7.

## Goals / Non-Goals

**Goals:**

- README volta a bater comando a comando com o repositório, sem estimativas.

**Non-Goals:**

- Mudar decisões, specs, backlog ou código. (O `05-estado-atual.md` foi incluído no escopo durante o ciclo, por decisão do usuário — ver decisão 1.)

## Decisions

### 1. README + 05 (escopo ampliado durante o ciclo)

Rationale: a tarefa começou restrita ao README, com a defasagem do 05 registrada como follow-up. Durante o ciclo, o usuário decidiu trazer o sync do 05 para o mesmo PR — a defasagem era conhecida (testes 106→109 e contagens) e o custo de esperar um novo PR superava o de incluir aqui. Alternativa considerada: manter README-only (rejeitada pelo usuário nesta sessão; a decisão de ampliação está registrada aqui e na task retroativa 2.2).

### 2. `skip_specs: true`, sem delta

Rationale: nenhum requirement muda; só texto do README. Alternativa considerada: delta vazio (rejeitada — `openspec validate` rejeita sem o marcador).

### 3. Cada número com fonte de comando registrada na task 1.1

Rationale: foi assim que a deriva nasceu (estimativa/memória); doc de entrada só vale se auditável. Alternativa considerada: copiar números da sessão anterior (rejeitada — re-executados de propósito nesta proposta).

### 4. Modelos sem alteração

Rationale: verificação mostrou a tabela idêntica ao AGENTS.md §7; mexer seria churn. Alternativa considerada: reescrever a seção (rejeitada — nada a corrigir).

## Risks / Trade-offs

- [Risco — resolvido no ciclo] Contagens do 05 defasadas (testes 106→109): o 05 foi sincronizado neste mesmo PR (escopo ampliado); a 2ª rodada de revisão corrigiu a contagem auto-referencial (27 arquivados / 4 com `skip_specs`, incluindo este change), como no PR #20.
- [Risco] "23 PRs mergeados" exclui este PR (convenção herdada do #20) → Mitigação: mesma convenção documentada; pós-merge serão 24.
- [Trade-off] Nenhum relevante: só texto, sem comportamento.
