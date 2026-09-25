# Verificação — backend-modulo-pacientes

- **Change:** `openspec/changes/backend-modulo-pacientes` (branch `feature/backend-modulo-pacientes`)
- **Data:** 2026-09-25
- **Gatilhos de segurança (docs/engineering/07 §7):** entrada de usuário (CRUD), **dados de paciente (PII — o dado mais sensível até agora)** e **autorização diferida com guard honesto** → revisão de segurança obrigatória, registrada na seção 3 com foco nos três pontos pedidos: (a) o guard bloqueia sem exceção; (b) DELETE anonimiza (não apaga fisicamente); (c) teto de `limit` confirmado na query.

## 1. Testes por nível (docs/07 §13)

| Nível | O que cobre | Arquivos | Testes |
| --- | --- | --- | --- |
| Contrato (group 0) | `PatientInput`/`PatientUpdate`/`Patient`/`PatientStatus` (bordas de nome/telefone/finalidade, strip de campos fora, status) | 1 | 7 |
| Unit — domínio | `Patient` (create/restore/update valida-antes-de-aplicar/`anonymize` com placeholders) e porta | 2 | 11 |
| Unit — aplicação | Cinco casos de uso + adversarial (hostil, limite, bypass de anonimizada, `status` neutralizado) | 6 | 20 |
| Unit — presentation | Acoplamento do schema de `limit` ao teto do núcleo (R2) | 1 | 1 |
| Integração — persistência | Repositório Prisma contra Postgres real (round-trip, visibilidade na query, ordem, limite, update, anonimização persistida) | 1 | 6 |
| Integração — HTTP | Rotas com bypass (9), **guard honesto sem bypass (6)**, contrato de saída (4), exclusão de anonimização (3) | 4 | 22 |
| **Total do módulo** | | **15** | **67** |

Suíte completa no Verify: **82 arquivos / 390 testes verdes** (backend 54/220, contracts 13/61, frontend 15/109).

**REDs reais colados (não apenas "testes verdes"):**

- 0.1 (contrato): `Cannot find module './patient'`.
- 1.1 (wire-up): `No test files found, exiting with code 1`.
- 2.1 (entidade): `Cannot find module '../errors/errors'`.
- 2.3 (portas): `TS2307: Cannot find module '.../patient.repository'` (RED de tipo; o spec também revelou 2 erros de tipo próprios, corrigidos).
- 3.1 (aplicação): 5× `Cannot find module './*-patient*.use-case'`.
- 4.1 (persistência): `Cannot find module '.../patient.repository.impl'`.
- 5.1 (HTTP): `Cannot find module '.../patients.module'`.
- 5.3/5.4 (**guard**): 6/6 falhas com `expected 201 to be 403` (POST), `expected 200 to be 403` (GET) e bloqueio total ausente — **sem guard, as rotas respondiam 201/200/404, sem proteção nenhuma**.
- 5.5/5.6 (saída): 4/4 falhas com o corpo sem `status` (`PatientSchema.safeParse` → false).

**Provas negativas (garantias críticas provadas pela falha, não pela ausência dela):**

- **Guard honesto é a ÚNICA barreira (task 5.3→5.4):** com o guard ativo e sem bypass, as 5 rotas respondem 403 `AUTH_NOT_IMPLEMENTED` (6/6 provas, corpo só `code`+`message`); com `overrideGuard()` (simulando a Identidade futura), as MESMAS rotas respondem 200/201/204/404 conforme contrato (9/9) — o contraste prova que nada além do guard protegia.
- **Exclusão de anonimização (task 5.7, write-then-throw):** com os filtros de visibilidade removidos de propósito, a lista incluiu a anonimizada (`expected [ …(2) ] to deeply equal [ Array(1) ]`) e o detalhe respondeu `200` em vez de 404; filtros restaurados → **3/3 verdes** (lista exata com o ativo, 404 idêntico sem PII, vazio sem ativos).
- **DELETE anonimiza, não apaga:** teste de integração consulta a linha direto no banco após o delete e comprova `status: "anonymized"`, `anonymizedAt` preenchido e placeholders sem PII; `grep` confirma **zero** `delete`/`deleteMany` em `src/patients` (anonimização via upsert).
- **Teto de `limit` em três camadas:** Zod na fronteira (`max(500)` → 422 para 501 e `abc`), guarda no núcleo (0/negativo/501/10k/fracionário/NaN → `InvalidPatient`) e `take: limit` na query — provado em unit, adversarial, integração e HTTP.
- **Anti-enumeração:** id inexistente e anonimizado respondem o MESMO 404 (corpos comparados literalmente no HTTP), `PatientNotFound` com mensagem fixa sem eco de id/PII; 422 não ecoa valores (`not.toContain("1234")`).

**FYIs registrados:**

1. Backend consome `@newestetica/contracts` do `dist` — os testes do backend exigem `pnpm --filter @newestetica/contracts build` antes (já coberto pelo script `test`; descoberto ao rodar `vitest` direto).
2. Guard spec sobe o módulo sem transação de banco (o guard rejeita antes de qualquer query) — não precisa de seed.

