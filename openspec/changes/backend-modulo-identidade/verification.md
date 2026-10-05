# Verificação — backend-modulo-identidade

- **Change:** `openspec/changes/backend-modulo-identidade` (branch `feature/backend-modulo-identidade`)
- **Data:** 2026-10-04 (apply)
- **Gatilhos de segurança (docs/07 §7):** autenticação e autorização (login/token/sessão/papéis/2FA), **dados de paciente via rotas que passam a ter acesso real**, segredos de teste/CI → revisão de segurança obrigatória (seção 4), com os 7 abuse cases do threat model um a um.

## 0. Baseline de caracterização (task 0.1 — antes de qualquer mudança)

Suíte completa do backend: **75 arquivos / 341 testes verdes**; cobertura 99,66% stmts / 98,08% branches / 100% funcs / 99,65% lines (comando: `pnpm --filter backend test`, log `/tmp/opencode/ident-apply/0.1-baseline.log`).

Recortes por módulo migrado (caracterização — rede de segurança da troca de guard):

| Módulo | Arquivos | Testes |
| --- | --- | --- |
| Pacientes | 9 | 36 |
| Atendimento | 11 | 76 |
| Financeiro | 8 | 36 |

## 1. Emenda de ordem registrada antes do GREEN (padrão §14.9)

- **Tasks 4.x (ataques) executadas após 5.x/6.x:** o RED declarado nas tasks 4.x é o write-then-throw sobre a proteção real ("com a checagem removida de propósito, o forjado passa"); sem o validador (5.2) e o guard (6.2) implementados não existe proteção para remover. Ordem executada: 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8 (test-first preservado: cada ataque tem RED real colado antes do GREEN).
- **Task 6.3 (apagar o `IdentityPendingGuard`) executa ao final do grupo 8:** até a migração dos 3 módulos (8.1–8.4) eles referenciam o guard honesto — apagá-lo antes quebraria a compilação. A prova de ausência (grep) será feita após a 8.4.

## 2. Ataques do threat model — write-then-throw (tasks 4.1–4.7)

Contra a cadeia real (JWKS fake local + `JoseTokenValidator` + `JwtAuthGuard`, sem override de porta). Cada linha: proteção quebrada de propósito → RED colado → restaurada → GREEN.

| Task | Proteção removida (temporária) | RED colado | GREEN |
| --- | --- | --- | --- |
| 4.1 token forjado | verificação de assinatura (decode sem validar) | `expected 200 to be 401` (forjado aceito) | 1 passed |
| 4.2 expiração/skew | tolerância de relógio → 999.999s | `expected 200 to be 401` (expirado aceito) | 1 passed |
| 4.3 audience/issuer | opções `issuer`/`audience` do `jwtVerify` | `expected 200 to be 401` (token de outro client/emissor aceito) | 1 passed |
| 4.4 papel/RBAC | checagem de papel no guard (`if (false)`) | `expected 200 to be 403` (papel insuficiente aceito) | 1 passed |
| 4.5 allowlist de alg | allowlist → `["RS256","ES256"]` | `expected 200 to be 401` (ES256 assinado por chave do JWKS aceito) | 1 passed |
| 4.6 confusão de realms | casamento de `issuer` removido | `expected 200 to be 401` (chave compartilhada com emissor estranho aceita) | 1 passed |
| 4.7 enumeração | mensagem do 401 variável por entrada | corpos 401 diferentes entre entradas | 8 passed (suíte completa) |

**Nota de construção (disciplina §14.5):** `alg: none` e a confusão `HS256` são bloqueados pela própria biblioteca (o jose não verifica token sem assinatura e recusa chave RSA para HMAC); a prova negativa do nosso código é a allowlist (4.5), e o teste com allowlist ampliada demonstra que `none` continua rejeitado mesmo assim — registrado como teste que passa por construção, não como RED.

## 3. Decisões do Apply registradas (instrução do prompt)

