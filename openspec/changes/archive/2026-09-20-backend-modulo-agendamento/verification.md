# Verificação — backend-modulo-agendamento

Registro completo (grupos 0–5). Data: 2026-09-20.

## Veículo de integração

- **Compose existente + banco isolado `newestetica_test`** (fallback previsto no design; Testcontainers adiado — imagem `testcontainers/ryuk` não estava local e o compose já estava saudável).
- `test/integration/global-setup.ts` cria o banco de teste (se não existir) e roda `prisma migrate deploy`; `test/integration/database.ts` cria o client de teste e reseta as tabelas.
- **Arquivos de integração rodam em série** (`fileParallelism: false`): o achado da task 3.3 mostrou que em paralelo o `resetDatabase` de um arquivo apagava dados do outro (FK violation).
- **Implicação para o grupo 5 (CI):** o workflow precisará de um Postgres de serviço (ou `pnpm infra:up`) antes dos testes do backend; o script `db:migrate` e o `postinstall: prisma generate` já existem.

## Prova negativa 1 — índice parcial como executor final (task 3.5)

O teste de concorrência passou de primeira porque a constraint nasceu com o schema (task 3.2) — RED impossível por construção. Prova negativa executada manualmente contra o Postgres real:

```text
$ DROP INDEX "Booking_slotId_key"   (no banco newestetica_test)
$ pnpm exec vitest run --project integration test/integration/concurrency.int.spec.ts
× N reservas paralelas: exatamente uma vence e as demais recebem SlotAlreadyBooked
× índice parcial como executor final: 3 corridas seguidas, sempre exatamente uma vencedora
AssertionError: expected [ { status: 'fulfilled', …(1) }, …(4) ] to have a length of 1 but got 5
AssertionError: rodada 1: expected [ { status: 'fulfilled', …(1) }, …(4) ] to have a length of 1 but got 5
```

Sem o índice, **as 5 reservas paralelas vencem** (overbooking) e o teste falha exatamente como deve. Em seguida o banco de teste foi dropado e o `globalSetup` o recriou com a migração (índice reaplicado) → 9/9 verdes.

## Prova negativa 2 — atomicidade real da UnitOfWork (task 3.8)

A armadilha do alerta crítico foi reproduzida de propósito: **primeiro a implementação ingênua** (`$transaction` envolvendo o callback, mas repositórios resolvendo o client GLOBAL por não haver propagação do client transacional):

```text
$ pnpm exec vitest run --project integration test/integration/unit-of-work.int.spec.ts
× write-then-throw: a escrita dentro da unidade de trabalho não persiste após o rollback
AssertionError: expected Slot{ props: { id: 'slot-1', …(3) } } to be null
 Test Files  1 failed (1)   Tests  1 failed | 2 passed (3)
```

A escrita persistiu apesar do rollback — RED genuíno. A correção propaga o client transacional via `AsyncLocalStorage` (`PrismaTransactionContext.run(tx, work)`), e os repositórios resolvem `context.current() ?? prisma`:

```text
$ pnpm exec vitest run --project integration test/integration/unit-of-work.int.spec.ts
 Test Files  1 passed (1)   Tests  3 passed (3)
```

Cobre: (a) write-then-throw → rollback total (`slot.count() === 0`); (b) commit → persiste; (c) corrida de ponta a ponta com a UoW real → exatamente 1 reserva vencedora, 4 `SlotAlreadyBooked`, 1 booking confirmada, slot indisponível, 1 notificação.

## Saída dos testes de integração (grupos 3)

```text
$ pnpm exec vitest run --project integration
 ✓ test/integration/slot.repository.int.spec.ts (4 testes)
 ✓ test/integration/booking.repository.int.spec.ts (3 testes)
 ✓ test/integration/concurrency.int.spec.ts (2 testes)
 ✓ test/integration/unit-of-work.int.spec.ts (3 testes)
 Test Files  4 passed (4)   Tests  12 passed (12)
```

Suíte completa do backend (`pnpm --filter backend test`): **12 arquivos / 41 testes**, cobertura 99,03% statements, 92,85% branches, 100% functions, 99,03% lines (thresholds 80%). Typecheck, lint, format e build (`tsc`) verdes.

## Segurança (parcial — revisão completa no grupo 5)

