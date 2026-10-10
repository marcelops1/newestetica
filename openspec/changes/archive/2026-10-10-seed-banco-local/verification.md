# Verificação — seed-banco-local

Change de ferramental de dev (sem gatilho docs/07 §7 — nenhuma rota, entrada de usuário, auth, dado de paciente ou integração alterada). Data: 2026-10-10. Branch: `chore/seed-banco-local`.

## Prova RED (task 1.1) — banco limpo não serve nada

Após `make up` (banco novo, migrations aplicadas pelo entrypoint):

```
GET /procedures      -> []
GET /testimonials    -> []
GET /posts           -> []
GET /before-after    -> []
GET /slots/available -> []
```

## Mudanças

- `backend/prisma/seed.mjs` reescrito sobre o formato existente (`pg` parametrizado, upsert `ON CONFLICT (id)`, ids estáveis, comentário de dado fictício): guarda `NODE_ENV=production` antes de conectar; **removidos** pacientes e atendimentos; **adicionados** 8 horários futuros disponíveis (próximos 4 dias úteis, 09:00/14:00, datas calculadas no seed para nunca nascerem no passado) + 1 horário futuro **indisponível**.
- `backend/package.json`: `db:seed` = `node prisma/seed.mjs`.
- `Makefile`: alvo `seed` (`NODE_ENV=development DATABASE_URL=...127.0.0.1:${POSTGRES_PORT}/... pnpm --filter backend db:seed`) + linha no `make help`.

## Prova GREEN (task 4.1) — curl após `make seed`

```
procedures: 6 ativos (sem protocolo-descontinuado):
  bioestimulador-de-colageno, hidratacao-facial, limpeza-de-pele,
  massagem-relaxante, protocolo-corporal, toxina-botulinica-preventiva
testimonials: 5
posts: 4
before-after: 2 (resultado-1, resultado-2 — resultado-3 sem consentimento NÃO aparece)
slots/available: 8 futuros (slot-dev-1@2026-10-12T09:00Z ... slot-dev-8@2026-10-15T14:00Z;
  slot-dev-indisponivel NÃO aparece)
```

## Idempotência (task 4.2)

Segunda execução do `make seed`: contagens idênticas (`ANTES: 6 5 4 2 8` / `DEPOIS: 6 5 4 2 8`).

## Refuso em produção (task 4.2)

```
$ NODE_ENV=production ... pnpm --filter backend db:seed
Seed recusado: NODE_ENV=production. Este seed popula dados fictícios e só roda em desenvolvimento local.
PROD_EXIT=1
```

## Fora da imagem de produção (task 4.3)

- `grep` por `db:seed`/`prisma db seed` em `backend/Dockerfile` e `backend/docker-entrypoint.sh`: **zero ocorrências** (o Dockerfile só copia o código e roda `prisma generate`; o entrypoint roda `migrate deploy` + `node dist/main.js`).
- `prisma migrate deploy` (entrypoint) não executa `migrations.seed` — seed só roda em `migrate dev`.
- O container sobe com `NODE_ENV=production` (linha 20 do Dockerfile): a guarda protege até execução manual dentro da imagem.

## Testes automatizados (task 3.1) — RED real → GREEN

Novo `backend/test/integration/seed.int.spec.ts` (padrão `test/integration/database.ts`: `resetDatabase` + `createTestPrismaClient`), dois casos: guarda de produção (spawn do script, exit ≠ 0, mensagem no output) e idempotência (reset → seed → contagens → seed → contagens idênticas, com delta 0 de `Patient`/`Attendance`; esperados 7/6 procedimentos, 5 depoimentos, 4 posts, 3/2 casos, 9/8 horários).

- **RED** (spec novo rodado contra o seed antigo, via `git stash` do `seed.mjs`): `Tests 2 failed (2)` — guarda ausente (seed antigo ignora `NODE_ENV=production`) e pacientes fictícios criados (delta ≠ 0).
- **GREEN** (seed novo): `Tests 2 passed (2)`.

## Docs (task 5.1)

- README: nova seção "Backend local completo (stack + dados fictícios)" em "Como rodar" (`make up`, `make seed`, idempotência, refuso em produção, sem pacientes).
- docs/07: nova seção "Seed do banco local" junto à nota das camadas de defesa, com as 4 regras do seed e o ponteiro para o teste.
- Backlog/05: `grep seed` → zero ocorrências antes do change; nada a atualizar.

## Gates (task 5.2)

- `pnpm lint` — exit 0 (1 warning pre-existente no frontend, fora do escopo).
- `pnpm format` — exit 0.
- `pnpm typecheck` — exit 0.
- `pnpm test` (com `make up`; `make down` no fim): contracts 15/80, frontend 15/109 (inalterados), **backend 86 arquivos/396 testes** (baseline 85/394 + o spec novo, +2 testes).
- `pnpm build` — exit 0.
- `pnpm audit --audit-level high` — exit 0.
- `openspec validate --all` — 19 passed, 0 failed.

## Revisão code-review-and-quality (auto-revisão)

- **Correção:** guarda antes de qualquer conexão; datas calculadas no seed (nunca nascem no passado); upserts por id estável iguais aos existentes; `resetDatabase` no antes do spec evita contagem instável.
- **Segurança:** sem gatilho; nenhum dado de paciente (nem fictício) no seed; refuso explícito de produção. `pg` já era devDep — lockfile intocado.
- **Legibilidade:** mesma estrutura do seed original (arrays nomeados + loops com `console.log` de resumo), só o delta de conteúdo e a guarda.
- **Veredito:** aprovado.