- **Biblioteca JWT: `jose@^6.2.12`** (runtime + tipos). Por quê: JWKS nativo (`createRemoteJWKSet`/`createLocalJWKSet`), allowlist de `alg` no `jwtVerify`, zero dependências nativas, mantida e amplamente usada; roda sob o backend CommonJS via `require(esm)` do Node 24 (provado pelo teste de fumaça `jwt-library.smoke.spec.ts`, com round-trip RS256 real). Alternativas rejeitadas: `jsonwebtoken` + `jwks-rsa` (duas dependências e configuração manual de algoritmo/claims); decodificar sem biblioteca (inseguro por definição). Auditoria: `pnpm audit --audit-level high` com saída 0 após a instalação (mesmos 4 moderate + 1 high ignorado pré-existentes).
- **TTL do cache do JWKS: 10 minutos** (`DEFAULT_CACHE_TTL_MS = 600_000`), com **cooldown de 30 s** (`DEFAULT_JWKS_COOLDOWN_MS`) entre refetches disparados por `kid` desconhecido — rotação de chave é absorvida em até um TTL (ou imediatamente após o cooldown, no primeiro token novo). Provado no teste de cache/rotação/quedas (`identity.validator.int.spec.ts`).
- **Tolerância de relógio: 30 s para os dois lados** (`DEFAULT_CLOCK_TOLERANCE_SECONDS = 30`) — cobre skew entre containers; o teste de ataques (4.2) prova skew de 10 s aceito e 60 s rejeitado.
- **Limitação de CI registrada: a prova de 2FA (`identity.two-factor.int.spec.ts`) NÃO roda no CI** — o pipeline de backend não sobe Keycloak; a suíte detecta a indisponibilidade, marca `skip` com motivo (visível no relatório) e só roda localmente com `make up`. A exigência de 2FA está coberta por dois mecanismos versionados no realm: `requiredActions: ["CONFIGURE_TOTP"]` nos usuários + fluxo `browser-with-required-otp` (OTP REQUIRED) com `browserFlow` apontando para ele.
- **Prova de 2FA (local, Keycloak real):** RED invertido capturado — com usuários dev e SEM 2FA, o login só-senha **completava** com `code=` no callback (`expected true to be false`, 2/2); depois da configuração versionada, o fluxo para em `login-actions/required-action?execution=CONFIGURE_TOTP` para `fabiana-dev` (admin) e `recepcao-dev` (reception) — 2/2 verdes. A asserção é específica (para no TOTP; `VERIFY_PROFILE` rejeitado explicitamente — o primeiro rascunho pegava esse falso verde).

## 4. Migração dos 3 módulos (tasks 8.1–8.5 + 6.3) — caracterização

Ordem por módulo: trocar o guard no módulo/controller → suíte antiga reprova (RED colado: 401 real onde se esperava o 403 honesto / requests sem token) → converter as suítes com token via verificador fake e atualizar o Swagger (§17) → verde contra o baseline.

| Módulo | RBAC | Baseline (antes) | Depois | Regressão |
| --- | --- | --- | --- | --- |
| Pacientes | leitura admin+reception; escrita/anonimização admin | unit 9/36 + integração 5/31 (guard antiga) | unit 9/36 (idêntico) + integração 5/31 (guard-spec convertida p/ 401/403/RBAC) | zero de negócio |
| Atendimento | admin+reception (operacional) | 11/76 | 11/77 (+1 caso no guard: 401+403+contraste) | zero de negócio |
| Financeiro | admin-only | 8/36 | 8/35 (guard-spec 4→3 casos, cobrindo 401/403/contraste byte-idêntico; 32 de negócio intactos) | zero de negócio |

- **Suíte completa**: baseline **75 arquivos / 341 testes** → final **85 arquivos / 388 testes** (contratos 100%, cobertura backend 99,7% stmts / 98,17% branches / 100% funcs / 99,69% lines).
- **Guard honesto removido (task 6.3):** `grep` por `IdentityPendingGuard`/`AUTH_NOT_IMPLEMENTED` em `backend/src` e `backend/test` → **vazio** (arquivo apagado; referências migradas).
- **Swagger (8.5):** tags sem "bloqueado até a Identidade"; as 9 rotas administrativas documentam 401 (`AUTH_UNAUTHENTICATED`) e 403 (`AUTH_FORBIDDEN`) fixos; `openapi.int.spec.ts` reescrito para travar o contrato real (18 rotas, nenhuma fantasma). Suítes que sobem o `AppModule` (openapi/gate) ganharam o env do Keycloak exigido pelo bootstrap do `IdentityModule`.

## 5. Revisão de segurança (task 9.2 — `security-and-hardening`)

Abuse cases do threat model do `design.md`, um a um (todos com prova de write-then-throw colada na seção 2):

| # | Abuse case | Resultado / evidência |
| --- | --- | --- |
| 1 | Token forjado (chave estranha, mesmo `kid`; `kid` desconhecido) | 401 idêntico; RED sem a verificação de assinatura (`expected 200 to be 401`) — a assinatura é a barreira (teste 4.1) |
| 2 | Expirado / `nbf` futuro / skew | 401 para 60 s de skew e `nbf` futuro; 10 s dentro da tolerância de 30 s passa; RED com tolerância absurda (4.2) |
| 3 | Audience errada / issuer divergente | 401; RED sem os casamentos de claim (4.3) |
| 4 | Papel ausente/insuficiente + negação por padrão | 403 byte-idêntico para `reception` (insuficiente) e sem papel; rota sem `@Roles` exige autenticação; RED com a checagem de papel desligada (4.4). Matriz MVP: Pacientes leitura admin+reception/escrita admin; Atendimento admin+reception; Financeiro admin-only |
| 5 | `alg: none`, confusão HS256 e allowlist | 401 para `none` e HS256-com-chave-pública (bloqueio da própria biblioteca — registrado como teste de construção); a allowlist `RS256` é a barreira do nosso código: RED com `["RS256","ES256"]` aceitando um ES256 validamente assinado por chave do JWKS (4.5); `none` segue rejeitado até com allowlist ampliada |
| 6 | Confusão de chaves entre realms | 401 para chave compartilhada com emissor estranho (casamento de `iss`) e para token de outro realm (assinatura); RED sem o casamento de issuer (4.6) |
| 7 | Enumeração | Todos os 401 byte-idênticos e sem eco de `kid`/claim/motivo; 403 idêntico por classe; RED com mensagem variável por entrada (4.7) |