## 2. Mutation testing (task 6.1 — docs/07 §16.c)

- **Backend (módulo Pacientes):** `pnpm --filter backend exec stryker run --mutate 'src/patients/**/*.ts,!src/patients/**/*.spec.ts,!src/patients/**/*.module.ts'` — **13 arquivos, 192 mutantes, score final 93,234% (179 mortos / 13 sobreviventes, 0 sem cobertura, 0 timeout)**, banco de teste no ar. Por camada: application 97,37% (use-cases 100% exceto 1 literal em `list`), domain 89,09% (entidade 89,42%; erros 83,33%), infrastructure **100%**, presentation **100%** (controller, filtro local e guard provados).
- **Contracts (schemas de Pacientes):** escopo estendido (`contracts/stryker.config.mjs`); 1ª medição **80,00% (24/30)** com 6 sobreviventes reais em `PatientUpdateSchema` (bordas de nome/finalidade sem teste — só `phone` era exercitado); triagem com teste de caracterização (aceitação de valores válidos + rejeição de curtos/longos/vazios) → **2ª medição 100,00% (30/30, 0 sobreviventes)**.
- **Histórico da medição do backend (transparência):**
  1. 1ª rodada: 192 mutantes, **84,90%** (163 mortos / 29 sobreviventes).
  2. Triagem: 16 lacunas reais → testes novos (caracterização — comportamento já existia; passam direto, sem RED): bordas exatas de nome/telefone/finalidade na entidade (2 mutantes de `EqualityOperator` por campo), `update` de nome/finalidade aplicado + `update` em anonimizada rejeitado (6 mutantes de `Conditional/Block/ObjectLiteral`), teto exato 500 aceito no núcleo (1 mutante de `EqualityOperator`), `?limit=2` aceito no HTTP (1 mutante de fronteira), dado corrompido no banco → 422 `INVALID_PATIENT` (1 mutante do ramo do filtro + literal do código), desempate por id na ordenação com inserção fora de ordem (1 mutante de `ObjectLiteral` no `orderBy`).
  3. 2ª rodada (árvore final): 192 mutantes, **93,234%**.
- **Sobreviventes finais aceitos (13, todos justificados):** literais de mensagem de erro na entidade (7), nas constantes de placeholder (3), no caso de uso de listagem (1) e nos erros (2) — trocar o texto não altera contrato observável (classe e `code` são assertados); mais 1 mutante equivalente (`phone.length === 0` → `false`, mascarado por `hasDddDigits` que já rejeita vazio). Mesmo critério dos módulos anteriores.
- **Escopos dos configs estendidos** (`backend/stryker.config.mjs` e `contracts/stryker.config.mjs`) para `src/patients/**`.

## 3. Revisão de segurança (task 6.2 — `security-and-hardening`)

Foco pedido (PII + guard honesto), um a um:

| Verificação | Resultado |
| --- | --- |
| **(a) O guard bloqueia de verdade, sem exceção** | `@UseGuards(IdentityPendingGuard)` no controller (5 rotas, sem exceção — `grep`); 403 `AUTH_NOT_IMPLEMENTED` com mensagem apontando o UC 4.2.1 em 6/6 provas; guard é a única barreira (bypass 9/9 verde); guard registrado nos providers do módulo (nunca global — não vaza para outros módulos) |
| **(b) DELETE anonimiza (não apaga fisicamente)** | `grep` sem `delete`/`deleteMany` em `src/patients`; integração comprova a linha preservada com placeholders + `status`/`anonymizedAt`; anonimizada sai de toda leitura (write-then-throw na seção 1) |
| **(c) `limit` com teto confirmado nas queries** | `take: limit` na query do repositório (ordem determinística + teto); teto 500 na fronteira (422) e no núcleo (defesa em profundidade); testes em todos os níveis |
| Injeção | Prisma parametrizado; zero `$queryRaw`/`$executeRaw`; nome/telefone tratados como dados opacos (teste adversarial com `' OR 1=1 --` persistido literalmente) |
| Enumeração | 404 idêntico inexistente/anonimizado; mensagem fixa sem eco de id/PII (testado) |
| Over-collection / LGPD | Contrato mínimo (nome/telefone/finalidade), sem e-mail, sem campo livre de saúde; campos fora do contrato ignorados sem efeito (chaves exatas testadas); `anonymizedAt` fora do wire; seed 100% fictício (prefixo 5555) |
| PII em logs/erros | Nenhum log no módulo (`grep`); filtro devolve só `code`+`message`; 422 sem eco de valores (testado) |
| Segredos | Nenhum no módulo; `DATABASE_URL` via env (factory do kernel); `.env` no `.gitignore` |
| DoS de listagem | Teto `limit` (decisão 5) + dataset administrativo; rate limiting entra com o hardening de staging (mesma decisão dos módulos anteriores) |
| Autorização real pendente | Risco residual registrado: bloqueio honesto ≠ autenticação; trigger de substituição obrigatório no módulo de Identidade (requirement + comentário no guard + aviso no guard spec) |

