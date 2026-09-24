## Context

Ver `proposal.md` (Why). Ponto de partida verificado: `backend/src/catalog/` é o padrão de referência (4 camadas, portas só de leitura, mappers manuais, `CatalogModule` com providers por tokens e cliente próprio, vitest `unit`+`integration`, Stryker via command runner; `backend/src/scheduling/` é a referência para escrita com `UnitOfWork` — não se aplica aqui); `contracts/src/content/` define `TestimonialSchema`, `PostSchema`, `BeforeAfterSchema` + `PublicBeforeAfterSchema` (`hasConsent: z.literal(true)`) + `PublicBeforeAfterListSchema` e o helper `selectPublicResults`; o frontend já blinda com `getVisibleResults()`/`Results.tsx` filtrando `hasConsent`; UC 4.2.7 exige "nada sem consentimento servido publicamente" com gatilho de revisão obrigatória; `docs/security/03-seguranca.md` §5 ("sem consentimento claro, a foto não aparece"). Prisma 7 + adapter + migrations já operam; ordem TDD por camada em docs/07 §15.

## Goals / Non-Goals

**Goals:**

- Fatia de leitura pública funcional (depoimentos, posts lista+detalhe, antes/depois só com consentimento), com o consentimento como invariante testada em três camadas, pronta para o Épico 5 consumir.

**Non-Goals:**

- CRUD administrativo, autenticação/Keycloak, `UnitOfWork`, versionamento de URL, paginação (mesmo desvio justificado do Catálogo), fotos binárias (o contrato só tem metadados do caso), detalhe de antes/depois por slug, contato/orçamento/quiz/contact-info, migração do frontend.

## Decisions

### 1. Três entidades, uma com invariante de consentimento (skill `api-and-interface-design`)

`Testimonial` (id, quote, author, context), `Post` (id como slug, title, excerpt, category, content, publishedAt) e `BeforeAfterCase` (id, title, summary, sessions, recovery, goal, `hasConsent` com default fechado **`false`** — sem consentimento claro, não aparece, docs/03 §5). Rationale: espelha exatamente os schemas vigentes, sem inventar campo; o default `false` faz o banco falhar fechado (fail-closed) se o seed/cadastro omitir o flag. Alternativa considerada: `isPublished` para posts/depoimentos (rejeitada — o contrato não tem o conceito; curadoria fica no CRUD admin futuro, YAGNI).

### 2. Portas só de leitura com a invariante no nome

`TestimonialRepository.findAll()`, `PostRepository.findAll()`/`findBySlug()`, `BeforeAfterCaseRepository.findConsented()` — exatamente o que a spec exige, nada além; o nome carrega a regra (precedente da decisão 6 do Catálogo). Rationale: esconder o "só consentidos" em parâmetro opcional repetiria o erro que o Catálogo evitou. Alternativa considerada: `findAll({ onlyConsented: true })` (rejeitada — mesmo motivo).

### 3. Sem `UnitOfWork` neste módulo

Rationale: só há leituras de entidade única — não existe operação multi-escrita para atomizar (mesmo YAGNI do Catálogo, decisão 2 de lá). Alternativa considerada: reutilizar por simetria com o scheduling (rejeitada — simetria não é motivo).

### 4. Superfície HTTP mínima (skill `api-and-interface-design`)

`GET /testimonials`, `GET /posts`, `GET /posts/:slug`, `GET /before-after`; validação na fronteira (`TreatmentCategorySchema`-like onde houver filtro — aqui só slug com `min(1).max(200)`); post inexistente → 404; erros de domínio no mesmo formato `{code, message}` do scheduling/catálogo. Rationale: substantivos no plural, sem verbos; antes/depois só em lista (sem detalhe por slug — a página pública é galeria; detalhe futuro vira change próprio). Alternativa considerada: `/results` espelhando o frontend (rejeitada — rotas de site ≠ recursos de API, mesmo motivo do Catálogo).

### 5. Saída = contrato vigente, sem tocar nele

Cada resposta é mapeada por allowlist explícita para o tipo do próprio contrato (`Testimonial`, `Post`, `PublicBeforeAfter`); a listagem de antes/depois valida contra `PublicBeforeAfterListSchema` (com `hasConsent: z.literal(true)`). O helper `selectPublicResults` **não** é reutilizado no backend: o filtro real é no banco (`where: { hasConsent: true }`) e a validação de saída é a prova — reusar o helper seria código morto que nunca filtraria nada (cargo-cult). Alternativa considerada: filtrar em memória no use case (rejeitada — traz dados proibidos para dentro do processo sem necessidade).

### 6. Seed fictício com variantes de consentimento

Rationale: sem dados o módulo não é verificável nem consumível no Épico 5; os casos **sem** consentimento precisam existir no seed/banco de teste justamente para provar a exclusão (se só houver consentidos, o teste da invariante é vazio). Autoria sempre fictícia, como nos mocks. Testes inserem direto via repositório (não dependem do seed).

