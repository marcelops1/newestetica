# Verificação — containerizar-backend-e-migrar-para-make

- **Change:** `openspec/changes/containerizar-backend-e-migrar-para-make` (branch `chore/containerizar-backend-e-migrar-para-make`)
- **Data:** 2026-09-25
- **Gatilhos de segurança (docs/engineering/07 §7):** **nenhum direto** (infra de desenvolvimento: sem entrada de usuário, sem auth, sem dado de paciente, sem integração externa). Auditoria registrada na seção 3 mesmo assim (segredos, binds, non-root).

## 1. Provas por grupo (RED → GREEN)

| Grupo | RED real colado | GREEN com evidência |
| --- | --- | --- |
| 0 — baseline | `config --services` sem backend; build `failed to read dockerfile`; `make help` → `No rule to make target` | pré-requisitos: GNU Make 4.4.1, Compose v5.5.1 |
| 1 — Dockerfile | mesmo build RED acima | build 2 estágios exit 0 (~17s); `whoami` → `node` (non-root); `dist/main.js` presente; 922MB (aceito na decisão 2) |
| 2 — entrypoint | **com pass-through: container `Up` e `/health → 200` com banco inalcançável** (boot silencioso) | fail-fast `exit=1` com `P1001`; banco limpo: `4 migrations found` + `All migrations have been successfully applied` + `Iniciando backend` + health 200; `\dt` com 7 tabelas + `_prisma_migrations` |
| 3 — compose ativo | backend fora do grafo (grupo 0) | `config --services` → postgres/backend/keycloak; projeto com **volume limpo** (`-p newestetica_clean`): `up --wait` exit 0 com **backend/keycloak/postgres `(healthy)`** e `GET :3001/health → {"status":"ok"}` |
| 4 — Makefile | `make help` RED (grupo 0) | `make help` lista os 8 alvos; **cada target exercitado**: up (3 healthy), ps, logs (streaming), build (`Image newestetica-backend Built`), restart (3 healthy), db-shell (`select 1` → `ok=1`), down (**0 containers**, volume de dev preservado) |
| 5 — scripts pnpm | 4 referências vivas coladas (package.json, stryker, 05 + main spec) | scripts removidos; stryker/05 → `make`; auditoria zero fora do archive; `pnpm infra:up` → `Command "infra:up" not found` |

**Correções em voo (registradas):** faltava copiar `backend/node_modules` no runtime (symlinks do pnpm) — o primeiro run morreu com `MODULE_NOT_FOUND` em `@nestjs/core`; corrigido no Dockerfile e re-verificado. A entrada de `wget` do healthcheck foi confirmada no container real (Compose reportou `healthy`).

## 2. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `docker compose config --quiet` | ✅ 0 (3 serviços no grafo) |
| `pnpm lint` / `format` / `typecheck` | ✅ 0 / 0 / 0 |
| `pnpm test` (com o stack no ar) | ✅ **82 arquivos / 390 testes** (backend 54/220, contracts 13/61, frontend 15/109) |
| `pnpm build` | ✅ limpo |
| `pnpm audit --audit-level high` | ✅ 0 high/critical (3 moderate — baseline) |

## 3. Revisão de segurança (sem gatilho; auditoria)

| Verificação | Resultado |
| --- | --- |
| Segredos | nenhum novo; `DATABASE_URL` construída inline com defaults `changeme-dev` (padrão já existente, `.env` ignorado); nenhum segredo em Dockerfile/compose/Makefile |
| Superfície de rede | backend com bind **loopback** (`127.0.0.1:${BACKEND_PORT:-3001}`), como os demais serviços |
| Execução | runtime Alpine **non-root** (`USER node`), entrypoint com `set -e` (falha rápida, sem boot silencioso sem banco) |
| Dados | nenhum dado real; migrations apenas aplicam schema; volume de dev preservado no `make down` (sem target destrutivo de volumes, decisão consciente) |
| Imagem | 922MB (devDeps + CLI do Prisma no runtime) — aceito na decisão 2 com trigger para poda em deploy real |

## 4. Contexto de ferramentas (honestidade)

- **graphify:** **não ajudou** — o CLI não está instalado nesta máquina (`graphify` ausente), então `graphify query`/`explain`/`update .` não puderam rodar; o grafo existente em `graphify-out/` está **desatualizado** (não cobre os módulos recentes) e não foi usado. Passo 9 do prompt não executado por ausência da ferramenta (registrado).
- **ai-memory:** **não ajudou** — a busca retornou zero páginas compiladas relevantes; só observações cruas da própria sessão de planejamento (raw hits), sem contexto anterior útil.

## 5. Documentação atualizada (task 6.1)

- `docs/architecture/04-decisoes-tecnicas.md` — §2 (linha de orquestração) e §19: backend containerizado/ativo, migrations no entrypoint e convenção `make` (scripts `infra:*` removidos).
- `docs/product/05-estado-atual.md` — bullet do §19 com `make up` e o backend no stack.
- `openspec/specs/infra-docker/spec.md` — sincronizada no archive (delta MODIFIED + ADDED do change).

## 6. Checklist final

- [x] 7 grupos com RED colado antes de cada GREEN
- [x] Prova real `make up` (3 healthy, backend incluso) e `make down` (0 containers)
- [x] Auditoria `infra:up`/`infra:down` zero fora do archive
- [x] Gates completos verdes com o stack no ar
- [x] Sem gatilho de segurança direto; auditoria registrada
- [x] `openspec validate --all` verde; change arquivado com sync
