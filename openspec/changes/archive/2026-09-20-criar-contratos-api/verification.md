# Verificação — criar-contratos-api

Change de contratos (Feature 4.1): pacote `contracts/` com schemas Zod para Catálogo, Agendamento e Conteúdo Público, cada um com teste de contrato contra os mocks reais do frontend. Data: 2026-09-20.

## Gatilhos de segurança (docs/07 §7)

- **Entrada de usuário (gatilho):** os contratos definem os payloads dos formulários públicos (agendamento, contato, orçamento) — revisão com `security-and-hardening` obrigatória.
- **Dados de paciente (gatilho):** antes/depois envolve consentimento de imagem — revisão obrigatória.
- **Integrações externas:** nenhuma chamada de rede nesta change (schemas puros).
- **Segredos/configuração sensível:** nenhuma variável de ambiente ou credencial nova.

### Revisão security-and-hardening (contra docs/03)

- **Threat model (5 min):** fronteira = payload do site público ↔ validação do contrato (e, no futuro, API); ativos = consentimento de imagem e dados de contato das pacientes; abuse cases = (a) caso de antes/depois sem consentimento vazando para a listagem pública, (b) consentimento opcional/ausente passando batido, (c) payload malformado/JSON hostil derrubando a validação, (d) erro de validação vazando stack/internals do validador, (e) dado real de paciente em testes/fixtures, (f) dependência nova com vulnerabilidade conhecida.
- [x] **Consentimento obrigatório (achado central):** `hasConsent: z.boolean()` — obrigatório, não opcional (nenhuma ocorrência de `hasConsent` com `.optional()` no pacote). Prova por teste: campo ausente e não-booleano reprovam; `PublicBeforeAfterSchema` rejeita `hasConsent: false`; `PublicBeforeAfterListSchema` rejeita lista com caso sem consentimento; `selectPublicResults` exclui `resultado-3` (o caso sem consentimento do mock). Testes: `src/content/before-after.test.ts` — 6/6 verdes.
- [x] **Sem dado real de paciente:** nenhum fixture novo; os testes importam somente os mocks fictícios já auditados do frontend (`frontend/lib/mocks/*`), e os payloads de teste criados no pacote são explicitamente fictícios (ex.: "Maria Exemplo"). Nenhum schema define dado clínico sensível/protuário (LGPD: minimização mantida — só campos de exibição e formulários do MVP).
- [x] **Validação na fronteira:** todo campo de entrada tem schema (nome, telefone/e-mail, mensagem, procedimento restrito às opções vigentes); payload desconhecido é tratado como `unknown` e reprovado sem confiar no chamador.
- [x] **Sem vazamento de internals:** `toValidationError` devolve só `{ code, message, fields? }`; teste prova que o JSON não contém `zod`, `ZodError`, `stack` ou mensagens internas do validador.
- [x] **Sem segredos no diff:** `git diff main...HEAD | grep -iE "password|secret|api_key|token|private key"` → nada.
- [x] **Supply-chain:** dependência nova de runtime = `zod@4.6.5` (madura, sem vulnerabilidades no audit); dev deps = vitest/eslint/typescript-eslint/prettier (já usados no frontend). `pnpm audit --audit-level high` (mesmo comando do CI) passa; os 3 moderados são pré-existentes (`frontend > @stryker-mutator/core > qs`, dev-only, fora do CI) — não introduzidos por esta change.
- **Conclusão:** gatilhos acionados e revisados; nenhum achado Critical/Required. Consentimento provado como obrigatório por schema e por teste. Sem pendências de segurança.

## Revisão code-review-and-quality (cinco eixos)

- **Correção:** cada schema foi provado contra os dados reais do frontend (6 procedimentos, 3 slots, 3 resultados, 5 depoimentos, 4 posts, quiz e contato institucional) e contra os exemplos aceitos/rejeitados dos mocks de booking/quote/contact; erros estruturados sem vazamento. 50 testes, 100% de cobertura do pacote.
- **Legibilidade/simplicidade:** um arquivo por entidade, nomes espelhando os tipos do frontend (`Procedure`, `BeforeAfter`, etc.), schemas de 10–30 linhas, sem abstração prematura (factory só onde o vocabulário é dinâmico: `createQuoteInputSchema`).
- **Arquitetura:** pastas por bounded context (`catalog/`, `scheduling/`, `content/`), sem importar código do frontend em runtime (só testes importam mocks), direção de dependência limpa (contracts não depende de ninguém; frontend/backend dependerão dele), barrel por contexto + raiz.
- **Segurança:** ver revisão acima.
- **Performance:** validação pura e síncrona, sem I/O — irrelevante para o escopo.
- **Achados:** nenhum Critical/Required. *Notas honestas:* (1) o design citava `quote.ts` em `content/` e a task 3.4 dizia "booking.ts inclui QuoteInput" — reconciliado a favor do design (registrado na task 3.4); (2) o smoke test da task 1.1 nasceu mais estreito (resolução do pacote) porque o schema de procedimento só existe na task 2.2 — a validação do procedimento fictício vive na 2.1/2.2 (registrado na task 1.1).
- **Veredito:** Aprovado.

