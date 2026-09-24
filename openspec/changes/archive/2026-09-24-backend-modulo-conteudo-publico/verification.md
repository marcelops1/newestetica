# Verificação — backend-modulo-conteudo-publico

- **Change:** `openspec/changes/backend-modulo-conteudo-publico` (branch `feature/backend-modulo-conteudo-publico`)
- **Data:** 2026-09-24
- **Gatilhos de segurança (docs/engineering/07 §7):** entrada pública sem autenticação (quatro rotas de leitura), **consentimento de imagem/dado de paciente** (regra de domínio central), enumeração por rota, DoS de listagem → revisão de segurança obrigatória, registrada na seção 3.

## 1. Testes por nível (docs/07 §13)

| Nível | O que cobre | Arquivos | Testes |
| --- | --- | --- | --- |
| Unit — domínio | `Testimonial`/`Post`/`BeforeAfterCase` (create/restore, validação, `hasConsent` fail-closed, data ISO estrita) e portas | 4 | 18 |
| Unit — aplicação | Quatro casos de uso + adversarial (slug hostil, tripwire de bypass) | 5 | 14 |
| Integração — persistência | Três repositórios Prisma contra Postgres real (round-trip, ordem, `findConsented` exclui) | 1 | 8 |
| Integração — HTTP | Rotas/status/ordem (9), contrato de saída (5), exclusão de consentimento dedicada (4) | 3 | 18 |
| **Total do módulo** | | **13** | **58** |

Suíte completa no Verify: **63 arquivos / 310 testes verdes** (backend 36/147, contracts 12/54, frontend 15/109).

**REDs reais colados (não apenas "testes verdes"):**

- 0.1 (wire-up): `No test files found, exiting with code 1`.
- 1.1 (entidades): `Cannot find module '../errors/errors'` nos 3 specs.
- 1.3 (portas): 3× `error TS2307: Cannot find module '.../ports/*.repository'` (RED de tipo; runtime passa por import de tipo apagado — mesmo precedente do Catálogo).
- 2.1 (aplicação): 4× `Cannot find module './*-use-case'`.
- 3.1 (persistência): `Cannot find module '.../before-after-case.repository.impl'`.
- 4.1 (HTTP): `Cannot find module '.../content.module'`.
- 4.3 (saída): `AssertionError: [{"id":"resultado-1",…}]: expected false to be true` (sem `hasConsent`) e `expected [ 'goal', 'id', …(3) ] to deeply equal [ 'goal', 'hasConsent', …(4) ]`.
- Triagem de mutation: `AssertionError: expected function to throw an error, but it didn't` para `publishedAt: " 2026-08-20 "` — o `.trim()` da entidade aceitava data com ruído; corrigido (ver seção 2).

**Provas negativas (garantias críticas provadas pela falha, não pela ausência dela):**

- **Exclusão de consentimento (task 4.5, write-then-throw em duas etapas):**
  1. Só a camada 2 removida (sem `where: { hasConsent: true }`): o caso sem consentimento chega ao controller e a **camada 3 falha fechada** — HTTP 500 sem corpo de dados (`expected 500 to be 200` em 4/4 provas; `{"statusCode":500,"message":"Internal server error"}` sem vazar o caso).
  2. Camadas 2 e 3 removidas (ingênuo ponta a ponta): o corpo HTTP contém `{"id":"resultado-sem-consentimento",…,"hasConsent":false}` e a prova dedicated reprova (`expected [ 'resultado-com-consentimento', …(1) ] to deeply equal [ 'resultado-com-consentimento' ]`).
  3. Camadas restauradas: **4/4 verdes** — a garantia é distinguível, não presumida.
- **Sonda de bypass:** `GET /before-after/resultado-sem-consentimento` → 404 (sem rota de detalhe para casos); `GET /before-after?hasConsent=false&id=resultado-sem-consentimento` → `[]` (query ignorada, sem filtro de entrada que libere caso).
- **Terceira camada em runtime:** `PublicBeforeAfterListSchema.parse` no controller (não só validação de teste) — provado pela etapa 1 acima.
- **404 genérico de slug:** inexistente, injeção (`' OR '1'='1`) e gigante respondem 404/422 sem ecoar o slug (mensagem fixa "Post não encontrado.").
- **Dado corrompido no banco:** depoimento com campo vazio → `InvalidContent` → HTTP 422 `INVALID_CONTENT` estruturado, sem vazar o registro (testado end-to-end).
- **Mutation testing:** 219 mutantes aplicados de fato sobre o módulo (seção 2) — a sensibilidade dos testes foi medida, não presumida.

