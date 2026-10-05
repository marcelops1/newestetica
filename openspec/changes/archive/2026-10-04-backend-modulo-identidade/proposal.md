# Change: backend-modulo-identidade

## Why

Três módulos administrativos (Pacientes, Atendimento/Histórico, Financeiro Básico) operam sob o `IdentityPendingGuard` honesto — 403 `AUTH_NOT_IMPLEMENTED` em todas as rotas — e cada spec de módulo registra a substituição pelo guard real de Keycloak/RBAC como próximo passo obrigatório do módulo de Identidade (UC 4.2.1). Sem este change, o Épico 3 (3.1.1, 3.2.1, 3.3.1) e a autorização real do Épico 4 continuam Não iniciados, e nenhum dado administrativo é acessível nem mesmo pela Fabiana.

## What Changes

- Novo módulo `backend/src/identity/` nas 4 camadas (Clean Architecture, TDD Domain → Application → Infrastructure → Presentation, docs/07 §15): validação de JWT do Keycloak no backend (assinatura via JWKS, `issuer`, `audience`, expiração), sem endpoint de login próprio — o login continua sendo o fluxo padrão do Keycloak no frontend (Épico 5).
- RBAC por papel (`admin`, `reception`, papéis já existentes no realm) com decorator de papéis e **negação por padrão**: rota sem papel declarado exige autenticação; papel ausente ou insuficiente nega sem vazar existência de dados.
- 2FA obrigatório para o painel, exigido na **configuração do realm** (`infra/docker/keycloak/realm-newestetica.json` — hoje sem flujos de autenticação, sem política OTP e sem usuários: verificado nesta sessão) e **provado por teste**, não presumido.
- Guard real no kernel (`backend/src/shared/`), substituindo o `IdentityPendingGuard` nos 3 módulos; o guard honesto é removido (não mantido em paralelo) e as referências a ele nas specs somem via delta.
- Migração dos 3 módulos para o guard novo usando as suítes existentes como **caracterização** (zero regressão de comportamento de negócio); o contraste "sem token = 401/403" vs "token válido com papel = acesso" substitui o `overrideGuard` atual.
- Decisão de como os testes obtêm tokens (realm de teste no compose vs JWKS fake) tomada no `design.md`, com alternativas.
- Explicitamente fora: telas de login do frontend (Épico 5), recuperação de senha, gestão de usuários pela API, emissão/renovação de tokens pelo backend.

## Capabilities

### New Capabilities

- `backend-identity`: autenticação real via Keycloak (validação de JWT por JWKS) e autorização RBAC (`admin`/`reception`, negação por padrão) para as rotas administrativas, com 2FA exigido no realm.

### Modified Capabilities

- `backend-patients`: delta explícito no requirement de bloqueio (RENAMED + MODIFIED: o bloqueio honesto vira autenticação real; sem token = 401, sem papel = 403). Nenhuma edição direta em `openspec/specs/` (regra 7 do `AGENTS.md`).
- `backend-attendance`: delta explícito no requirement de bloqueio (RENAMED + MODIFIED, mesma troca, mesmas respostas). Nenhuma edição direta em `openspec/specs/`.
- `backend-finance`: delta explícito no requirement de bloqueio (RENAMED + MODIFIED, mesma troca, mesmas respostas). Nenhuma edição direta em `openspec/specs/`.

## Impact

- `backend/src/identity/` (novo, 4 camadas), `backend/src/shared/http/` (guard real no kernel; remoção do `IdentityPendingGuard`), `backend/src/{patients,attendance,finance}/` (troca de guard nos controllers/módulos + suítes como caracterização, sem mudança de regra de negócio), `backend/stryker.config.mjs` (escopo), `infra/docker/keycloak/realm-newestetica.json` (2FA + usuários de teste, se a decisão de testes assim exigir), `docs/product/08-backlog-produto.md` (UC 4.2.1 e Épico 3 → Em andamento), `docs/architecture/c2-container.md`/`c3-component.md` (módulo + guard real), `docs/security/03-seguranca.md` §8 (enforcement real substitui o bloqueio honesto como barreira).
- Sem impacto em frontend, mocks, contratos vigentes, specs além das citadas ou comportamento de negócio dos módulos existentes (as respostas de negócio com token válido e papel autorizado são byte-idênticas às atuais com bypass).
