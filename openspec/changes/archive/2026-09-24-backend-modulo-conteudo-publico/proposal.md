# Change: backend-modulo-conteudo-publico

## Why

O site público precisa de fonte real para depoimentos, posts do blog e casos de antes/depois (UC 4.2.7, hoje "Não iniciado"), seguindo o mesmo caminho do Catálogo: leitura pública primeiro, para o Épico 5 consumir. O ponto crítico é o consentimento: a regra "nada sem consentimento é servido publicamente" hoje vive só no frontend (`getVisibleResults`/`Results.tsx` filtrando `hasConsent`, `PublicBeforeAfterSchema` com `z.literal(true)`); sem o módulo, um caso sem consentimento no banco futuro seria servido por qualquer leitura ingênua. Este change traz a blindagem para o servidor, com prova real de exclusão — o gatilho de segurança aqui é mais crítico que o do Catálogo (dado de imagem/consentimento de paciente, não só flag interna).

## What Changes

- Novo módulo `backend/src/content/` (Clean Architecture, padrão do Catálogo — referência mais próxima: leitura pública, sem `UnitOfWork`): entidades `Testimonial`, `Post` e `BeforeAfterCase` (com `hasConsent`, default fechado `false`); portas só de leitura com a invariante no nome (`findConsented`); repositórios Prisma + mappers; controller com `GET /testimonials`, `GET /posts`, `GET /posts/:slug`, `GET /before-after`; pipe/filtro/erros locais do módulo.
- Modelos Prisma + migration + seed fictício (com variantes com e sem consentimento — as sem consentimento existem para provar a exclusão) + `prisma db seed`.
- Saída validada contra os schemas vigentes de `contracts/src/content/` nas duas pontas (incluindo `PublicBeforeAfterListSchema`, com `hasConsent: z.literal(true)`); contrato intocado.
- Wiring no `AppModule`; escopo do Stryker estendido a `src/content/**`.
- Explicitamente fora: escrita/CRUD administrativo (mesmo YAGNI do Catálogo — nasce com autenticação); submissões de contato/orçamento (`ContactInput`, `QuoteInput` são payloads de escrita); `ContactInfo`/quiz (fora do escopo do UC); detalhe de antes/depois por slug (só listagem); fotos binárias (o contrato só tem metadados do caso); paginação (mesmo desvio justificado do Catálogo, gatilho >100 itens).

## Capabilities

### New Capabilities

- `backend-content`: leitura pública de depoimentos, posts (lista + detalhe por slug) e antes/depois somente com consentimento, no formato dos contratos vigentes, sem escrita.

### Modified Capabilities

- Nenhuma (o módulo consome `contracts/src/content/` e as specs `api-contracts`/`mock-data`/`public-site-structure` sem mudar nenhum requirement).

## Impact

- `backend/src/content/` (novo), `backend/prisma/` (3 modelos + migration + seed), `backend/src/app.module.ts` (wiring), `backend/stryker.config.mjs` (escopo), `docs/product/08-backlog-produto.md` (UC 4.2.7 → Em andamento), `docs/architecture/c2-container.md`/`c3-component.md` (terceiro módulo).
- Sem impacto em frontend, contratos, mocks ou specs vigentes.
