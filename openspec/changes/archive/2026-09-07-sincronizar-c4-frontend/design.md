## Context

Ver `proposal.md` (Why). Ponto de partida: C2/C3 da época só-home; rotas e features novas verificadas em disco (`app/sobre`, `app/tratamentos/[slug]`, `features/{catalog,about}`). Restrição: só atualizar os dois diagramas.

## Goals / Non-Goals

**Goals:**

- Diagramas fiéis ao disco, mesma linguagem Mermaid, notas de manutenção intactas.

**Non-Goals:**

- Tocar C1, backend, código ou decisões.

## Decisions

### 1. Detalhar rotas no C2 e features no C3, sem reestruturar os diagramas

Rationale: adição cirúrgica preserva o que já foi validado; reestruturação arriscaria perder a distinção real/planejado.
Alternativas consideradas: redesenhar os diagramas (rejeitado: churn sem benefício).

## Risks / Trade-offs

- [Risco] Futura rota nova defasar de novo → Mitigação: a própria nota de manutenção cobre (este change é a prova de que funciona).
- [Trade-off] Nenhum relevante.