## Prova executável (RED → GREEN por grupo)

- **1.1 RED:** `pnpm --filter contracts test` → `No projects matched the filters`; após scaffold sem `index.ts` → `Failed to resolve entry for package "@newestetica/contracts"`. **1.2 GREEN:** 1/1 teste de fumaça verde.
- **2.1 RED:** `Cannot find module './procedure'`. **2.2 GREEN:** 5/5 verdes (mocks compatíveis + categoria inválida + campos).
- **3.1 RED:** `Cannot find module './slot'`. **3.2 GREEN:** 5/5. **3.3 RED:** `Cannot find module './booking'`. **3.4 GREEN:** 11/11 no contexto.
- **4.1 RED:** `Cannot find module './before-after'` e `'./testimonial'`. **4.2 GREEN:** 8/8 (consentimento). **4.3 RED:** 5 módulos ausentes. **4.4 GREEN:** 29/29 no contexto.
- **5.1 RED:** `Cannot find module './errors'`. **5.2 GREEN:** 4/4.

## Adições além do design (registradas por honestidade)

- **Gate raiz:** `package.json` da raiz passou a rodar `contracts` nos scripts `lint`, `format`, `typecheck` e `test` — sem isso os testes de contrato não rodariam no CI e o pacote nasceria fora das camadas de defesa (mesmo padrão da adição do `.dockerignore` no change de infra). `build` não se aplica (biblioteca sem emit).
- **Configs do pacote:** `vitest.config.ts` (thresholds 80%), `eslint.config.mjs` mínimo (typescript-eslint) e `.prettierignore` — o design citava apenas package/tsconfig/scripts.
- **C2 atualizado:** `docs/architecture/c2-container.md` registra `contracts/` como real (bullets de Real/Planejado). `c3-component.md` **não** mudou: é o diagrama do frontend e nada nele importa contratos ainda (Épico 5).
- **Backlog:** Use Case 4.1.1 → "Em andamento" (contratos entregues; consumo pelo backend/Épico 5 pendente) + linha da tabela-resumo do Épico 4.

## Aplicação da seção 13 (docs/07)

- **Aplicado — unitários/contrato:** cada schema tem teste de contrato contra os mocks reais (fronteira mock ↔ contrato), incluindo casos de sucesso, edge cases e propriedades (ex.: vínculo recomendação→objetivo, exclusão de caso sem consentimento).
- **Aplicado — segurança orientada a OWASP:** payloads nulos, tipos errados, categoria/procedimento fora do vocabulário e prova de não vazamento de internals no erro.
- **Aplicado — adversarial:** tentativas de bypass do consentimento (campo ausente, não-booleano, `false` no formato público, lista mista) reprovam por teste.
- **Dispensado — integração de persistência/E2E/carga/mutation:** não há persistência, jornada de usuário nem performance neste escopo; mutation testing segue manual (Stryker) e fora deste pacote.

## FYIs e follow-ups (não bloqueiam)

- **Números de estado (`05-estado-atual.md`/`README.md`):** após este archive, o projeto passa a 9 specs (86 requirements) e 28 changes arquivados (24 com specs sincronizadas; 4 com `skip_specs`) — os dois docs ainda mostram 8/76/27. Seguindo o padrão do projeto (changes dedicados de sincronização de estado), a atualização fica para um change curto de estado.
- **lint-staged não cobre `contracts/`:** arquivos `.ts` do pacote não passam pelo pre-commit local (frontend-only hoje). Camadas 2/3 (CI + branch protection) cobrem; candidato a change curto de tooling se o incômodo aparecer.
- **`qs` moderado (Stryker dev-only):** pré-existente, fora do CI; sem ação neste change.
- **`validate --archived` com 1 falha pré-existente:** `2026-09-07-frontend-foundation-mocks` (12/13 tasks marcadas) — anterior a este change e sem relação com ele; `validate --all` passa 9/9 e o change novo passa no `--archived`.

## Gates executados (task 5.3)

- `pnpm lint` — passou (contracts incluso; 1 warning pré-existente em `frontend/stryker.config.mjs`)
- `pnpm format` — passou (frontend + contracts)
- `pnpm typecheck` — passou (frontend + contracts)
- `pnpm test` — contracts: 12 arquivos/50 testes/100% (38/38 stmts, 12/12 branches, 9/9 funcs, 34/34 lines); frontend: 15/109/100% (inalterado — nada quebrou)
- `pnpm build` — passou (frontend; contracts não tem build)
- `pnpm audit --audit-level high` — passou (sem high/critical; 3 moderados pré-existentes dev-only)
- `pnpm exec openspec validate --all` — passou (ver registro no archive)

## Regressão de prompts (docs/07 §14, prática leve)

- RED colado em cada grupo (erros de módulo ausente) antes do GREEN; sem sinal de degradação observado. Nenhum modelo/fornecedor citado na regra, conforme docs/07 §14.
