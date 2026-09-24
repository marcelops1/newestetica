## Context

Ver `proposal.md` (Why). Ponto de partida verificado: `backend/src/scheduling/` é o padrão de referência (4 camadas, portas, mappers manuais, `SchedulingModule` com providers por tokens, vitest `unit`+`integration`, Stryker via command runner); `contracts/src/catalog/procedure.ts` define `ProcedureSchema` **sem** flag de ativo e os mocks do frontend também não têm o conceito — o "desativado" nasce neste change, no backend; Prisma 7 + adapter + migrations já operam (decisão 04 §5: Repository + Data Mapper, Active Record vedado); ordem TDD por camada em docs/07 §15.

## Goals / Non-Goals

**Goals:**

- Fatia de leitura pública funcional (listar ativos, filtrar, buscar por slug), com o `isActive` como invariante testada, pronta para o Épico 5 consumir.

**Non-Goals:**

- CRUD administrativo, autenticação/Keycloak, `UnitOfWork`, versionamento de URL, paginação (dataset pequeno e curado pela admin — ver decisão 5), migração do frontend.

## Decisions

### 1. `isActive` só no backend; contrato intocado (skill `api-and-interface-design`)

Rationale: pela skill, o contrato é a forma **pública** — e item inativo nunca aparece nela, logo o flag seria dado morto no wire. `Procedure` do domínio ganha `isActive`; a coluna nasce no Prisma; a leitura pública filtra. Saída continua validando contra `ProcedureSchema` nas duas pontas. Alternativas consideradas: estender o contrato com `active` (rejeitada — mudaria a capability `api-contracts` e os mocks do frontend sem nenhum consumidor para o campo).

### 2. Sem `UnitOfWork` neste módulo

Rationale: só há leituras de entidade única — não existe operação multi-escrita para atomizar. Trazer a porta seria copiar complexidade sem necessidade (YAGNI); se um fluxo futuro de escrita precisar, a porta já existe no scheduling como referência. Alternativa considerada: reutilizar `UnitOfWork` por simetria (rejeitada — simetria não é motivo).

### 3. Seed Prisma com catálogo inicial fictício + `prisma db seed`

Rationale: sem dados, o módulo não é verificável de ponta a ponta nem consumível no Épico 5; sem CRUD admin (fora de escopo), o seed é a única porta de entrada legítima. Dados fictícios alinhados aos mocks, documentados como tal. Testes inserem direto via repositório (não dependem do seed). Alternativas consideradas: sem seed (rejeitada — módulo inverificável fora dos testes); importar os mocks do frontend (rejeitada — direção de dependência errada: backend nunca importa de frontend).

### 4. Superfície HTTP mínima (skill `api-and-interface-design`)

Rationale: pela skill (substantivos no plural, sem verbos; validação na fronteira; erro único): `GET /procedures` com `category` opcional + `GET /procedures/:slug`; validação de entrada via `TreatmentCategorySchema`/`ProcedureSchema` com 422 estruturado; slug inexistente **ou** inativo → 404 idêntico (não distinguir evita enumeração de inativos); erros de domínio mapeados no mesmo formato do scheduling. Alternativa considerada: espelhar os paths do frontend (`/tratamentos`) (rejeitada — rotas de site ≠ recursos de API; acoplaria a API ao roteamento do Next).

### 5. Sem paginação nesta fatia (skill `api-and-interface-design`, com desvio justificado)

Rationale: a skill manda paginar listas — aqui, desvio consciente e registrado: o catálogo é curado pela admin (dezenas de itens, não centenas), e paginar agora seria complexidade antecipada. Gatilho de reversão: se o catálogo passar de ~100 itens ativos, paginação vira change próprio. Alternativa considerada: paginar desde já (rejeitada — YAGNI com gatilho explícito).

### 6. Repositório com três leituras mínimas

Rationale: `ProcedureRepository` expõe `findActive()`, `findActiveByCategory()` e `findActiveBySlug()` — exatamente o que os três comportamentos da spec exigem, nada além. Alternativa considerada: `list({category?})` genérico + `findBySlug` (rejeitada — esconderia a invariante "só ativos" dentro de parâmetro opcional; o nome do método deve carregar a regra).

## Checklist §16 (obrigatório para este change, que cria módulo novo)

- **(a) `api-and-interface-design` citada:** carregada nesta sessão de planejamento; aplicada nas decisões 1 (contrato intocado), 4 (forma dos endpoints, validação na fronteira, erro único) e 5 (paginação com desvio justificado).
- **(b) `security-and-hardening` no planejamento:** carregada nesta sessão; threat model abaixo. Revisão do Verify continua obrigatória (docs/07 §7).
- **(c) Mutation:** tasks deste change incluem medição Stryker contra o módulo + `contracts/src/catalog/` (se a capability nasceu lá, mede-se lá), com score e triagem em `verification.md` (meta docs/07 §13).
- **(d) Adversarial:** tasks incluem teste com payload hostil real (categoria inválida/injeção, slug malformado gigante, `notes`-like oversize se houver campo livre) — não só raciocínio.
- **(e) §14:** tasks incluem avaliação ao final — se o apply exigir emendas ou render padrões reutilizáveis, alimenta; senão, registra a dispensa com motivo.

### Threat model da fronteira (planejamento, skill `security-and-hardening`)

- **Fronteira:** `GET /procedures?category=` e `GET /slots`-like `GET /procedures/:slug` — ambos públicos, sem auth por design (leitura pública livre, UC 4.2.2).
- **Ativos:** integridade do catálogo (nenhum inativo vazando); disponibilidade.
- **Abuse cases:** (1) `category` hostil (`' OR '1'='1`, strings gigantes) → Prisma parametriza; validação enum rejeita antes; (2) `slug` malformado/gigante ou com `../` → string opaca em query parametrizada, sem uso em filesystem — sem traversal possível; (3) enumeração de slugs → dado público por design, sem PII — aceito; (4) DoS por listagem → dataset limitado e curado, queries pontuais indexadas (`id` PK); sem paginação por decisão 5.
- **STRIDE resumido:** Spoofing N/A (sem identidade nesta fatia); Tampering sem escrita pública; Information disclosure controlado pelo filtro `isActive` + 404 indistinguível; DoS limitado pelo dataset; Elevation N/A.

## Risks / Trade-offs

- [Risco] Enum de categorias divergindo entre contrato e banco → Mitigação: contrato é fonte da verdade, validado nas duas pontas (spec exige); teste de contrato cobre.
- [Risco] Seed divergindo dos mocks do frontend → Mitigação: seed documentado como fictício e alinhado nominalmente; divergência mapeada se aparecer.
- [Trade-off] Sem paginação agora → aceito com gatilho explícito na decisão 5.
- [Trade-off] Sem escrita admin: popular a base fora dos testes depende do seed → aceito nesta fatia; CRUD nasce com autenticação (Épico 2).

## Migration Plan

Sem migração: tabela `Procedure` nova via migration versionada; rollback = reverter o merge. Nenhum dado existente é tocado.

## Open Questions

Nenhuma bloqueante. Autenticação do futuro CRUD administrativo pertence à Feature de Identidade/Épico 2 — adiamento explícito, não incógnita.
