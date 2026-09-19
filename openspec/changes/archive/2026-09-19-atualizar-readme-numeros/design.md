## Context

Ver `proposal.md` (Why). Ponto de partida: README com "19 PRs mergeados", "24 changes arquivados (22 com specs)", "106 testes" e sem menção ao acesso de Blog/Contato/Orçamento. Números reais levantados por comando nesta proposta: 23 PRs mergeados (#1–#23); 26 arquivados (3 com `skip_specs`: `sincronizar-estado-atual-e-readme`, `corrigir-404-tratamentos`, `decisao-tecnica-vercel-docker` → 23 com specs); 15 arquivos / 109 testes / 100% (172/172 stmts, 117/117 branches, 54/54 funcs, 158/158 lines); 7 specs / 72 requirements (inalterados); 10 rotas (inalteradas); modelos idênticos ao AGENTS.md §7.

## Goals / Non-Goals

**Goals:**

- README volta a bater comando a comando com o repositório, sem estimativas.

**Non-Goals:**

- Mudar decisões, specs, backlog, código ou o `05-estado-atual.md` (escopo restrito ao README por instrução explícita).

## Decisions

### 1. Só README; 05 fica para follow-up (FYI registrado)

Rationale: escopo explícito da tarefa. Efeito colateral conhecido: as contagens de testes no 05 (106) ficam defasadas (109) — registrado em `verification.md` como follow-up, não ampliado aqui. Alternativa considerada: incluir o 05 (rejeitada — fora do escopo aprovado).

### 2. `skip_specs: true`, sem delta

Rationale: nenhum requirement muda; só texto do README. Alternativa considerada: delta vazio (rejeitada — `openspec validate` rejeita sem o marcador).

### 3. Cada número com fonte de comando registrada na task 1.1

Rationale: foi assim que a deriva nasceu (estimativa/memória); doc de entrada só vale se auditável. Alternativa considerada: copiar números da sessão anterior (rejeitada — re-executados de propósito nesta proposta).

### 4. Modelos sem alteração

Rationale: verificação mostrou a tabela idêntica ao AGENTS.md §7; mexer seria churn. Alternativa considerada: reescrever a seção (rejeitada — nada a corrigir).

## Risks / Trade-offs

- [Risco] Contagens do 05 defasadas (testes 106→109) → Mitigação: FYI em `verification.md` para o próximo sync; archive-counts do 05 usam convenção "antes deste" e seguem válidas.
- [Risco] "23 PRs mergeados" exclui este PR (convenção herdada do #20) → Mitigação: mesma convenção documentada; pós-merge serão 24.
- [Trade-off] Nenhum relevante: só texto, sem comportamento.
