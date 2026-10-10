# Change: seed-banco-local

## Why

Num banco novo (subida limpa do `make up`), `GET /procedures` — e todas as demais leituras públicas (`/testimonials`, `/posts`, `/before-after`, `/slots/available`) — devolve `[]`. Um seed quase completo já existe (`backend/prisma/seed.mjs`, escrito nos changes do Catálogo/Conteúdo), mas:

1. **Não é executável para desenvolvimento**: só está ligado ao `migrations.seed` do `prisma.config.ts`, que roda em `prisma migrate dev` — o entrypoint do container usa `migrate deploy`, que **não** roda seed. Não existe `db:seed` nem `make seed`: a única forma de popular o banco é manual.
2. **Traz pacientes e atendimentos fictícios** que não deveriam estar num seed de dev compartilhável (princípio docs/security/03 §4: dado de paciente não circula em material de desenvolvimento, mesmo ilustrativo).
3. **Não cobre agendamento**: sem horários, o fluxo público de slots fica vazio.
4. **Não tem guarda de produção**: nada impede rodar o seed (ou o commit que o adiciona) contra um banco de produção por acidente.

## What Changes

- Reescreve `backend/prisma/seed.mjs` (mesmo formato/precedentes: `pg` parametrizado, SQL upsert por id estável, comentário de dado fictício): remove pacientes e atendimentos; adiciona **horários futuros disponíveis** (gerados a partir da data do seed, para nunca nascerem no passado) + 1 horário futuro **indisponível** para provar o filtro da rota pública. Mantém procedimentos (7 fictícios, 1 inativo), depoimentos (5), posts (4) e casos de antes/depois (3, 1 sem consentimento).
- **Guarda de produção**: com `NODE_ENV=production` o seed aborta com exit ≠ 0 e mensagem clara (o container já sobe com `NODE_ENV=production` — a guarda protege até execução manual dentro da imagem).
- Wiring: script `db:seed` no `backend/package.json` (`node prisma/seed.mjs`) e alvo `make seed` no `Makefile` (com linha no `make help`).
- Confirma que o seed **não** entra na imagem de produção: Dockerfile só copia o código e roda `prisma generate`; o entrypoint roda `migrate deploy` (que não executa seed) + `node dist/main.js`. Nenhum passo de build/invocacao referencia `db:seed`/`prisma db seed` (verificado + campo de prova).
- **Test-first com prova executável no fluxo real** (docs/07 §4 não se aplica — o seed é comportamento executável):
  - RED: após `make up` (banco limpo), `curl` em `/procedures`, `/testimonials`, `/posts`, `/before-after`, `/slots/available` → todos `[]`.
  - GREEN: após `make seed`, `/procedures` devolve ≥6 itens (o desativado **não** aparece), `/before-after` não traz o caso sem consentimento, `/slots/available` devolve horários futuros (o indisponível não aparece), e uma **segunda** execução do seed não altera contagens (idempotência).
  - Refuso em produção: execução com `NODE_ENV=production` sai ≠ 0 — prova automatizada (spawn) no verification.
- Testes automatizados (novo `backend/test/integration/seed.int-spec.ts`, padrão da casa): guarda de produção (spawn, exit ≠ 0, mensagem) e idempotência (reset → seed → contagens → seed de novo → contagens idênticas; pacientes/atendimentos com delta zero).
- README (seção "Como rodar": `make up`, `make seed`). docs/07: nota curta sobre seed de dev (idempotente, fictício, fora da imagem). Backlog/05: verificar menções a seed — nenhuma esperada (grep prévio negativo; registrar).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

Nenhuma — `skip_specs: true`.

**Justificativa do `skip_specs`:** nenhum comportamento do produto muda: as rotas públicas e seus contratos já são especificados (catálogo, conteúdo, agendamento) e o seed não altera regra, filtro ou resposta — apenas popula o banco **local de desenvolvimento** com dados fictícios. O que o change adiciona é ferramental de dev (script + make) e um teste de ferramental; inventar um requirement de produto para satisfazer a validação seria burla do processo. A garantia é a prova executável RED/GREEN no fluxo real + os gates verdes.

## Impact

- Alterados: `backend/prisma/seed.mjs`, `backend/package.json` (script `db:seed`), `Makefile` (alvo `seed` + help), `README.md` (Como rodar), `docs/engineering/07-workflow-de-engenharia.md` (nota seed).
- Novo: `backend/test/integration/seed.int-spec.ts`.
- Nenhum código de produto (src/), contrato, migration ou schema alterado; `pnpm-lock.yaml` intocado (zero dependência nova — `pg` já é devDep do backend); imagem de produção intocada.
- Rollback: reverter seed.mjs/package.json/Makefile/README/docs e remover o spec.
