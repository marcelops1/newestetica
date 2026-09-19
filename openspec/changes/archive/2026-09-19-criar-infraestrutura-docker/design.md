## Context

Ver `proposal.md` (Why). Ponto de partida verificado: 04 §19 decide Docker mas `infra/docker/` está vazio; `Makefile` raiz existe vazio (0 bytes); `frontend/next.config.ts` **sem** `output: "standalone"` (sem ele, multi-stage standalone é impossível); `.gitignore` raiz já ignora `.env`/`.env.*` com exceção para `.env.example`; frontend tem script `start` (`next start`); Docker 29.8.1 + Compose v5.5.1 disponíveis na máquina; nenhuma spec cobre infra (o `docker` na spec `docs-organization` refere-se só à pasta de docs).

## Goals / Non-Goals

**Goals:**

- Base containerizada funcional e testada (compose + imagens + env + scripts), pronta para o primeiro módulo do backend, sem poluir o host.

**Non-Goals:**

- Código de backend, specs de produto, backlog/05, E2E/Playwright, deploys reais, preencher o `Makefile`.

## Decisions

### 1. `infra-docker` como capability nova (não `skip_specs`)

Rationale: healthchecks, volumes nomeados, contrato de env e scripts `up/down` são obrigações testáveis que futuros changes vão consumir (backend, Keycloak, Testcontainers) — "só configuração" subestima; precedente: a spec `engineering-workflow` normatiza hook/gates da mesma forma. Alternativa considerada: `skip_specs` (rejeitada — deixaria o contrato de ambiente sem fonte de verdade testável).

### 2. Backend comentado no compose + `backend/Dockerfile` adiado

Rationale: bloco comentado documenta a forma futura exata sem quebrar `up`/healthchecks; Dockerfile de código inexistente seria config morta untestable. Alternativas consideradas: serviço ativo apontando para backend vazio (rejeitada — falha no build/health e quebra o GREEN); omitir qualquer menção (rejeitada — esconde a intenção aprovada).

### 3. Frontend standalone + one-liner em `next.config.ts`

Rationale: sem `output: "standalone"`, multi-stage exigiria copiar `node_modules` inteiro (imagem pesada, lenta). Alternativa considerada: Dockerfile sem standalone (rejeitada — contraria o objetivo de portabilidade leve para VPS).

### 4. Realm mínimo com roles, sem usuários reais

Rationale: IdP utilizável no dia um do backend (roles `admin`/`reception` alinhadas ao RBAC do MVP); credenciais só via env de desenvolvimento. Alternativas consideradas: Keycloak nu sem realm (rejeitada — atrasa a primeira integração); realm com usuários (rejeitada — dado fictício versionado além do necessário).

### 5. `.env.example` em `infra/docker/` + pnpm scripts (`infra:up`, `infra:down`)

Rationale: compose carrega `.env` do próprio diretório por padrão; scripts no `package.json` raiz seguem o padrão de delegação vigente (`pnpm dev`, `pnpm lint`…); `Makefile` vazio segue intocado (segunda superfície de comando seria redundância). Alternativas consideradas: `.env` na raiz (rejeitada — longe do compose); preencher o `Makefile` (rejeitada — duplicaria a superfície de comandos do projeto).

### 6. §19 atualizada (frontend + reconciliação Vercel-demo)

Rationale: o escopo real expandiu além do texto de 2026 (só backend); sem a atualização, 04 diria "só backend" enquanto o repo teria `frontend/Dockerfile` — decisão implícita contraditória. Vercel segue como demo (04 §18 intacto). Alternativa considerada: deixar §19 como está (rejeitada — contradição direta com o que será implementado).

### 7. Test-first com compose/build/curl como veículo (sem exceção §4 na infra)

Rationale: `config`/`up --wait`/`build`/`curl` são verificações executáveis com pass/fail — RED real (arquivo inexistente falha) antes de cada GREEN, mesmo padrão da prova do hook no change do husky. Exceção §4 só para a escrita de docs (§19, `verification.md`, backlog-eval). Alternativas consideradas: jsdom/unitários para infra (rejeitada — categoria errada de teste); só runtime sem RED prévio (rejeitada — docs/07 §5 exige a prova de falha antes).

## Risks / Trade-offs

- [Risco] Pull pesado do Keycloak na primeira vez → Mitigação: uma vez só, depois cacheado; documentado na task com timeout generoso.
- [Risco] Série estável do Keycloak vigente no apply → Mitigação: pin exato confirmado via `docker pull` no apply (`postgres:16-alpine` fixo; Keycloak na série estável vigente); divergência vira erro visível, não silencioso.
- [Trade-off] Realm mínimo versionado é dado fictício a mais no repo → aceito: sem usuários, só estrutura de roles alinhada ao RBAC do MVP.
