# Tasks: seed-banco-local

## 1. Prova RED — banco limpo não serve nada

- [ ] 1.1 `make up`; `curl -s localhost:3001/procedures|testimonials|posts|before-after|slots/available` → todos `[]` (colar). baseline para o GREEN.

## 2. Seed executável e enxuto

- [ ] 2.1 Reescrever `backend/prisma/seed.mjs`: guarda `NODE_ENV=production` (exit 1, mensagem clara) antes de conectar; remover pacientes/atendimentos; adicionar horários futuros (ids estáveis, start calculado no seed; +1 indisponível). Manter formato `pg`/upsert por id.
- [ ] 2.2 `backend/package.json`: script `db:seed` (`node prisma/seed.mjs`). `Makefile`: alvo `seed` (roda o script no container/local conforme convenção do repo) + linha no `make help`.

## 3. Testes automatizados

- [ ] 3.1 `backend/test/integration/seed.int-spec.ts`: guarda de produção (spawn com `NODE_ENV=production` → exit ≠ 0, stderr com a mensagem; banco intocado) e idempotência (reset → seed → contagens → seed → contagens idênticas; Patient/Attendance delta 0). RED real: spec falha antes do seed existir nesse formato; GREEN depois.

## 4. Prova GREEN — fluxo real

- [ ] 4.1 `pnpm --filter backend db:seed` (banco dev): colar saída (contagens). `curl` nas 5 rotas: ≥6 procedimentos (sem o inativo), 5 depoimentos, 4 posts, 2 casos antes/depois (sem o sem consentimento), horários futuros (sem o indisponível).
- [ ] 4.2 Rodar o seed **segunda vez**: contagens idênticas (prova de idempotência via API/banco). Prova do refuso: `NODE_ENV=production pnpm --filter backend db:seed` → exit ≠ 0.
- [ ] 4.3 Confirmar fora da imagem: grep `db:seed`/`prisma db seed` no `backend/Dockerfile` e no `docker-entrypoint.sh` → zero ocorrências; entrypoint só `migrate deploy` + `node dist/main.js`.

## 5. Docs, gates e entrega

- [ ] 5.1 README "Como rodar": `make up` + `make seed` (e nota de dados fictícios). docs/07: nota curta sobre o seed (dev, idempotente, fora da imagem). Backlog/05: grep "seed" — se nada, registrar "sem menções a atualizar".
- [ ] 5.2 Gates: lint, format, typecheck, test (baseline), build, `pnpm audit --audit-level high` (exit 0), `openspec validate --all`. `make down` no fim. Commits semânticos, push, PR sem merge (colar link).
