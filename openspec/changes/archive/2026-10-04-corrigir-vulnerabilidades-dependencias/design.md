## Context

Ver `proposal.md` (Why). Ponto de partida verificado nesta sessão: `pnpm audit --audit-level high` sai com código 1 e 12 vulnerabilidades (1 critical, 5 high, 6 moderate — log em `/tmp/opencode/dep-audit-before.log`); `pnpm --recursive why brace-expansion` mostra as duas linhas vulneráveis (`1.1.18` via `minimatch@3.1.5 ← eslint`, `5.0.9` via `minimatch@10.2.6 ← stryker/typescript-eslint`); busca por `next/og|ImageResponse` no `frontend/` retorna vazio. pnpm 9.15.0, lockfile compartilhado, `pnpm-workspace.yaml` com só `packages:`, overrides existentes no `package.json` raiz (`deepmerge-ts`, `mysql2`).

## Goals / Non-Goals

**Goals:**

- `pnpm audit --audit-level high` com saída 0, sem mascarar advisory corrigível.
- Gates verdes nos três workspaces (lint, format, typecheck, test, build) após as trocas de versão.
- Aceite de risco do `braces` explícito, auditável e com gatilho de revisão.

**Non-Goals:**

- Atualizar qualquer outra dependência além do necessário para zerar high/critical.
- Mudar código de produto, configuração de build ou comportamento de qualquer módulo.
- Corrigir os 6 moderate (fora do gate; ficam registrados no log do audit como FYI).

## Decisions

### 1. `next` + `eslint-config-next` 16.3.4 → 16.3.6, versões fixas

`frontend/package.json` hoje fixa as duas (`"16.3.4"`, sem `^`); a troca mantém o estilo (fixas em `"16.3.6"`). Rationale: minor do próprio Next com o fix do RCE (patched `>=16.3.6`); fixar evita surpresa de minor futura. Prova: build + testes do frontend verdes após a troca. Alternativas consideradas: faixa `^16.3.6` (rejeitada — diverge do estilo fixo do projeto e afrouxa a resolução sem necessidade); `pnpm audit --fix` automático (rejeitado — escreve overrides genéricos sem revisão humana nem registro).

### 2. Overrides de `brace-expansion` por linha, no `package.json` raiz

Chaves disjuntas por range (estilo dos overrides existentes):

- `"brace-expansion@<1.1.20": "^1.1.20"` — mira a linha 1.x (`minimatch@3`).
- `"brace-expansion@>=4.0.0 <5.0.11": "^5.0.11"` — mira a linha 5.x (`minimatch@10`).

Rationale: um override único sem seletor forçaria UMA versão nas duas linhas e quebraria a resolução (1.x vs 5.x são majors incompatíveis); as chaves disjuntas cobrem exatamente os ranges vulneráveis dos dois advisories (GHSA-qhr7-859c-m2p7 e GHSA-6j4f-fj2g-m2p7) e os valores `^` permitem patch futuro dentro do major. Prova: `pnpm --recursive why brace-expansion` sem nenhuma versão vulnerável. Alternativa considerada: pin exato por versão instalada (`@1.1.18`, `@5.0.9` — rejeitada: não cobre outra versão vulnerável que entre por outro caminho).

### 3. `braces` sem fix: ignore explícito + aceite formal com gatilho

`patched <0.0.0` = sem correção publicada. O mecanismo é o ignore por GHSA da versão instalada (9.15.0): `auditConfig.ignoreGhsas` com `GHSA-vfj7-8cjw-p6xm` — **o local efetivo (`package.json` sob a chave `pnpm` vs `pnpm-workspace.yaml`) é decidido por experimento nesta sessão** (a doc oficial v12 descreve `audit.ignore`; os nomes antigos `auditConfig.ignoreGhsas` valem na 9.15.0 — a prova é o próprio audit passando). O ignore vive versionado no repo (auditável no diff), e o aceite formal vai para `docs/security/03-seguranca.md`: ID do advisory, severidade, justificativa (DoS por glob aninhado; o padrão vem da nossa configuração de glob, nunca de entrada externa; só ferramentas de desenvolvimento — openspec/eslint — no caminho) e **gatilho de revisão** (quando sair versão corrigida, ou ao atualizar `@fission-ai/openspec`/`eslint-config-next`, o que ocorrer primeiro). Alternativas consideradas: nada fazer e deixar o gate vermelho (rejeitada — bloqueia todos os merges); `pnpm audit --ignore-unfixable` no CI (rejeitado — flag de CLI invisível no repo, sem registro versionado do aceite nem gatilho).

## Risks / Trade-offs

- [Risco] `next` 16.3.6 quebra o build do frontend → Mitigação: build + suíte do frontend re-rodados no grupo 1; rollback = reverter o merge (lockfile versionado).
- [Risco] Overrides de `brace-expansion` quebram resolução de `minimatch` → Mitigação: `pnpm install` + `why` + suíte completa; ranges `^` dentro do major.
- [Risco] Ignore do `braces` mascara exploração real → Mitigação: justificativa registra que o vetor (glob aninhado de entrada externa) não existe no projeto; gatilho de revisão datado no aceite.
- [Trade-off] 6 moderate ficam (fora do gate) → aceito e registrado no log; entram num change futuro se o gate endurecer.

## Migration Plan

Sem migração: só lockfile. Rollback = reverter o merge. Ordem: next → overrides → ignore+aceite → gates → PR.

## Open Questions

Nenhuma bloqueante. O local efetivo do `ignoreGhsas` na 9.15.0 é experimento do Apply (task 3.1), não pergunta aberta.
