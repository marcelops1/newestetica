## Context

Ver `proposal.md` (Why). Descoberta por grep (7 ocorrências de "pendente validação com a Fabiana" no backlog, linhas 24, 39, 54, 96, 140, 169, 184): só a 1.1.1 está literalmente "Concluído (pendente...)"; as outras 6 estão "Em andamento (...; pendente...)" onde a validação é o único item após a implementação descrita. UCs sem a cláusula (1.3.2, 1.4.1, 1.6.1, 1.6.2, 1.8.1) têm outras pendências reais e ficam intactos. 05 com 4 pontos (fase §2, §4, §6 item 1, tabela §8). Data da validação: 2026-09-19 (informada na tarefa; confere com o calendário do ambiente).

## Goals / Non-Goals

**Goals:**

- Backlog e estado refletindo a validação ocorrida, sem inventar status e sem tocar UCs com pendências reais.

**Non-Goals:**

- Código, specs, README/AGENTS.md/00/02 (FYI de follow-up), revalidar conteúdo das páginas.

## Decisions

### 1. Promover "Em andamento"→"Concluído" onde a validação era a única pendência

Rationale: o "Em andamento" desses 6 UCs significava "implementado com mocks, aguardando validação" (o texto diz "implementada..." + validação pendente); ocorrida a validação, "Concluído (validado...)" é o estado fiel. Alternativa considerada: trocar só a cláusula mantendo "Em andamento" (rejeitada — deixaria status contraditório com o próprio texto, que não lista outra pendência).

### 2. Troca mecânica só da cláusula, resto byte-idêntico

Rationale: mínima difusão; cada linha é única no arquivo. Alternativa considerada: reescrever status por extenso (rejeitada — preserva o histórico do que foi feito).

### 3. 05: nova fase + remove aceite pendente + reordena próximos passos + tabela

Rationale: "Fase atual" vira pós-validação com backend liberado (regra 8 do AGENTS); §4 perde a linha (a validação existe); §6 item 1 vira Épico 4 (contratos + NestJS); tabela marca concluída em 2026-09-19.

### 4. Tabela-resumo do backlog com pendências restantes explícitas

Rationale: o "Em andamento" geral do Épico 1 se mantém (backend, fotos reais, número real pendentes), com a validação registrada como feita — sem esconder o que falta.

### 5. `skip_specs: true`; README/AGENTS.md/00/02 fora (FYI)

Rationale: nenhum requirement muda; menções de processo ("validação → backend") continuam verdadeiras como descrição; "Ainda não existe: validação (pendente)" no README e "Validação pendente" no AGENTS ficam como FYI de follow-up, fora deste escopo (o escopo aprovado cobre backlog + 05).

## Risks / Trade-offs

- [Risco] Promoção indevida se alguma página tiver defeito não registrado → Mitigação: a validação é o ato formal informado; defeitos futuros voltam como bugs normais, sem reverter este registro.
- [Trade-off] Nenhum relevante: só texto.