**Achado da revisão:** nenhum vazamento ou bypass encontrado; a estrutura dos direitos do titular (anonimização + visibilidade) já está **operante e provada por falha**, não apenas preparada.

## 4. Revisão de código (task 6.3 — `code-review-and-quality`)

- **Correção:** 390 testes verdes; contrato nas duas pontas; 404 idêntico; anonimização; guard; teto.
- **Arquitetura:** domínio sem imports externos; aplicação só domínio (auditado); infraestrutura implementa a porta; presentation fina com guard/filtro/pipe locais; kernel compartilhado reutilizado (pipe/filtro/erro/factory); sem `UnitOfWork` (escrita de entidade única — decisão 3); `PatientsModule` wireado no `AppModule`.
- **Legibilidade:** nomes consistentes com os módulos anteriores; comentários só de decisão (guard honesto, visibilidade na query, placeholders).
- **Simplicidade:** allowlist única no controller (`toResponse`); nenhuma abstração nova além do necessário; o scaffold frágil do RED (guard pass-through, mapeamento sem `status`) foi removido no fechamento das tasks.
- **Performance:** queries por PK + `take: limit`; sem N+1; sem paginação completa (trigger registrado).
- **FYIs:** seção 1; quarto pool de conexão conscientemente adiado (decisão 10); `z.coerce` no `limit` rejeita não-numérico com 422 (testado).

## 5. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `pnpm lint` | ✅ limpo (1 warning pré-existente em `frontend/stryker.config.mjs`) |
| `pnpm format` | ✅ limpo (após `format:write` nos arquivos do módulo) |
| `pnpm typecheck` | ✅ limpo |
| `pnpm test` | ✅ 82 arquivos / 390 testes (backend 54/220) |
| `pnpm build` | ✅ limpo |
| `pnpm audit --audit-level high` | ✅ 0 high/critical (3 moderate — baseline do repo) |

## 6. Documentação atualizada (task 6.4)

- `docs/product/08-backlog-produto.md` — UC 4.2.4 → **Em andamento** (CRUD + anonimização + guard honesto; pendentes com trigger: guard Keycloak/RBAC, exportação, campos adicionais).
- `openspec/specs/api-contracts/spec.md` — Purpose atualizado com "e Pacientes".
- `docs/architecture/c2-container.md` — quarto módulo e rotas no container Real.
- `docs/architecture/c3-component.md` — seção "Backend (real — módulo Pacientes)" com diagrama, direitos do titular, PII mínima e bloqueio honesto.
- `docs/engineering/07-workflow-de-engenharia.md` §14 — padrão 8 (estado frágil planejado como etapa do grupo, RED real de proteção) — task 6.5.

## 7. Checklist §16 (docs/07)

- [x] **(a)** `api-and-interface-design` carregada no planejamento e citada no `design.md` (decisões 1, 5, 7, 9 — contrato mínimo do zero, cap, forma dos endpoints, idempotência).
- [x] **(b)** `security-and-hardening` carregada no planejamento (threat model no `design.md`) — revisão do Verify na seção 3, com foco em PII/guard/anonimização.
- [x] **(c)** Mutation real medida e registrada (seção 2), com triagem completa (contratos 80%→100%).
- [x] **(d)** Teste adversarial: payloads hostis reais, limite hostil, sondas de bypass de anonimizada, `status` neutralizado + guard (RED real) + write-then-throw da visibilidade.
- [x] **(e)** §14 alimentada — padrão 8 (novo), não dispensa.

## 8. Ajustes pós-revisão do PR #42 (R1–R3)

- **R1 — números de teste corrigidos:** a contagem no Verify estava desatualizada (a triagem de mutation adicionou 5 testes depois do registro). Confirmado por comando na árvore final: backend **54 arquivos / 220 testes**, contracts 13/61, frontend 15/109 → **82 arquivos / 390 testes** (tabelas e §4/§5 atualizados; corpo do PR corrigido via API REST).
- **R2 — constante duplicada eliminada:** o schema da Presentation repetia o literal `500`; agora importa `MAX_PATIENTS_LIMIT` do use case. Refactor puro (sem mudança de comportamento) — exceção docs/07 §4 registrada. **Teste de acoplamento** novo (`patients.controller.spec.ts`, caracterização): aceita o teto exato do núcleo e rejeita um acima. **Prova write-then-throw:** com o schema divergindo de propósito (literal `600` ≠ constante `500`), o teste reprovou (`AssertionError: expected true to be false`); restaurado o acoplamento → verde. O teste passa a detectar qualquer divergência futura entre as duas camadas.
- **R3 — dívida registrada (sem implementação):** `docs/product/05-estado-atual.md` (Pendências registradas) ganhou a política de retenção/expurgo de PII em backups pré-anonimização e o requisito de que módulos futuros com join em Pacientes respeitem o filtro `findVisible`.