| Verificação transversal | Resultado |
| --- | --- |
| Injeção | Identidade não toca banco (`grep` de Prisma/queryRaw no módulo: vazio); o token é dado opaco validado por biblioteca — nada é concatenado |
| SSRF | A URL do JWKS vem de configuração confiável (`KEYCLOAK_ISSUER`/`KEYCLOAK_JWKS_URL`), nunca de entrada de requisição; o atacante não influencia o fetch |
| DoS | Teto de tamanho do token (8.192) no guard e no validador (sem tocar a rede); cache de JWKS com TTL de 10 min + cooldown de 30 s contra flood de `kid` desconhecido; `JwtAuthGuard` falha fechado em erro do verificador |
| Segredos | `grep` de console/Logger no módulo: vazio; realm usa senhas de desenvolvimento explícitas (`dev-*-2fa`, mesmo padrão do `changeme-dev` do compose) — fixture de dev, sem segredo real; `pnpm audit` na seção 8 |
| Timing | Não há comparação de segredo feita à mão: assinatura é verificada pela WebCrypto via jose; nenhum `===` sobre token/chave no nosso código |
| Autorização em toda rota | grep: nenhum controller administrativo sem `@UseGuards(JwtAuthGuard)`; as 9 rotas têm `@Roles` explícito; negação por padrão no guard (rota sem papel = autenticada apenas) |
| PII agora acessível | Rotas de Pacientes/Atendimento/Financeiro passam de "bloqueado para todos" a "acessível por papel" — os controles de visibilidade/anonimização existentes (write-then-throw das suítes) continuam verdes pós-migração; o financeiro é `admin`-only (risco de fishing declarado no change do Financeiro continua com trigger no RBAC real) |
| Fronteira de confiança | Claims tratadas como dado não confiável: `fromTokenClaims` valida `sub`/papéis e filtra desconhecidos sem TypeError (testes); papel vem SEMPRE do token, nunca de path/query |
| Risco residual declarado | Rate-limit de autenticação não entra nesta fatia (trade-off do design, trigger no hardening de staging); 2FA provado localmente e **pulado no CI** (o pipeline não sobe Keycloak) — limitação registrada na seção 3; tokens de acesso vivem no fluxo do Keycloak (o frontend os tratará no Épico 5, 03 §7) |
| Logs de segurança | Não há trilha persistida nesta fatia (03 §12 futuro); falhas de token falham fechado e silenciosas por desenho (anti-oracle) — decisão registrada |

**Achado da revisão:** nenhum bypass, vazamento ou erro de fronteira; o endurecimento de asserção da prova de 2FA (VERIFY_PROFILE × TOTP) foi o achado de processo, já corrigido com teste específico.

## 6. Revisão de código (task 9.3 — `code-review-and-quality`)

