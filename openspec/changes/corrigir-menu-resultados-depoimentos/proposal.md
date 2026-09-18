# Change: corrigir-menu-resultados-depoimentos

## Why

O Header (`frontend/features/home/sections/Header.tsx`) ainda aponta "Resultados" para `/#resultados` e "Depoimentos" para `/#depoimentos`, mesmo depois de os changes `pagina-antes-depois` e `pagina-depoimentos` criarem as páginas completas `/antes-depois` e `/depoimentos` (rotas confirmadas em `frontend/app/`). Quem navega pelo menu nunca chega às páginas completas — só às seções-resumo da home — e o menu fica inconsistente com "Tratamentos" (`/tratamentos`) e "A Clínica" (`/sobre`), corrigidos no change `corrigir-navegacao-header`.

## What Changes

- "Resultados" vira link real para `/antes-depois` e "Depoimentos" para `/depoimentos` em `NAV_ITEMS` (fonte única que alimenta desktop e drawer mobile, então uma edição cobre os dois).
- "Diferenciais" permanece inalterado como `/#diferenciais` (não é feature própria, só seção da home).
- Mesmo padrão já vigente: destinos via `next/link`, sem mudar ordem dos itens, visual, comportamento do drawer ou ids das seções da home.
- Explicitamente fora: backend, novas páginas, mudança visual, footer, ids/âncoras das seções da home, qualquer outra rota.

## Capabilities

### New Capabilities

- Nenhuma (correção de comportamento de navegação existente).

### Modified Capabilities

- `public-site-structure`: MODIFIED — requirement "Header com navegação e drawer mobile" (destinos de Resultados e Depoimentos passam de âncoras da home para rotas reais).

## Impact

- `frontend/features/home/sections/Header.tsx` (+ módulo puro de navegação extraído dele, se confirmado em `design.md`) e um novo teste unitário de destinos.
- Sem impacto em backend, `contracts/`, `shared/`, mocks ou dados (navegação pura, sem dado sensível).
