# Change: corrigir-navegacao-footer

## Why

O Footer (`frontend/features/home/sections/Footer.tsx`, linhas 21–26) mantém âncoras cruas `#tratamentos`, `#resultados`, `#depoimentos` e `#diferenciais` em `<a>` simples, sem prefixo de rota — confirmado na revisão do PR #18. É o mesmo bug corrigido no Header (changes `corrigir-navegacao-header` e `corrigir-menu-resultados-depoimentos`), em grau igual ou pior: a partir de qualquer página que não seja a home, os links resolvem na página errada (ex.: `/depoimentos#resultados`) e as páginas completas `/antes-depois` e `/depoimentos` ficam inalcançáveis pelo rodapé.

## What Changes

- Os 4 itens da coluna "Navegação" do rodapé passam aos destinos canônicos do Header: Tratamentos→`/tratamentos`, Resultados→`/antes-depois`, Depoimentos→`/depoimentos`, Diferenciais→`/#diferenciais`.
- `<a>` simples vira `next/link` nos 4 links da coluna (todos são internos; o rodapé não tem link externo).
- O rodapé não tem item equivalente a "A Clínica"/Sobre (confirmado por leitura) — nada a incluir; nenhum item novo é adicionado.
- Destinos compartilhados com o Header via constantes canônicas em `nav-items.ts` (fonte única; ordem e labels próprios do rodapé preservados).
- Explicitamente fora: backend, novas páginas, mudança visual do rodapé, itens novos no menu do rodapé, ids/âncoras das seções da home, Header e demais links.

## Capabilities

### New Capabilities

- Nenhuma (correção de comportamento de navegação existente).

### Modified Capabilities

- `public-site-structure`: MODIFIED — requirement "Diferenciais, depoimentos, CTA final e rodapé no padrão do protótipo" (destinos da coluna de navegação do rodapé + `next/link`).

## Impact

- `frontend/features/home/sections/Footer.tsx`, `frontend/features/home/sections/nav-items.ts` (adição das constantes canônicas referenciadas pelos arrays do Header e do rodapé) e um novo teste unitário de destinos do rodapé.
- Sem impacto em backend, `contracts/`, `shared/`, mocks ou dados (navegação pura, sem dado sensível).
