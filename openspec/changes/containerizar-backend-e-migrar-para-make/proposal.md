# Change: containerizar-backend-e-migrar-para-make

## Why

O serviço `backend` está comentado no compose desde o PR #29 (antes de existir código), mas hoje há 4 módulos NestJS prontos sem imagem nem serviço — o stack local não sobe o backend de jeito nenhum. Ao mesmo tempo, os scripts `infra:up`/`infra:down` serão substituídos por um Makefile com autodescoberta (`make help`), por decisão de ergonomia.

## What Changes

- Novo `backend/Dockerfile` multi-stage (build + runtime non-root, imagem enxuta), seguindo o padrão do `frontend/Dockerfile`, com geração do Prisma Client no build e migrations via entrypoint antes do start.
- Serviço `backend` descomentado e ativo em `infra/docker/docker-compose.yml` (build a partir da raiz, `DATABASE_URL` interna, porta documentada, `depends_on` do postgres saudável, healthcheck real em `GET /health`).
- Novo `Makefile` na raiz com `help` (padrão) + `up`, `down`, `logs`, `build`, `restart`, `ps`, `db-shell` — cada target com descrição para o `make help`.
- **BREAKING (convenção local):** removidos `infra:up`/`infra:down` do `package.json` raiz; todas as referências (docs, comentários de config) atualizadas para `make up`/`make down`. Não coexistem.
- Docs: `docs/architecture/04-decisoes-tecnicas.md` §19 e `docs/product/05-estado-atual.md` atualizados (backend containerizado, convenção make).

## Capabilities

### New Capabilities

- Nenhuma (o comportamento novo cabe na capability existente abaixo).

### Modified Capabilities

- `infra-docker`: o stack passa a incluir o serviço `backend` ativo e saudável; o ciclo de vida do stack passa a ser operado via Makefile em vez dos scripts pnpm (comportamento observável e testável em ambos os casos).

## Impact

- `backend/Dockerfile` (novo), `backend/docker-entrypoint.sh` (novo, se confirmado na implementação), `infra/docker/docker-compose.yml` (serviço ativo), `Makefile` (novo), `package.json` raiz (remoção de 2 scripts), `backend/stryker.config.mjs` (comentário), `docs/product/05-estado-atual.md`, `docs/architecture/04-decisoes-tecnicas.md` §19.
- Sem impacto em frontend, contratos, specs de produto, banco (nenhuma migration nova) ou CI.
