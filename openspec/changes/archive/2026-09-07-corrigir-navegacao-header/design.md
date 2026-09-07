## Context

Ver `proposal.md` (Why). Ponto de partida: `NAV_ITEMS` com 5 âncoras nuas e logo `#topo` em `Header.tsx` (desktop + drawer). Restrição: só trocar destinos/componente de link; visual e comportamento do drawer intactos.

## Goals / Non-Goals

**Goals:**

- Todo item do menu leva ao destino certo a partir de qualquer rota, via `next/link` (regra de lint).

**Non-Goals:**

- Mudar visual, ordem dos itens ou destino final de cada item; novas rotas.

## Decisions

### 1. `next/link` para todos os itens + logo, âncoras com prefixo `/`

Rationale: `Link` satisfaz a regra `no-html-link-for-pages` e habilita navegação client-side; o prefixo `/` torna a âncora absoluta, funcionando de qualquer página.
Alternativas consideradas: manter `<a>` com `href="/#x"` (rejeitado: viola a regra de lint do projeto) e prefixar só alguns itens (rejeitado: inconsistência).

## Risks / Trade-offs

- [Risco] `/#x` a partir de outra página recarrega em vez de rolar suave → Mitigação: comportamento padrão do Next, aceitável; scroll suave continua dentro da home.
- [Trade-off] Nenhum relevante: troca mecânica de destinos.
