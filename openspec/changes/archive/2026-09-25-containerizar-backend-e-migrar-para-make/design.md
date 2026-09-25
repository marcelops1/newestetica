## Context

Ver `proposal.md` (Why). Estado verificado: `backend/Dockerfile` não existe e o serviço está comentado no compose desde o PR #29; hoje há 4 módulos NestJS + `main.ts` lendo `PORT` (padrão 3001) + `GET /health` retornando `{status: "ok"}`; `src/generated/` é gitignored (o Prisma Client nasce no `postinstall`, e `prisma.config.ts` tem fallback de URL placeholder — `generate` não precisa de banco); `prisma: ^7.10.0` é devDependency, `@prisma/client` + adapter são runtime; `tsconfig.build.json` emite em `dist/` excluindo specs/testes; `.dockerignore` da raiz já exclui `node_modules`, `infra`, docs e `openspec`; `make` e `docker compose v5` presentes na máquina.

## Goals / Non-Goals

**Goals:**

- `docker compose up` (via `make up`) subir postgres + keycloak + backend saudáveis do zero, com migrations aplicadas sem passo manual.
- Trocar a convenção `infra:*` por `make` sem deixar referência viva fora do archive.

**Non-Goals:**

- Hardening de produção (distroless, multi-instância, migração fora do entrypoint) — escopo é paridade local/staging inicial.
- Mudar CI, frontend, contratos, banco (nenhuma migration nova) ou o realm.

## Decisions

### 1. Migrations no entrypoint do próprio serviço (não job separado, não manual)

Um `backend/docker-entrypoint.sh` (ou bloco equivalente) roda `prisma migrate deploy` com a `DATABASE_URL` do ambiente e só então `node dist/main.js`, falhando rápido (exit ≠ 0) se migrar falhar. Rationale: um `up` precisa deixar tudo funcionando sem passo manual; o job separado exigiria a mesma imagem com o CLI de todo jeito (mesmo custo, mais uma peça de orquestração e uma condição `service_completed_successfully` para gerenciar). Alternativas consideradas: serviço `backend-migrate` one-shot (rejeitado — mesma exigência de imagem, mais complexidade; revisitar com múltiplas instâncias); migrations manuais/CI (`pnpm --filter backend db:migrate`, rejeitado — deriva entre imagem e banco; dev esquece no volume limpo).

### 2. Runtime com node_modules completo do builder (CLI do Prisma dentro)

O estágio runtime copia `dist/`, `prisma/` (schema + migrations + config), `package.json`s e o `node_modules` do builder — incluindo o pacote `prisma` (CLI), sem o qual o entrypoint não migra. Rationale: `migrate deploy` precisa do CLI + engines; podar devDeps e recosturar o CLI é frágil e o ganho (centenas de MB num ambiente local) não paga a complexidade agora. Alternativa considerada: `pnpm install --prod` + cópia cirúrgica do CLI (rejeitada — acoplamento à estrutura interna do pacote; trigger: imagem enxuta vira requisito quando houver deploy real).

### 3. Healthcheck via wget contra `GET /health` na porta interna fixa

`test: ["CMD-SHELL", "wget -q -O /dev/null http://127.0.0.1:3001/health"]` (busybox presente na base Alpine). Rationale: sem dependência nova e sem quoting de JS no shell; `main.ts` já expõe `/health`. Alternativa considerada: `node -e` com `fetch` (rejeitada — quoting frágil; fallback se o wget sumir da base).

### 4. `depends_on` só do postgres saudável (sem keycloak)

O backend não integra com Keycloak ainda; depender dele serializaria o boot atrás de ~30s+ de start sem benefício. Rationale: dependência declara necessidade real, não topologia futura. Trigger explícito: quando Identidade nascer, o change dela adiciona a dependência.

### 5. `DATABASE_URL` construída inline (padrão existente)

Mantém a construção `postgresql://${POSTGRES_USER:-...}:...@postgres:5432/...` do bloco comentado — zero variável nova, `.env.example` já cobre tudo (tarefa de auditoria confirma). Sem segredos novos.

### 6. Makefile como única interface (sem coexistência)

`.DEFAULT_GOAL := help`, `.PHONY` em tudo, `COMPOSE := docker compose -f infra/docker/docker-compose.yml`, `help` por `grep`/`awk` nos comentários `##`, `$$` escapado onde o shell precisa de `$` (ex.: `db-shell` com defaults). Targets: `up` (`up -d --wait`), `down` (`down --remove-orphans`, igual ao script antigo), `logs` (`logs -f`), `build` (`build`), `restart` (`restart` in-place, documentado), `ps`, `db-shell` (`exec postgres psql` com defaults). Rationale: `make help` autodescobre — a ergonomia pedida; sem target destrutivo de volumes (decisão consciente: dado local não se apaga por conveniência; documentado no help/comentário). Alternativa considerada: manter `infra:*` como alias (rejeitada — o pedido é substituir, não coexistir; duas convenções apodrecem).

### 7. Remoção total dos scripts pnpm + atualização das 3 referências vivas

Remove `infra:up`/`infra:down` do `package.json` raiz; atualiza `docs/product/05-estado-atual.md` (bullet do §19) e o comentário do `backend/stryker.config.mjs`. Referências em `openspec/changes/archive/` são registro histórico e SHALL NOT ser tocadas. Verificação por `grep` auditando zero ocorrências fora do archive.

## Risks / Trade-offs

- [Risco] `migrate deploy` concorrente em múltiplas instâncias → Mitigação: fora de escopo (instância única local); registrado como motivo para revisitar a decisão 1 no deploy real.
- [Risco] Imagem maior por carregar devDeps → Mitigação: aceito com trigger explícito (decisão 2); Alpine + non-root mantidos.
- [Risco] `make` ausente na máquina de alguém → Mitigação: `make` é onipresente em Linux/macOS e já presente aqui; o compose direto continua funcionando (o Makefile é convenção, não barreira).
- [Trade-off] Sem target destrutivo de volumes → aceito e documentado (dado local protegido por padrão).

## Migration Plan

Ferramenta de desenvolvimento local: sem deploy, sem migração de dados. Rollback = reverter o merge (o compose volta a não ter o serviço; `package.json` volta a ter os scripts — documentado na task de verificação).

## Open Questions

Nenhuma — presença do `wget` na base Alpine, `prisma generate` sem banco (fallback de URL) e `main.ts` lendo `PORT` foram todos verificados no disco antes de propor.
