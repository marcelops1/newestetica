## Context

Ver `proposal.md` (Why) e os deltas em `specs/` (WHAT). Ponto de partida: `CatalogPage` (busca + `CategoryFilter` + cards + vazio acolhedor), `TreatmentDetail` (voltar + CTA via `BookingModal`), `app/tratamentos/[slug]/page.tsx` (`generateStaticParams` + `generateMetadata` + `notFound()`), `searchProcedures`/`normalizeText` em `lib/catalog.ts` com testes em `search.test.ts`, `getProcedureBySlug` em `lib/data.ts`; `postsMock` tem só 2 posts com `id/título/resumo/data` — **sem categoria e sem conteúdo** (por isso este change estende mocks, coisa que o catálogo não precisou); `CategoryFilter` é fixo em `TreatmentCategory`; sem `@testing-library` — testes no nível `lib/` (vitest, node). Restrições: docs/01 (tom educativo, sem alarmismo), docs/06 (tokens, cards), docs/03 (busca reflete entrada do usuário no DOM — gatilho §7), docs/07 §7 (revisão `security-and-hardening` obrigatória no Verify) e §13 (tipos de teste).

## Goals / Non-Goals

**Goals:**

- Páginas `/blog` (lista com busca/filtro) e `/blog/[slug]` (detalhe + 404 acolhedora) no padrão visual e de acessibilidade do catálogo.
- Mocks de posts completos (categoria + conteúdo) e acessores nomeados, com o mesmo rigor de contrato do catálogo.

**Non-Goals:**

- Backend, persistência, CMS, comentários, SEO além de metadados básicos.
- 404 global (escopo: só a rota do blog); correção da 404 ausente do catálogo (lacuna conhecida, fora do escopo — registrar como follow-up no apply).
- Novas dependências, novos tokens, mudança nos mocks de procedimentos.

## Aplicação da seção 13 (tipos de teste que se aplicam)

| Tipo (docs/07 §13) | Aplica? | Como |
|---|---|---|
| Unitários com edge cases | **Sim (sempre)** | RED-first em `getPostBySlug` (válido/inválido), `searchPosts` (parcial, acentos/caixa via `normalizeText`, vazio retorna tudo da categoria, categoria+texto combinados) e no contrato dos posts (todo post com categoria/título/resumo/conteúdo/data não-vazios, ≥4 posts) |
| OWASP | **Sim (sempre — gatilho §7: busca é entrada de usuário)** | Query com marcação (`<`, `>`, `&`, aspas) filtrada como texto puro, sem `innerHTML`/`dangerouslySetInnerHTML` (grep) — mesmo nível do `catalogo-procedimentos` ("busca reflete entrada do usuário no DOM"); revisão `security-and-hardening` registrada no Verify contra docs/03 |
| Contrato/schema | **Sim (sempre — fronteira mock ↔ UI)** | `getPosts()`/`getPostBySlug()`/`searchPosts()` como contratos nomeados das rotas, testados RED-first; `data.test.ts` de contrato estendido sem quebrar |
| Integração de fluxo crítico | **Sim (lista → detalhe → 404)** | Rotas prerenderizadas no build + typecheck + testes da lib + revisão manual; limitação registrada: sem testing-library no projeto, clique/navegação não é simulável (mesma lacuna dos changes anteriores) |
| Mutation | Não — dispensado (registrar em verification.md no apply) | Lógica trivial (filter/includes/normalize), sem negócio sensível |
| Falha e resiliência | **Sim, parcial** | Slug inválido → 404 acolhedora (teste do acessor + build); sem outras dependências externas (mock estático tipado) |
| E2E | Não (parcimônia) | Jornada de alto valor é agendamento; blog é leitura |
| Carga | Não (parcimônia) | Sem requisito de performance |

## Decisions

### 1. Estender `Post` com `category: string` e `content: string[]`; 2 posts existentes completados + 2 novos (total 4)

Rationale: o aceite exige categoria na lista e conteúdo completo no detalhe — os mocks atuais não suportam nenhum dos dois, então a extensão é escopo entailed, não inventado. `content` como array de parágrafos mantém a renderização como nós de texto (`<p>` por item) sem parsing na UI; `category` como string livre evita inventar taxonomia fechada agora (abas derivadas dos mocks, como as do catálogo derivam das categorias existentes).
Alternativas consideradas: conteúdo em string única com `\n\n` (rejeitado: parsing na UI); categoria como union fechada (rejeitado: taxonomia editorial inventada); MDX (rejeitado: over-engineering); só busca sem filtro nem categoria (rejeitado: contradiz o aceite da lista).

