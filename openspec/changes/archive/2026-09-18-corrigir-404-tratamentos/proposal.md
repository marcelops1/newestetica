# Change: corrigir-404-tratamentos

## Why

`/tratamentos/[slug]` com slug inválido cai na 404 padrão do Next.js em inglês — provado em runtime na revisão do PR #20 — violando o requirement "Detalhe por procedimento" da spec `public-site-structure` (cenário "Slug inválido": mensagem acolhedora com caminho de volta ao catálogo). A rota `/blog/[slug]` já implementa o padrão correto (`app/blog/not-found.tsx`, verificado em runtime) e serve de referência.

## What Changes

- Cria `frontend/app/tratamentos/not-found.tsx` (escopado à rota, mesmo padrão do blog): badge "Página não encontrada", título e texto acolhedores em português, CTA de volta ao catálogo (`/tratamentos`) via `next/link`, áreas de toque 44px+, tom 40+.
- `frontend/app/tratamentos/[slug]/page.tsx` já chama `notFound()` quando `!item` — sem alteração necessária.
- Prova em runtime (build de produção + `curl`, mesmo método dos changes anteriores), com `/blog/slug-inexistente` como controle.
- Explicitamente fora: backend, outras rotas, 404 global, mudança visual das páginas existentes, alteração de spec.

## Capabilities

### New Capabilities

- Nenhuma (correção de bug contra requirement já aprovado).

### Modified Capabilities

- Nenhuma (o requirement "Detalhe por procedimento" + cenário "Slug inválido" já exige exatamente este comportamento; este change traz a implementação à conformidade — `skip_specs: true`, sem inventar delta).

## Impact

- `frontend/app/tratamentos/not-found.tsx` (novo) + teste de contrato co-localizado (`frontend/app/tratamentos/__tests__/not-found.test.ts`).
- Atualização de uma linha em `docs/product/05-estado-atual.md` (a frase sobre a 404 do catálogo, corrigida no PR #20, fica obsoleta com este fix).
- Sem impacto em backend, contracts, shared, mocks, dados ou outras rotas.