- **Gatilhos presentes:** entrada de usuário (formulários via contratos) e dados de paciente (booking). Revisão `security-and-hardening` completa fica no Verify (task 5.2).
- **Decisão registrada já:** o adapter de console (dev) **não loga dados pessoais** — loga apenas `bookingId`, início, duração e tratamento; teste trava a ausência de nome/telefone no log (docs/03 §10 proíbe logar dado sensível em texto puro).
- **Sem segredos:** `DATABASE_URL` nunca versionada; `prisma.config.ts` usa placeholder apenas para `generate` (migrate falha com erro de conexão claro se a URL real faltar); banco de teste com credenciais fictícias do `.env.example` do compose.
- **Modelo Prisma nunca cruza para o domínio:** mapeamento manual nos mappers; status validado na leitura (valor desconhecido → `InvalidBooking`).

## Adendo pós-CI — advisories high do Prisma CLI

O primeiro run do CI reprovou na auditoria (`pnpm audit --audit-level high`) com **2 HIGH** introduzidos pelo toolchain do Prisma 7.10.0: `deepmerge-ts@7.1.5` (via `@prisma/config`, stack exhaustion) e `mysql2@3.15.3` (pin exato do CLI; auth downgrade). Triage: ambos são dependências do **CLI** (config do Prisma e conector MySQL), não do runtime do app (que usa `@prisma/adapter-pg` sobre Postgres) — mas o gate do CI é autoritativo e reprova high. Correção aplicada no workspace (`pnpm.overrides`): `deepmerge-ts@^8.0.0` e `mysql2@^3.22.0` (versões corrigidas). Verificado que o CLI segue funcional com o major forçado: `prisma validate` ok, `prisma generate` ok no postinstall, `migrate deploy` ok no globalSetup e suíte 51/51 verde; `pnpm audit --audit-level high` volta a passar (só os 3 moderados pré-existentes dev-only).

## Notas de implementação (Prisma 7)

- Driver adapter `@prisma/adapter-pg` obrigatório (Query Compiler); gerador `prisma-client` com output `src/generated/prisma` (gitignored; excluído de lint/format/coverage).
- Índice único parcial expresso no schema via preview `partialIndexes` (`@@unique([slotId], where: { status: "confirmed" })`) — migration contém `CREATE UNIQUE INDEX "Booking_slotId_key" ON "Booking"("slotId") WHERE (status = 'confirmed')`.

## Prova negativa 3 — canário de wiring do módulo (task 4.4)

O `PrismaTransactionContext` precisa ser **singleton** no `SchedulingModule` (a propagação via AsyncLocalStorage depende de a UoW e os repositórios lerem o MESMO contexto). Prova negativa executada de propósito: a UoW foi apontada para um contexto isolado (provider próprio) e o canário rodou contra os providers reais do módulo:

```text
$ (wiring quebrado: UoW com contexto próprio ≠ contexto dos repos)
$ pnpm exec vitest run --project integration test/integration/scheduling.http.int.spec.ts -t "canário"
× canário de wiring: a UnitOfWork do módulo compartilha o contexto transacional com os repositórios
AssertionError: expected 1 to be +0 // Object.is equality
 Test Files  1 failed (1)   Tests  1 failed | 5 skipped (6)
```

Com o singleton restaurado:

```text
$ pnpm exec vitest run --project integration test/integration/scheduling.http.int.spec.ts -t "canário"
 Test Files  1 passed (1)   Tests  1 passed | 5 skipped (6)
```

O canário (write-then-throw através do módulo) fica na suíte como guarda permanente do wiring.

## Testes HTTP (grupo 4)

`test/integration/scheduling.http.int.spec.ts` (6 testes): 201 com reserva confirmada; 422 estruturado sem internals; 409 `SLOT_ALREADY_BOOKED`; 404 `SLOT_NOT_FOUND`; 500 genérico (override do caso de uso em TestingModule — corpo não contém o detalhe interno); canário de wiring.
`test/integration/scheduling.contract.int.spec.ts` (2 testes): disponibilidade e reserva validadas contra `SlotSchema` (duas pontas), com `BookingInputSchema` validando a entrada.

## Teste manual real (backend + Postgres do compose)

Backend buildado (`node dist/main.js`, `PORT=3011`, `DATABASE_URL` para o banco de dev) e slot semeado direto no Postgres:

```text
$ curl -i -X POST http://127.0.0.1:3011/slots/slot-manual-1/bookings -H "content-type: application/json" \
    -d '{"name":"Maria Exemplo","phone":"(11) 98765-4321","treatment":"Limpeza de pele"}'
HTTP/1.1 201 Created
{"id":"4c0a327e-2af6-4961-bed2-1f9f0839e9de","status":"confirmed","treatment":"Limpeza de pele",
 "slot":{"id":"slot-manual-1","start":"2026-10-15T10:00:00.000Z","durationMinutes":60,"available":false}}

$ curl -i -X POST http://127.0.0.1:3011/slots/slot-manual-1/bookings -H "content-type: application/json" \
    -d '{"name":"Joana Exemplo","phone":"(11) 98888-7777"}'
HTTP/1.1 409 Conflict
{"code":"SLOT_ALREADY_BOOKED","message":"Slot já reservado: slot-manual-1"}

$ curl -i http://127.0.0.1:3011/slots/available
HTTP/1.1 200 OK
[]

$ curl -o /dev/null -w "%{http_code}" -X POST .../bookings -d '{"name":"A","phone":"1"}'
422
```

Log do adapter de console no servidor (sem PII): `[agendamento] confirmação 4c0a327e-...: 2026-10-15T10:00:00.000Z (60 min) · Limpeza de pele`.

## Gates finais (task 5.1)

- `pnpm lint` (frontend + contracts + backend) — verde (1 warning pré-existente do Stryker)
- `pnpm format` — verde
- `pnpm typecheck` — verde
- `pnpm test` — contracts 50/50 (100%), frontend 109/109 (100%), backend 51/51 (99,21% stmts, 91,17% branches, 100% funcs, 99,21% lines)
- `pnpm build` — verde (contracts → dist, frontend Next, backend tsc)
- `pnpm audit --audit-level high` — sem high/critical (3 moderados pré-existentes dev-only do Stryker)
- **Auditoria estática da regra de dependência:** `domain/` sem imports externos; `generated/prisma` e `@prisma` confinados a `infrastructure/` (e ao harness de teste `test/integration/database.ts`)
- `pnpm exec openspec validate --all` — ver registro no archive

## Segurança (task 5.2, contra docs/03)

- **Threat model:** fronteira = HTTP público (formulários de agendamento) ↔ API; ativos = dados de contato da paciente (nome/telefone) e a integridade da agenda (overbooking); abuse cases = payload malformado/hostil, corrida no mesmo slot, vazamento de detalhes internos em erro, PII em log, SQL injection, ausência de auth (fora do escopo declarado).
- [x] **Entrada validada na fronteira:** todo body passa por `BookingInputSchema` (Zod, `contracts/`); `slotId` vem do path e é tratado como string opaca (parametrizada pelo Prisma); payload inválido → 422 estruturado sem mensagens do validador.
- [x] **Sem overbooking:** pré-checagem amigável + índice único parcial como executor final; corrida real provada contra Postgres (prova negativa com DROP INDEX → 5 vencedoras).
- [x] **Erros sem internals:** filtro de domínio devolve só `{code, message}`; 500 genérico provado por teste (não vaza o detalhe interno).
- [x] **PII:** não logada (adapter de console com teste que trava ausência de nome/telefone); resposta de reserva não ecoa nome/telefone (minimização).
- [x] **SQL:** 100% via Prisma (parametrizado); nenhuma query concatenada.
- [x] **Segredos:** `DATABASE_URL` só por ambiente; sem segredos no código; `.env` ignorado.
- [x] **Supply-chain:** adapter/Prisma pinados; auditoria sem high/critical; lockfile versionado.
- **Fora do escopo declarado (registrado):** autenticação/autorização (Feature 4.2 de Identidade), rate limiting e HTTPS de borda (infra/deploy), retenção/LGPD avançada — o módulo atual não expõe dado de paciente a terceiros e não tem área logada.
- **Conclusão:** gatilhos acionados e revisados; sem achados Critical/Required.

## Code review (task 5.3)

- **Correção:** fluxo completo provado por testes em 4 níveis (domínio, aplicação com fakes, integração Postgres, HTTP real) + teste manual; nenhum teste de fachada.
- **Legibilidade:** controller fino, pipe/filtro pequenos, módulo explícito com tokens de injeção.
- **Arquitetura:** regra de dependência auditada; Data Mapper sem vazamento de tipo Prisma; UoW como porta do domínio com propagação por contexto; composição raiz no módulo.
- **Segurança:** revisão acima.
- **Performance:** operações pontuais indexadas; sem N+1; corrida de 5 requisições validada.
- **Achados:** nenhum Critical/Required. *Notas honestas:* (1) o retorno do `CreateBookingUseCase` evoluiu para `{ booking, slot }` na Presentation (registrado nas tasks); (2) `contracts` virou pacote compilado para o backend consumir (ponto aberto do grupo 0 resolvido aqui); (3) `fileParallelism: false` na integração é dívida consciente (banco compartilhado) — revisitar quando a suíte crescer.
- **Veredito:** Aprovado.