**Cobertura backend (threshold 80% reprova o build):** statements 99,7% (335/336), branches 97,01% (130/134), functions 100%, lines 99,69%.

## 2. Mutation testing (task 5.1 — docs/07 §16.c)

- **Backend (módulo Conteúdo Público):** `pnpm --filter backend exec stryker run --mutate 'src/content/**/*.ts,!src/content/**/*.spec.ts,!src/content/**/*.module.ts'` — **20 arquivos, 219 mutantes, score final 91,78% (201 mortos / 18 sobreviventes, 0 sem cobertura, 0 timeout)**, ~12 min, banco de teste no ar.
- **Contracts (schemas de conteúdo):** `pnpm --filter contracts mutation` — **total 94,78% (115 mutantes; 109 mortos / 6 sobreviventes)**: `content/before-after.ts` 100%, `post.ts` 100%, `testimonial.ts` 100%; `contact.ts` 85,71% (4) e `quote.ts` 91,30% (2) são **payloads de escrita fora do escopo deste change** (submissões de contato/orçamento) — aceitos com gatilho: serão medidos e cobertos quando os módulos de contato/orçamento chegarem.
- **Escopo dos configs estendido** (`backend/stryker.config.mjs` e `contracts/stryker.config.mjs`) para `src/content/**` — o módulo novo não era medido até esta task.
- **Histórico da medição (transparência):**
  1. 1ª rodada: 220 mutantes, **89,55%** (197 mortos / 23 sobreviventes).
  2. Triagem: 3 lacunas reais → testes novos (caracterização + RED onde cabível): data ISO **estritamente ancorada** (`2026-08-20T00:00:00` e `x2026-08-20` rejeitados; 2 mutantes de regex mortos), ramo **422 do filtro exercitado end-to-end** via dado corrompido (mutante de `instanceof` morto; o `code` assertado também matou o literal de `INVALID_CONTENT`); simplificação por `code-simplification`: `.trim()` redundante removido de `Post.validate` (o mutante `MethodExpression` deixou de existir; o RED do teste novo provou que o trim aceitava `" 2026-08-20 "`).
  3. 2ª rodada (árvore final): 219 mutantes, **91,78%**.
- **Sobreviventes finais aceitos (18, todos justificados):** literais de mensagem de erro em `before-after-case.entity.ts` (6), `post.entity.ts` (7), `testimonial.entity.ts` (4) e `errors.ts` (1). Trocar o texto não altera contrato observável (classe do erro e `code` são assertados; mensagens são texto para desenvolvedor); assertar texto tornaria os testes frágeis sem ganho de garantia — mesmo critério do Catálogo.
- **FYI (ferramenta):** o modo `--incremental` do Stryker **reutilizou resultados velhos** após mudança dos testes (rodada de 23s com os mesmos sobreviventes, sem invalidar mutantes cobertos pelos testes novos). A rodada autoritativa da triagem é a **completa** (sem `--incremental`); conferir sempre "Instrumented N source file(s)" e o número de mutantes antes de aceitar um score.

## 3. Revisão de segurança (task 5.2 — `security-and-hardening`)

Escopo: quatro rotas públicas de leitura, sem autenticação por desenho (UC 4.2.7); ativo principal = **integridade do consentimento**. Abuse cases do threat model do design, um a um:

