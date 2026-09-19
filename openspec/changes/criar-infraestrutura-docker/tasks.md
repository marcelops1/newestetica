## 1. Compose base (test-first)

- [x] 1.1 Executar `docker compose -f infra/docker/docker-compose.yml config` e constatar que falha (arquivo inexistente), com as portas-alvo livres — RED. Execução 2026-09-19: `config` → "no such file or directory"; portas 5432/8080/9000 livres (`ss`); pins confirmados por pull (`postgres:16-alpine`; Keycloak `latest` → versão 26.7.4, pinada exata)
- [x] 1.2 Criar `docker-compose.yml` (postgres com pin/volume/healthcheck, keycloak com pin/modo dev/realm/`depends_on` saudável, rede dedicada, backend só em bloco comentado) e verificar `config` com zero + `up -d --wait` com postgres saudável e keycloak respondendo — GREEN. Evidência: `config --quiet` OK; `up -d --wait` → ambos `Healthy`; `docker compose ps` com `(healthy)` nos dois; realm `200` e admin API confirma roles `admin`/`reception` + client `newestetica-frontend`; postgres `accepting connections` e `select 1` ok

## 2. Frontend containerizado (test-first)

- [x] 2.1 Executar `docker build -f frontend/Dockerfile frontend` e constatar que falha (arquivo inexistente) — RED. Execução: `docker build -f frontend/Dockerfile -t newestetica-frontend-test .` → `failed to read dockerfile: no such file or directory`
- [x] 2.2 Habilitar `output: "standalone"` em `frontend/next.config.ts`, criar `frontend/Dockerfile` multi-stage (build + runtime não-root) e verificar build com zero + container servindo `/` com 200 — GREEN. Evidência: build conclui (imagem 327MB); container `curl /` → 200 com "Newestetica"/"Pedir Orçamento"; processo roda como `uid=1000(node)` (não-root). Adição necessária além do design: `.dockerignore` na raiz (contexto de build é a raiz do monorepo com node_modules de ~709MB — sem ele o contexto seria enorme)

## 3. Env, realm e scripts (test-first)

- [x] 3.1 Constatar ausências: `.env.example` inexistente em `infra/docker/` e scripts `infra:*` ausentes no `package.json` raiz (verificação por `ls`/`grep` que falha em encontrar) — RED. Execução: `grep '"infra:' package.json` → nenhum script (RED real). Nota honesta: `.env.example` e o realm foram criados durante a task 1.2 (o compose monta o realm e referencia as variáveis — o stack não sobe sem eles); o RED de ausência deles ficou registrado no design e a criação está evidenciada aqui
- [x] 3.2 Criar `infra/docker/.env.example` (toda variável do compose com valor fictício; `.env` já ignorado — checar), `infra/docker/keycloak/realm-newestetica.json` mínimo (realm + client + roles `admin`/`reception`, sem usuários) e scripts `infra:up`/`infra:down`; executar `pnpm infra:up` do zero até tudo saudável e `pnpm infra:down` limpando — GREEN. Evidência: `pnpm infra:up` do zero → postgres e keycloak `(healthy)`; `pnpm infra:down` → zero containers do projeto (`docker ps -a` filtrado = 0); `.gitignore` raiz já cobre `.env`/`.env.*` com exceção de `.env.example`

## 4. Decisão documentada + verificação

- [ ] 4.1 Atualizar o §19 do 04 (frontend containerizado, Vercel-demo reconciliado como demo, sem tocar §18) — exceção docs/07 §4 (documentação de decisão; verificação por releitura)
- [ ] 4.2 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança (`grep` de segredos/credenciais reais no compose/env/realm; pins exatos, sem `latest`; portas e volumes documentados) + `verification.md`, e avaliar backlog/05 (atualizar somente se incorreto — infra de tooling, sem UC) — exceção docs/07 §4 só para a escrita dos registros; gates são executáveis