- **Correção:** as 3 requirements da spec `backend-identity` (autenticação por JWKS, RBAC deny-by-default, 2FA provado) e os deltas das 3 specs de módulo estão exercitados: suíte completa 85 arquivos / 388 testes verdes (baseline 75/341; seção 4) + 7 ataques com write-then-throw + prova de 2FA contra o Keycloak real. Nenhum caso de borda pendente conhecido: token malformado/gigante/tipo confundido, claims nulas, headers hostis, request degenerado, env parcial e relógio (skew) têm teste.
- **Legibilidade/simplicidade:** arquivos de produção pequenos (maior: `jose-token.validator.ts` 96 linhas; guard 98; domínio 3 arquivos < 60); nomes consistentes; docstrings só de decisão. A duplicação Swagger entre os 3 módulos foi resolvida com o descritor compartilhado do kernel (`auth-swagger.ts`) em vez de literais repetidos.
- **Arquitetura:** regra de dependência verificada por grep — `domain/` da identidade importa só o próprio domínio; nenhum módulo importa domínio de outro; o guard e a porta `TokenVerifier` vivem no kernel (plumbing, sem vocabulário de domínio) e o módulo de Identidade fornece a implementação; a conversão token→identidade é o caso de uso dependendo só da porta. Os 3 módulos administrativos adicionam uma aresta explícita de wiring para `IdentityModule` (dependência de autenticação, não de domínio) — comunicada por interface do kernel. `IdentityPendingGuard` removido sem sobras (grep vazio).
- **Segurança:** seção 5 (revisão dedicada, 7 abuse cases).
- **Performance:** um `jwtVerify` em memória por requisição autenticada (JWKS em cache — sem fetch por requisição, provado); nenhum query novo; nenhum N+1. Custo desprezível no volume do MVP.
- **Verificação documentada:** REDs colados (seções 1–2), gates e mutation (seções 7–8).
- **Verdict: Approve.**
- **FYIs:** (1) a matriz RBAC por rota é a interpretação MVP do "acesso operacional limitado" da recepção — revisitar com a Fabiana/Identidade quando houver UI; (2) o bootstrap do `IdentityModule` exige `KEYCLOAK_ISSUER`/`KEYCLOAK_AUDIENCE` (fail-fast) — todo teste que sobe módulo administrativo seta env dummy no `beforeAll` (padrão registrado); (3) a remoção do guard honesto foi commitada junto do commit do OpenAPI por um `git rm` já staged (higiene de commit, sem impacto de conteúdo); (4) rate-limit de autenticação e trilha de auditoria persistida ficam para changes futuros com trigger.

## 9. Documentação atualizada (task 9.4)

- `docs/product/08-backlog-produto.md` — **UC 4.2.1 → Em andamento** (validação JWT por JWKS, RBAC deny-by-default, 2FA provado, guard real nos 3 módulos; pendentes com trigger) e **Épico 3** (3.1.1, 3.2.1 e 3.3.1 → Em andamento, com o que falta no frontend); os três módulos migrados (4.2.4/4.2.5/4.2.6) atualizados de "guard honesto" para autenticação real.
- `docs/security/03-seguranca.md` — §3 com o enforcement atual (JWKS/allowlist/tolerância/cache + 2FA versionado e provado, limitação do CI) e §8 com a barreira real substituindo o `IdentityPendingGuard` na nota do Swagger.
- `docs/architecture/c2-container.md` — Keycloak movido para o container **Real** (realm + 2FA no compose; login do painel no Épico 5), backend com os 7 módulos e a aresta "valida JWT via JWKS".
- `docs/architecture/c3-component.md` — nova seção **"Backend (real — módulo Identidade e Acesso)"** com diagrama (domínio puro, porta, jose/JWKS, configuração por ambiente); nós de guard dos 3 módulos e do kernel atualizados; seção do kernel com o guard real, `Roles`, `TokenVerifier` e `auth-swagger`.
- `README.md` — "Como obter um token (ambiente local)": usuários dev, fluxo 2FA, troca de `code` por token via Keycloak e uso do Bearer; env do backend documentado.
- `docs/engineering/07-workflow-de-engenharia.md` — §17 com o exemplo de status reais (401/403) e §14 com o **padrão 11** (RED invertido para proteção ausente + asserção específica) — task 9.5.

## 10. Checklist §16 (docs/07)

- [x] **(a)** `api-and-interface-design` avaliada no planejamento (design decisão 7: sem superfície nova de contrato — credencial no header, erro no envelope existente; alternativa de contrato de login rejeitada); na prática: nenhum schema novo em `contracts/` e o 401/403 documentado no Swagger a partir do descritor do kernel.
- [x] **(b)** `security-and-hardening` no planejamento (threat model do design, 7 abuse cases) e revisão do Verify (seção 5) com os abuse cases um a um.
- [x] **(c)** Mutation medido (seção 7) com triagem de sobreviventes.
- [x] **(d)** Teste adversarial real por ataque (seção 2) com write-then-throw + suíte de ataques contra a cadeia real (JWKS+guard).
- [x] **(e)** §14 alimentada — padrão 11 (RED invertido + asserção específica), não dispensa (task 9.5).

## 11. Emendas e observações

- **Emenda de ordem (registrada antes do GREEN):** 4.x após 5.x/6.x e 6.3 ao final do 8 (seção 1) — o tasks.md foi atualizado antes da execução dos grupos afetados.
- **Achado de processo:** a primeira versão da prova de 2FA aceitava qualquer parada obrigatória e deu falso verde (`VERIFY_PROFILE`); endurecida para exigir TOTP — virou o padrão 11 da §14.
- **Fixture de usuários dev no realm:** a prova de 2FA exigiu usuários versionados (sem 2FA → RED invertido; com OTP → GREEN) — senhas explicitamente de desenvolvimento, mesmo padrão do `changeme-dev` do compose; sem dado real.
- **Higiene de commit:** a remoção do `IdentityPendingGuard` entrou no commit do OpenAPI (git rm já staged); conteúdo correto, agrupamento imperfeito.





