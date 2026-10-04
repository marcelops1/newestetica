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