### 2. `searchPosts()` pura em `lib/blog.ts` reaproveitando `normalizeText` de `lib/catalog.ts`

Rationale: mesma assinatura mental de `searchProcedures(items, query, category)` — busca sobre título+resumo com tolerância a acentos/caixa; importar `normalizeText` em vez de duplicar mantém uma fonte única de normalização.
Alternativas consideradas: duplicar a normalização no blog (rejeitado: divergência futura); query param server-side (rejeitado: complexidade sem benefício com mocks — mesma decisão do catálogo).

### 3. Slug = `id` do mock; detalhe via novo acessor `getPostBySlug()` em `lib/data.ts`

Rationale: ids já são kebab-case estáveis; acessor isolado em `lib/` mantém a troca futura pela API num ponto só — espelho exato da decisão 3 do catálogo.
Alternativas consideradas: slug separado do id (rejeitado: campo redundante).

### 4. Generalizar `CategoryFilter` de forma backward-compatible (props opcionais)

Rationale: a decisão 1 do catálogo ("uma fonte única de pills evita divergência") continua valendo; generalizar com defaults = comportamento atual preserva o visual validável da home/catálogo. Props opcionais `options?: string[]` + `labels?: Record<string,string>` (default: `TREATMENT_CATEGORIES` + `CATEGORY_LABELS`); typecheck+build+paridade visual conferidos nas tasks.
Alternativas consideradas: duplicar as pills no blog (rejeitado: divergência futura); blog sem filtro (rejeitado: o aceite pede filtro e os mocks passarão a suportá-lo).

### 5. 404 acolhedora via `app/blog/not-found.tsx` escopado à rota

Rationale: o cenário de slug inválido exige página acolhedora sem erro técnico; `not-found.tsx` escopado resolve só o blog. (Lacuna conhecida: o catálogo chama `notFound()` sem `not-found.tsx` customizado — fora do escopo corrigir aqui; registrar follow-up no apply.)
Alternativas consideradas: `app/not-found.tsx` global (rejeitado: muda o site inteiro — escopo desnecessário); depender do 404 padrão do Next (rejeitado: visual técnico, viola o cenário).

### 6. CTA do detalhe abre `BookingModal` com pré-seleção padrão ("Avaliação Geral")

Rationale: posts são educativos, não procedimentos — mapear artigo→tratamento via `resolveTreatment` inventaria semântica (ex.: título "Cuidados aos 40" virando pré-seleção). Zero código novo de agendamento, como no catálogo.
Alternativas consideradas: pré-seleção por título do post (rejeitado: semântica inventada, poluiria o contrato do booking).

## Risks / Trade-offs

- [Risco] Generalizar `CategoryFilter` quebrar o visual validável da home/catálogo → Mitigação: props opcionais com defaults idênticos ao comportamento atual; paridade conferida por typecheck + build + revisão visual nas tasks.
- [Risco] Conteúdo dos 4 posts soar alarmista ou milagroso na revisão → Mitigação: tom educativo prescrito no delta (`mock-data`: "nunca alarmista"); textos fictícios e reversíveis para a validação com a Fabiana.
- [Risco] Ordem das abas derivadas variar → Mitigação: derivação por ordem de inserção dos mocks estáticos (determinística); teste de contrato fixa as categorias esperadas.
- [Trade-off] `Post` com `category: string` livre em vez de union — aceito: flexibilidade editorial na fase de mocks; a union (se um dia necessária) nasce nos `contracts/`, não aqui.

## Migration Plan

Sem migração: arquivos novos + extensão de mocks/tipo com campos novos (sem quebrar leitores atuais — `getPosts()` inalterado em assinatura). Rollback = reverter o change. Troca futura mock → API mantém `getPosts()`/`getPostBySlug()`/`searchPosts()` como fronteira.

## Open Questions

Nenhuma que mude spec, abordagem ou tasks. Taxonomia final das categorias e corpo dos artigos são conteúdo fictício ajustável na validação com a Fabiana sem mudar comportamento.
