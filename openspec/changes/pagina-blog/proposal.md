# Change: pagina-blog

## Why

O UC 1.9.1 (Blog, Épico 1) está "Não iniciado": os mocks de posts existem mas não há página — a paciente que pesquisa antes de decidir (docs/01) não encontra conteúdo educativo que gere confiança, e o objetivo 5 do produto ("educar e gerar confiança", docs/00 §5) fica sem vitrine. O padrão estrutural listagem+detalhe já foi validado no catálogo (`CatalogPage` + `TreatmentDetail`, `/tratamentos` + `/tratamentos/[slug]`).

## What Changes

- Nova rota pública `/blog` (`frontend/app/blog/page.tsx` + `frontend/features/blog/BlogPage.tsx`) listando artigos mockados (título, resumo, categoria, data fictícia) com busca client-side por título/resumo e filtro por categoria (abas derivadas dos mocks, `aria-pressed`), espelhando `CatalogPage` (mensagem acolhedora quando vazio, mobile-first, tom educativo).
- Nova rota `/blog/[slug]` (`frontend/app/blog/[slug]/page.tsx` + `frontend/features/blog/PostDetail.tsx`) com o conteúdo completo do artigo mockado, link de volta ao blog e CTA de agendamento via `BookingModal` existente — espelhando `TreatmentDetail` (incl. 404 acolhedora via `not-found.tsx` escopado à rota).
- Extensão dos mocks (único ponto que o catálogo não precisou): tipo `Post` ganha `category: string` e `content: string[]` (parágrafos); os 2 posts existentes ganham os novos campos + 2 posts fictícios novos (total 4); novo acessor `getPostBySlug()` em `lib/data.ts` (cf. `getProcedureBySlug`); nova função pura `searchPosts()` em `frontend/lib/blog.ts` (cf. `searchProcedures`, com `normalizeText`).
- Conteúdo 100% fictício, tom acolhedor e educativo — nunca alarmista sobre procedimentos, sem promessas milagrosas (docs/01).
- Testes por prioridade (docs/07 §13) no rigor do change `catalogo-procedimentos`: unitários RED-first (`getPostBySlug`, `searchPosts` com acentos/caixa/vazio, contrato dos posts), cenário OWASP para a busca (texto da query nunca vira HTML — gatilho docs/07 §7 se aplica: busca é entrada de usuário), testes de contrato/schema da fronteira mock ↔ UI e integração das rotas (lista → detalhe → 404) pelos gates disponíveis.
- Sem backend, sem dado real, sem dependência nova.
- Atualiza `docs/product/08-backlog-produto.md` (UC 1.9.1) no mesmo change.

## Capabilities

### New Capabilities

- Nenhuma (páginas novas dentro de capabilities existentes).

### Modified Capabilities

- `public-site-structure`: ADDED — páginas `/blog` (lista com busca/filtro) e `/blog/[slug]` (detalhe + 404 acolhedora); MODIFIED — nenhuma seção existente muda comportamento.
- `mock-data`: ADDED — campos do post do blog (`category`, `content`) e acessor de busca por slug; MODIFIED — nenhum requirement existente muda.

## Impact

- Arquivos novos: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` (+ `not-found.tsx` escopado), `features/blog/BlogPage.tsx`, `features/blog/PostDetail.tsx`, `lib/blog.ts` (+ teste), testes de `getPostBySlug`.
- Arquivos alterados: `lib/types.ts` (campos de `Post`), `lib/mocks/schedule.ts` (+2 posts, +campos nos 2 existentes), `lib/data.ts` (acessor `getPostBySlug`), `components/CategoryFilter.tsx` (generalização backward-compatible para aceitar as categorias do blog — ver design), `docs/product/08-backlog-produto.md` (UC 1.9.1).
- Nenhum contrato de backend, nenhuma dependência nova; `getPosts()` continua existindo (estendido, não quebrado).
