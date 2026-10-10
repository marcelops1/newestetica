# Design: seed-banco-local

## Contexto

`backend/prisma/seed.mjs` já existe (precedentes do Catálogo e do Conteúdo Público): SQL `pg` parametrizado, upsert `ON CONFLICT (id)`, ids estáveis, comentário de dado 100% fictício. Ele só é alcançável via `migrations.seed` (roda em `prisma migrate dev`, nunca em `migrate deploy` — que é o que o entrypoint do container executa). `make up` sobe banco limpo com as migrations aplicadas e nenhuma linha nas tabelas públicas.

## Decisões

1. **Reutilizar o formato existente, não reescrever**: mesmo `pg` + upsert por id estável; só trocar o conteúdo (fora pacientes/atendimentos, entrar horários). Zero toolchain nova — precedente registrado: o cliente Prisma gerado é TS/CJS e não carrega sob ESM nativo do Node sem toolchain.
2. **Pacientes e atendimentos saem do seed**: seed de dev compartilhável não deve carregar tabela de paciente (nem fictícia) — docs/security/03 §4/§11. Quem precisa de dado operacional (financeiro/atendimento) tem os testes de integração; o painel admin nasce com CRUD autenticado. YAGNI.
3. **Horários futuros gerados no seed**: ids estávels (`slot-dev-1`…), `start` calculado a partir do dia da execução (próximos dias úteis, 09:00/14:00 -03:00). Fixar datas faria o seed nascer velho (os mocks do frontend já nasceram: 2026-09-14 está no passado). Upsert por id mantém a idempotência de contagens; re-rodar em outro dia apenas refresca as datas — comportamento desejável em dev. +1 horário futuro com `available=false` para provar o filtro da rota.
4. **Guarda de produção** (primeira linha do script): se `NODE_ENV=production`, `console.error` com mensagem clara e `process.exit(1)` — antes de abrir conexão. O container já define `NODE_ENV=production`; a guarda cobe execução acidental dentro da imagem.
5. **Fora da imagem por construção**: Dockerfile copia o código e roda `prisma generate`; entrypoint roda `migrate deploy` (sem seed) + `node dist/main.js`. Nenhum passo referencia `db:seed`/`prisma db seed`. Manter `migrations.seed` no `prisma.config.ts` (conveniência do `migrate dev`, inofensivo em deploy).
6. **Teste automatizado enxuto**: `seed.int-spec.ts` (padrão `test/integration/database.ts` — `resetDatabase` + `createTestPrismaClient`) com 2 casos: spawn do script com `NODE_ENV=production` (exit ≠ 0, sem tocar no banco) e idempotência (reset → seed → contagens → seed → contagens idênticas; delta de Patient/Attendance = 0).

## Alternativas consideradas

- **Importar os mocks do frontend**: rejeitada — direção de dependência errada (backend nunca importa de frontend;precedente do Catálogo).
- **Deixar pacientes fictícios "para testar o painel"**: rejeitada — escopo do change e princípio de segurança; painel autenticado tem seus próprios testes.
- **Datas fixas de horário (determinismo total)**: rejeitada — Horários fixos envelhecem; o cálculo no seed entrega sempre horários futuros, que é o requisito.
- **Rodar seed via entrypoint do container (dev profile)**: rejeitada — misturaria ciclo de vida do container com dev; `make seed` explícito é mais claro e não arrisca produção.

## Riscos

- **Contagem instável por specs vizinhas**: mitigado com `resetDatabase` no início do spec (ordem sequencial garantida por `fileParallelism: false`).
- **Seed quebrar com schema novo**: o spec roda contra o mesmo banco de teste (global-setup aplica migrations) — qualquer deriva de coluna quebra o teste, não a DEV.
- **Execução acidental em produção**: guarda + `NODE_ENV=production` no Dockerfile; mensagem de erro explícita.
