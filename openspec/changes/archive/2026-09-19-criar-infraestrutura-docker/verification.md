# Verificação — criar-infraestrutura-docker

Change de infraestrutura: compose local (Postgres/Keycloak), frontend containerizado, contrato de env e scripts de ciclo de vida. Data: 2026-09-19.

## Gatilhos de segurança (docs/07 §7)

- **Configuração sensível (gatilho):** variáveis de ambiente, portas e credenciais de desenvolvimento — revisão com `security-and-hardening` obrigatória (abaixo).
- **Entrada de usuário, autenticação, dados de paciente, integrações:** nenhum — infraestrutura local.

### Revisão security-and-hardening (contra docs/03)

- **Threat model (5 min):** fronteira = host do desenvolvedor ↔ containers; ativos = credenciais de dev do Keycloak/Postgres e o realm; abuse cases = (a) segredo real versionado, (b) portas de DB/IdP expostas na rede local, (c) imagem `latest` arrastando mudança silenciosa, (d) container rodando como root, (e) postinstall de terceiros.
- [x] **Segredos:** grep nos arquivos novos (`infra/docker/`, `frontend/Dockerfile`, `.dockerignore`) → só nomes de variáveis e placeholders `changeme-dev`; nenhum segredo real. `.env` real permanece ignorado (`.gitignore` raiz: `.env`, `.env.*`, `!.env.example` — verificado).
- [x] **Exposição de portas:** **achado corrigido no ciclo** — Postgres/Keycloak publicavam em `0.0.0.0`; alterado para bind em `127.0.0.1` (dev), verificado em `docker compose ps` (`127.0.0.1:5432->5432`, `127.0.0.1:8080->8080`) e realm ainda 200.
- [x] **Pins:** `postgres:16-alpine` e `quay.io/keycloak/keycloak:26.7.4` (versão confirmada por pull — `latest` resolvia para 26.7.4); sem `latest`.
- [x] **Privilégios:** sem `privileged`/`cap_add`/`network_mode: host`; frontend roda como `node` (uid 1000), provado em `docker exec ... id`.
- [x] **Supply-chain:** nenhuma dependência npm nova; imagens oficiais (docker.io/quay.io); realm sem usuários reais (só roles `admin`/`reception` e client dev).
- [x] **Dados:** nenhum dado real de paciente; credenciais de dev explicitamente fictícias e documentadas como tal no `.env.example`.
- **Conclusão:** gatilho acionado e revisado; 1 achado real corrigido no ciclo (loopback binding). Sem pendências.

## Prova executável (sem exceção §4 na infra)

- **RED 1.1:** `compose config` → arquivo inexistente; portas 5432/8080/9000 livres.
- **GREEN 1.2:** `config --quiet` OK; `up -d --wait` → ambos `Healthy`; `compose ps` com `(healthy)`; realm 200; admin API confirma roles/client; postgres `accepting connections`.
- **RED 2.1:** `docker build -f frontend/Dockerfile .` → "failed to read dockerfile".
- **GREEN 2.2:** build ok (imagem 327MB); container `curl /` → 200 com conteúdo real; processo uid 1000.
- **RED 3.1:** `grep '"infra:' package.json` → nenhum script.
- **GREEN 3.2:** `pnpm infra:up` do zero → ambos healthy; `pnpm infra:down` → zero containers do projeto.
- **Pós-hardening:** `pnpm infra:up` de novo → ambos healthy com bind loopback; realm 200; `down` limpo.

## Revisão code-review-and-quality (foco)

- **Correção:** stack sobe/serve; frontend builda e responde; scripts funcionam do zero.
- **Arquitetura:** pins + healthchecks + rede dedicada; backend comentado até ter código (decisão justificada); `.dockerignore` necessário para o contexto do monorepo.
- **Achados:** nenhum Critical/Required. *Nota honesta:* `.env.example` e o realm nasceram na task 1.2 (o stack não sobe sem eles) — registrado na task; `.dockerignore` foi adição necessária além do design.
- **Veredito:** Aprovado.

## Aplicação da seção 13

- **Aplicado — prova executável de infra:** compose/build/curl/ps como veículo RED→GREEN.
- **Aplicado — segurança:** threat model + revisão acima, com achado corrigido.
- **Dispensado — unitários/OWASP/contrato/mutation/E2E/carga:** sem código de produto além do one-liner do next.config; E2E fica para o change da primeira jornada (fora, como decidido).

## Backlog/05 (task 4.2)

- `docs/product/08-backlog-produto.md`: **sem alteração** — infra é tooling sem UC; Épico 4 intacto.
- `docs/product/05-estado-atual.md`: **corrigido** — o bullet do §19 dizia "implementação quando o backend começar"; agora registra a base implementada (`pnpm infra:up`, pins/healthchecks) com o serviço do backend adiado.

## Gates executados (task 4.2)

- `pnpm lint` — passou (0 erros; 1 warning pré-existente em `stryker.config.mjs`)
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 15 arquivos, 109 testes, 100% (inalterado)
- `pnpm build` — passou (21 páginas; `output: "standalone"` não quebrou o build — `frontend/.next/standalone/frontend/server.js` gerado)
- `pnpm exec openspec validate --changes` — passou (1 passed, 0 failed)
