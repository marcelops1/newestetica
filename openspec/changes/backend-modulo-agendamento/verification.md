# Verificação — backend-modulo-agendamento (parcial: grupos 0–3)

Registro parcial (grupos 0–3 concluídos; grupo 4/Presentation e gates finais do grupo 5 pendentes). Data: 2026-09-20.

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

## Notas de implementação (Prisma 7)

- Driver adapter `@prisma/adapter-pg` obrigatório (Query Compiler); gerador `prisma-client` com output `src/generated/prisma` (gitignored; excluído de lint/format/coverage).
- Índice único parcial expresso no schema via preview `partialIndexes` (`@@unique([slotId], where: { status: "confirmed" })`) — migration contém `CREATE UNIQUE INDEX "Booking_slotId_key" ON "Booking"("slotId") WHERE (status = 'confirmed')`.