### 7. Ordenação determinística, sem paginação

Posts por `publishedAt` descendente (convenção de blog, mais recentes primeiro); depoimentos e casos por `id` ascendente. Sem paginação: mesmo desvio justificado do Catálogo (listas curadas, pequenas), gatilho de reversão em change próprio acima de ~100 itens.

### 8. Cliente Prisma próprio do módulo (deferir unificação de novo)

Rationale: mesmo padrão dos dois módulos (bounded contexts não compartilham wiring); unificar agora mexeria no Catálogo verde por pressão ainda não observada (3 pools no mesmo processo são desperdício tolerável nesta escala). O gatilho registrado no Catálogo ("quando o 3º módulo chegar") chegou — e a decisão consciente é **deferir de novo**, com gatilho explícito: provider compartilhado vira change próprio no 4º módulo ou sob pressão observada de pools. Alternativa considerada: unificar já (rejeitada — blast radius em módulo verde sem necessidade medida).

## Checklist §16 (obrigatório para este change, que cria módulo novo)

- **(a) `api-and-interface-design` citada:** carregada nesta sessão de planejamento; aplicada nas decisões 1 (contrato intocado, default fail-closed), 4 (forma dos endpoints, validação na fronteira, erro único) e 7 (paginação com desvio justificado).
- **(b) `security-and-hardening` no planejamento:** carregada nesta sessão; threat model abaixo com rigor reforçado no consentimento. Revisão do Verify continua obrigatória (docs/07 §7).
- **(c) Mutation:** tasks deste change incluem medição Stryker contra o módulo + `contracts/src/content/` (se a capability nasceu lá, mede-se lá), com score e triagem em `verification.md` (meta docs/07 §13).
- **(d) Adversarial:** tasks incluem teste com payload hostil real (slug malformado gigante, injeção em filtro, sonda de bypass de consentimento com caso sem consentimento semeado) — não só raciocínio.
- **(e) §14:** tasks incluem avaliação ao final — se o apply exigir emendas ou render padrões reutilizáveis, alimenta; senão, registra a dispensa com motivo.

### Threat model da fronteira (planejamento, skill `security-and-hardening`)

- **Fronteira:** `GET /testimonials`, `GET /posts`, `GET /posts/:slug`, `GET /before-after` — todos públicos, sem auth por design (leitura pública livre, UC 4.2.7).
- **Ativos:** integridade do consentimento (nenhum caso sem consentimento servido); disponibilidade.
- **Abuse cases:** (1) `slug` malformado/gigante ou com `../` em `/posts/:slug` → string opaca em query parametrizada por PK, sem uso em filesystem — sem traversal possível; limite `max(200)` na fronteira; (2) **bypass de consentimento pela listagem** — vetor central: o filtro é no banco (`where`), a prova é no HTTP (caso sem consentimento semeado, assert de ausência) e a saída valida contra `literal(true)` — três camadas, nenhuma confia na outra; (3) adivinhação de slug de caso sem consentimento → sem rota de detalhe para casos, não há superfície de sonda; (4) tampering de `hasConsent` → sem escrita pública, N/A; (5) vazamento de imagem/PII → o contrato desta fatia não tem campos de imagem nem PII (só metadados do caso; autoria fictícia); fotos binárias são escopo futuro; (6) DoS por listagem → dataset limitado e curado, buscas por PK/índice; sem paginação por decisão 7.
- **STRIDE resumido:** Spoofing N/A (sem identidade nesta fatia); Tampering sem escrita pública; Information disclosure controlado pelo filtro `hasConsent` + validação de saída `literal(true)`; DoS limitado pelo dataset; Elevation N/A.

## Risks / Trade-offs

- [Risco] `hasConsent` divergindo entre banco e contrato → Mitigação: contrato é fonte da verdade, validado nas duas pontas (spec exige); teste com `literal(true)` cobre.
- [Risco] Seed com caso sem consentimento vazar para demo → Mitigação: seed é fictício e documentado; a própria API jamais o serve (é o que os testes provam).
- [Trade-off] Sem paginação agora → aceito com gatilho explícito na decisão 7.
- [Trade-off] Três pools de conexão (terceiro cliente próprio) → aceito com gatilho explícito na decisão 8.
- [Trade-off] Sem escrita admin: popular a base fora dos testes depende do seed → aceito nesta fatia; CRUD nasce com autenticação (Épico 2).

## Migration Plan

Sem migração: tabelas novas via migration versionada; rollback = reverter o merge. Nenhum dado existente é tocado (só há mocks no frontend).

## Open Questions

Nenhuma bloqueante. Fotos binárias de antes/depois, detalhe de caso por slug e provider Prisma compartilhado pertencem a changes futuros explícitos.