| Abuse case | Resultado |
| --- | --- |
| **Bypass de consentimento pela listagem** (vetor central) | **Três camadas, nenhuma confia na outra:** (1) banco `hasConsent BOOLEAN NOT NULL DEFAULT false`; (2) query `where: { hasConsent: true }`; (3) `PublicBeforeAfterListSchema.parse` com `hasConsent: z.literal(true)` em runtime. Provado por write-then-throw em duas etapas (seção 1): camada 3 falha fechada sem vazar; sem as duas, o caso proibido aparece no HTTP e o teste reprova |
| Adivinhação de slug/id de caso sem consentimento | Sem rota de detalhe para casos (`GET /before-after/:id` → 404); query não abre filtro (`?hasConsent=false` → `[]`); tripwire no unit	testa que a superfície de `ListBeforeAfterUseCase` é só `execute` |
| Injeção no slug (`' OR '1'='1`) | String opaca em `findUnique` parametrizado → 404 genérico (testado); auditoria `grep` confirma **zero** `$queryRaw`/`$executeRaw` no módulo |
| Slug gigante/malformado | `z.string().min(1).max(200)` na fronteira → 422 `VALIDATION_ERROR` (testado com 10k chars); `../` não é interpretado (sem uso em filesystem) |
| Enumeração por 404 | Mensagem genérica "Post não encontrado." sem ecoar o slug (assertado no unit); 404 idêntico para inexistente |
| Vazamento de campo interno | Não há campo interno no contrato de conteúdo; allowlist + conjunto exato de chaves testado nas duas pontas; `hasConsent` é público por contrato e sempre literal `true` |
| Dado corrompido no banco | Entidade valida no `restore` → 422 estruturado sem vazar o registro (testado end-to-end) |
| DoS / rate limiting | **Risco aceito e registrado:** leitura somente, dataset curado e pequeno, buscas por PK; sem paginação (gatilho: >100 itens por lista, design decisão 7). Rate limiting entra com o hardening de staging/produção (mesma decisão dos módulos anteriores) |
| Vazamento de imagem/PII | O contrato desta fatia não tem campos de imagem nem PII (só metadados do caso; autorias fictícias "Paciente ilustrativa"); fotos binárias são escopo futuro explícito; nenhum log no módulo |
| Erros expondo internos | Filtro devolve só `code` + `message`; sem stack trace no corpo (testado) |
| Segredos | Nenhum segredo no módulo; `DATABASE_URL` por env; `.env` no `.gitignore`; seed 100% fictício (`prisma/seed.mjs`) |

**Achado/validação da revisão:** nenhum vazamento de consentimento encontrado; a etapa (a) do write-then-throw mostrou que a camada 3 converte uma falha da camada 2 em **falha fechada** (500 sem dados) em vez de vazamento — comportamento desejado, agora coberto. A única correção real da revisão foi a rigidez da data (`trim` removido, seção 2).

## 4. Revisão de código (task 5.3 — `code-review-and-quality`)