## Revisão de segurança FORMAL (gatilho docs/07 §7 — PII de paciente)

Gatilho acionado explicitamente depois do merge-candidate: o módulo persiste nome + telefone de paciente (dado pessoal, docs/03 §4) e as revisões anteriores cobriram apenas "log sem PII". Revisão dedicada, somente leitura, contra `docs/security/03-seguranca.md`.

- **Threat model:** fronteira = HTTP público ↔ API (sem auth por design — self-service do UC 4.2.3); ativos = nome/telefone e integridade da agenda; abuse cases = payload hostil, corrida no slot, enumeração de reserva alheia, spam em massa, PII em log/resposta/erro, injeção SQL, segredos.
- **Checagens com veredito:** entrada validada antes da persistência (Zod na fronteira, 422 sem eco de valores); SQL 100% parametrizado (zero concatenação/`$queryRaw`); resposta minimizada (nome/telefone **não** voltam; id é UUID não enumerável); erros sem internals (filtro devolve só `code`/`message`; 500 genérico testado); segredos só por ambiente; sem endpoint de cancelar/alterar/consultar reserva (logo não há acesso a dado alheio — confirmado por auditoria de controllers).
- **Ressalvas levantadas:** R1 sem teto de tamanho no schema; R2 `treatment` (texto livre) aparecia no log; R3 `notes` livre pode carregar dado de saúde digitado; R4 sem rate limiting/CAPTCHA/idempotência (risco aceito com gatilho: resolver antes do Épico 5/SMTP real); R5/R6 sem criptografia em repouso e sem caminho de exclusão (previstos no docs/03 §12, reavaliar com dado real); R7 privilégio do banco na infra; R8 CORS/HTTPS/headers no deploy; R9 finalidade informada na UX (Épico 5); R10 exigir prova de posse quando existir leitura/alteração de reserva por paciente.
- **Veredito na época:** aprovado com ressalva (R1–R10), sem violação de regra obrigatória para o estágio.

### Adendo: R1 e R2 RESOLVIDAS (pós-revisão, test-first)

**R1 — limites de tamanho no contrato** (`contracts/src/scheduling/booking.ts`): `name` máx 120, `phone` máx 20, `treatment` máx 200, `notes` máx 500.

```text
RED (antes dos limites):
$ pnpm --filter contracts exec vitest run src/scheduling/booking.test.ts
× rejeita textos acima dos limites de tamanho (defesa em profundidade)
AssertionError: expected true to be false // Object.is equality
 Test Files  1 failed (1)   Tests  1 failed | 7 passed (8)

GREEN (com .max()):
 Test Files  1 passed (1)   Tests  8 passed (8)
```

Cobertura: payload hostil (nome de 10.000 chars) rejeitado + limites exatos (120/20/200/500) aceitos — testado nas duas bordas.

**R2 — `treatment` fora do log** (`console-notification.adapter.ts`): o adapter de console passou a registrar só `bookingId`, início e duração; o ramo de sufixo do tratamento foi eliminado (o adapter SMTP futuro usará o campo, que permanece na porta).

```text
RED (teste passa a exigir ausência):
$ pnpm --filter backend exec vitest run --project unit src/scheduling/infrastructure/notifications
× registra a confirmação com dados operacionais sem vazar dados pessoais nem o tratamento
AssertionError: expected '[agendamento] confirmação booking-1: …' not to contain 'Limpeza de pele'
 Test Files  1 failed (1)   Tests  1 failed | 1 passed (2)

GREEN (log sem tratamento):
 Test Files  1 passed (1)   Tests  2 passed (2)
```

Suítes após as correções: contracts **52/52 (100%)**; backend **51/51 (99,21% stmts, 90,90% branches, 100% funcs)** — a leve queda de branches (91,17→90,90) é a remoção do ramo de tratamento no log, coberto até então. R1/R2 deixam de ser ressalva; R3–R10 seguem com os gatilhos registrados acima.

## Backlog e docs (task 5.4)

- `docs/product/08-backlog-produto.md`: UC 4.2.3 → **Em andamento** (reserva sem overbooking, disponibilidade e notificação-via-porta entregues; SMTP real, autenticação e consumo pelo frontend pendentes); tabela-resumo do Épico 4 atualizada.
- `docs/architecture/c2-container.md`: Backend e PostgreSQL movidos para **Real**; Keycloak segue planejado; frontend ainda não consome a API (Épico 5).
- `docs/architecture/c3-component.md`: seção do módulo Agendamento com as quatro camadas, portas/implementações e o wiring singleton do contexto transacional.
