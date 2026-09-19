# Change: criar-infraestrutura-docker

## Why

A decisão de orquestrar o ambiente do backend com Docker (04 §19: Keycloak, PostgreSQL, NestJS) nunca saiu do papel — `infra/docker/` está vazio — e o destino final de hospedagem será AWS ou VPS (Vercel é só demo), o que exige o frontend containerizado para portabilidade. Sem essa base, o primeiro módulo do backend nasceria sem banco/IdP locais, sem paridade dev/prod e com a máquina do desenvolvedor poluída. Criar a infra **antes** de qualquer código de backend, mantendo o host limpo (tudo em containers).

## What Changes

- `infra/docker/docker-compose.yml`: serviços `postgres` (pin estável, volume nomeado, healthcheck `pg_isready`), `keycloak` (pin estável, modo dev, realm de exemplo importado, `depends_on` postgres saudável) e `backend` como **bloco comentado** (descomenta quando `backend/Dockerfile` existir); rede dedicada; nada de E2E/Playwright (fora, já decidido).
- `frontend/Dockerfile` multi-stage (build + runtime mínimo, usuário não-root, standalone output) + one-liner `output: "standalone"` em `frontend/next.config.ts`; **sem substituir** o deploy Vercel de demo.
- `backend/Dockerfile` **adiado**: sem código para empacotar ainda; nasce com o primeiro módulo (decisão justificada no design).
- `infra/docker/.env.example` com todas as variáveis (portas, credenciais fictícias de desenvolvimento, nunca segredos reais; `.env` já ignorado pelo `.gitignore` raiz).
- Scripts `infra:up` / `infra:down` no `package.json` raiz (padrão de delegação pnpm vigente; `Makefile` vazio segue intocado).
- Atualiza o §19 do 04 (frontend também containerizado, Vercel-demo reconciliado como demo).
- Explicitamente fora: qualquer código de backend, specs de produto, backlog/05, E2E/Playwright, deploys reais.

## Capabilities

### New Capabilities

- `infra-docker`: ambiente local containerizado do projeto (compose, imagens, contrato de env, scripts de ciclo de vida) — ver `specs/infra-docker/spec.md`.

### Modified Capabilities

- Nenhuma (nenhum requirement existente muda).

## Impact

- Novos: `infra/docker/docker-compose.yml`, `infra/docker/.env.example`, `infra/docker/keycloak/realm-newestetica.json` (mínimo), `frontend/Dockerfile`, `specs/infra-docker/spec.md`.
- Editados: `frontend/next.config.ts` (one-liner standalone), `package.json` (scripts), `docs/architecture/04-decisoes-tecnicas.md` (§19).
- Sem impacto em código de produto além do one-liner, specs de produto, contratos, mocks ou dados.
