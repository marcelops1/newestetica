## 1. Compose base (test-first)

- [ ] 1.1 Executar `docker compose -f infra/docker/docker-compose.yml config` e constatar que falha (arquivo inexistente), com as portas-alvo livres — RED
- [ ] 1.2 Criar `docker-compose.yml` (postgres com pin/volume/healthcheck, keycloak com pin/modo dev/realm/`depends_on` saudável, rede dedicada, backend só em bloco comentado) e verificar `config` com zero + `up -d --wait` com postgres saudável e keycloak respondendo — GREEN

## 2. Frontend containerizado (test-first)

- [ ] 2.1 Executar `docker build -f frontend/Dockerfile frontend` e constatar que falha (arquivo inexistente) — RED
- [ ] 2.2 Habilitar `output: "standalone"` em `frontend/next.config.ts`, criar `frontend/Dockerfile` multi-stage (build + runtime não-root) e verificar build com zero + container servindo `/` com 200 — GREEN

## 3. Env, realm e scripts (test-first)

- [ ] 3.1 Constatar ausências: `.env.example` inexistente em `infra/docker/` e scripts `infra:*` ausentes no `package.json` raiz (verificação por `ls`/`grep` que falha em encontrar) — RED
- [ ] 3.2 Criar `infra/docker/.env.example` (toda variável do compose com valor fictício; `.env` já ignorado — checar), `infra/docker/keycloak/realm-newestetica.json` mínimo (realm + client + roles `admin`/`reception`, sem usuários) e scripts `infra:up`/`infra:down`; executar `pnpm infra:up` do zero até tudo saudável e `pnpm infra:down` limpando — GREEN

## 4. Decisão documentada + verificação

- [ ] 4.1 Atualizar o §19 do 04 (frontend containerizado, Vercel-demo reconciliado como demo, sem tocar §18) — exceção docs/07 §4 (documentação de decisão; verificação por releitura)
- [ ] 4.2 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança (`grep` de segredos/credenciais reais no compose/env/realm; pins exatos, sem `latest`; portas e volumes documentados) + `verification.md`, e avaliar backlog/05 (atualizar somente se incorreto — infra de tooling, sem UC) — exceção docs/07 §4 só para a escrita dos registros; gates são executáveis