- **Correção:** quatro níveis de teste + contrato nas duas pontas; ordenação determinística (posts `publishedAt desc`; depoimentos/casos `id asc`); slug opaco; 404 genérico; `publishedAt` DATE→`AAAA-MM-DD` convertido no mapper (UTC).
- **Arquitetura:** direção de dependências auditada (`domain` sem imports externos; `application` sem `infrastructure`/`presentation`; nenhum import `content → catalog/scheduling`); erros/pipe/filtro locais do módulo (bounded contexts não compartilham apresentação); sem `UnitOfWork` (leitura de entidade única — design decisão 3); wiring por tokens no `ContentModule` com cliente próprio.
- **Legibilidade:** nomes consistentes com os módulos anteriores; comentários só onde explicam decisão (invariante nas portas, Data Mapper, camada 3).
- **Segurança:** seção 3.
- **Performance:** buscas por PK, listagens curadas sem paginação (gatilho >100 registrado), parse de saída O(n) sobre lista pequena; sem N+1.
- **Simplicidade:** nenhuma abstração sem uso real; a validação de saída em runtime é 1 linha que materializa a camada 3 já especificada no design (não é escopo novo); o `.trim()` redundante foi removido na triagem (`code-simplification`).
- **FYIs registrados:**
  1. `ContentModule` cria o próprio `PrismaClient` (terceiro pool conscientemente adiado — design decisão 8; provider compartilhado vira change próprio no 4º módulo ou sob pressão observada).
  2. Warning de lint pré-existente em `frontend/stryker.config.mjs` (`import/no-anonymous-default-export`, commit #12, fora deste change) — arquivo não tocado; lint sai 0.
  3. Prettier drift nos commits do agente — pego pelo gate `format`; o pre-commit segue conveniência, o CI é a verdade (docs/07 §6).

## 5. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `pnpm lint` | ✅ 0 erros (1 warning pré-existente em `frontend/stryker.config.mjs`, fora do change) |
| `pnpm format` | ✅ limpo (após `format:write` nos arquivos do módulo) |
| `pnpm typecheck` | ✅ limpo |
| `pnpm test` | ✅ 63 arquivos / 310 testes (backend 36/147; cobertura 99,7% stmts) |
| `pnpm build` | ✅ limpo |
| `pnpm audit --audit-level high` | ✅ 0 high/critical (3 moderate — baseline do repo, sem regressão) |

## 6. Documentação atualizada (task 5.4)

- `docs/product/08-backlog-produto.md` — UC 4.2.7 → **Em andamento** (leitura pública entregue; CRUD/gestão de consentimento e auth pendentes).
- `docs/architecture/c2-container.md` — Real ganha o terceiro módulo (Conteúdo Público) e suas rotas.
- `docs/architecture/c3-component.md` — seção "Backend (real — módulo Conteúdo Público)" com diagrama de camadas, invariante em três camadas e wiring.
- `docs/engineering/07-workflow-de-engenharia.md` §14 — padrão 5 refinado com a prova negativa **por camada** (task 5.5; não foi dispensa).

## 7. Checklist §16 (docs/07)

- [x] **(a)** `api-and-interface-design` citada no `design.md` (decisões 1/4/7: contrato intocado, forma dos endpoints, desvio de paginação justificado).
- [x] **(b)** `security-and-hardening` carregada no planejamento (threat model no `design.md`) — revisão do Verify na seção 3, com foco explícito no consentimento.
- [x] **(c)** Mutation real medida e registrada (seção 2), com triagem completa, histórico das rodadas e FYI de ferramenta.
- [x] **(d)** Testes adversariais: slug hostil no núcleo e na fronteira HTTP, sonda de bypass com caso semeado, tripwire estrutural e exclusão de consentimento provada por write-then-throw.
- [x] **(e)** §14 avaliada (task 5.5): **atualizada** — refinamento do padrão 5 (prova negativa por camada), não dispensa.

## 8. SonarCloud no PR #40 (registro posterior — 2026-09-24)

O check `SonarCloud Code Analysis` falha por **8,5% de duplicação em New Code** (limite ≤ 3%); os quality gates do Actions (check obrigatório da branch protection) estão verdes e não há novos bugs, vulnerabilidades ou hotspots. Investigação sem dashboard, via Checks API + comparação normalizada do diff (blocos ≥4 linhas, entre arquivos): medição independente **8,5% (145/1699 linhas normalizadas)**, confirmando o número do Sonar.

- **~39% da duplicação é estrutural entre módulos, por decisão arquitetural:** `ZodValidationPipe` (15 linhas, arquivo quase inteiro), `DomainExceptionFilter` (20), classe base `DomainError` (7) e `createPrismaClient` (8) replicam Catálogo/Agendamento — `docs/architecture/02-arquitetura.md` §3 (bounded contexts não compartilham apresentação) + design decisão 8 (cliente próprio com unificação adiada). Entidades, repositórios, mappers, casos de uso e portas têm **zero** sobreposição textual entre módulos.
- **~61% é DAMP intencional em testes:** scaffolds de integração (imports/`beforeAll`/`afterAll`/helpers) e builders locais por spec (`makePost` ×4, `makeCase` ×5) — testes autocontidos por desenho.
- **Nenhuma extração razoável alcança ≤3% neste PR:** remover só os testes ou só os clones de produção deixa ~5,6%; zerar exigiria violar a 02 §3 e acoplar testes. "Classe base genérica para repositórios Prisma" não ajudaria (zero duplicação textual em repositórios/mappers/use-cases).
- **Precedente:** PRs #35 (Agendamento) e #38 (Catálogo) mesclados com o Sonar vermelho na mesma situação; o merge é governado pelos quality gates do Actions.
- **Follow-up formal** em `docs/product/05-estado-atual.md` (Pendências registradas): decidir sobre presentation/erros compartilhados (emenda OpenSpec à 02 §3) **ou** exclusão de duplicação para testes no SonarCloud — antes do 4º módulo (Identidade e Acesso).
