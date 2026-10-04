# Verificação — corrigir-vulnerabilidades-dependencias

- **Change:** `openspec/changes/corrigir-vulnerabilidades-dependencias` (branch `chore/corrigir-vulnerabilidades-dependencias`)
- **Data:** 2026-10-04
- **Natureza:** manutenção de dependências, sem comportamento de produto (`skip_specs: true`, justificado na proposal). O "teste que falha" é o próprio gate do CI (`pnpm audit --audit-level high` com saída 1); o GREEN é ele com saída 0 — TDD real, sem exceção docs/07 §4 (só a escrita deste registro e do corpo do PR usam a exceção).

## 1. RED → GREEN por grupo (saídas coladas)

**Estado inicial (RED, antes de qualquer mudança):** `pnpm audit --audit-level high` → saída 1, `12 vulnerabilities found`, `Severity: 6 moderate | 5 high | 1 critical` (log `/tmp/opencode/dep-audit-before.log`). Advisories high/critical: GHSA-vcvr-r3jv-pc5j (`next`, critical), GHSA-qhr7-859c-m2p7 + GHSA-6j4f-fj2g-mc7p (`brace-expansion` 1.x e 5.x, high ×2 cada), GHSA-vfj7-8cjw-p6xm (`braces`, high sem fix).

- **Grupo 1 (next 16.3.6):** `pnpm --recursive why` não aplicável; `rg "next/og|ImageResponse" frontend/` → vazio (código vulnerável inalcançável, mas o gate exige a correção). Após `16.3.4 → 16.3.6` + reinstall: audit cai para 11 vulns, critical zerado; frontend build + 15/109 testes + typecheck verdes.
- **Grupo 2 (overrides):** RED `why` com `brace-expansion 1.1.18` e `5.0.9` (log `/tmp/opencode/dep-why2.log`) → GREEN com `1.1.21` e `5.0.12`, nenhuma versão vulnerável restante; audit cai para 5 vulns (`4 moderate | 1 high`).
- **Grupo 3 (ignore + aceite):** experimento prova que `pnpm.auditConfig.ignoreGhsas` no `package.json` raiz é efetivo na 9.15.0 (antes lista GHSA-vfj7-8cjw-p6xm; depois, `1 high (1 ignored)`, sem nenhum outro advisory sumido — os 4 moderate continuam listados). **Estado final:** `pnpm audit --audit-level high` → **saída 0**, `5 vulnerabilities found`, `Severity: 4 moderate | 1 high (1 ignored)` (log `/tmp/opencode/dep-audit-after.log`).

## 2. Revisão de código (task 4.2 — `code-review-and-quality`)

- **Correção:** o diff fora do lockfile tem 5 arquivos (`frontend/package.json`, `package.json`, `03-seguranca.md` + 3 artefatos do change); nenhum arquivo de produto tocado (`git diff main --stat`: só manifests, lockfile, doc e change).
- **Legibilidade:** overrides disjuntos por range com semântica clara (linha 1.x vs 5.x); `ignoreGhsas` com um único ID comentado pelo aceite na doc.
- **Arquitetura:** segue o padrão existente (versões fixas no frontend; overrides na chave `pnpm` da raiz); nenhuma abstração nova.
- **Segurança:** seção 3 (revisão dedicada).
- **Performance:** N/A (só resolução de dependências).
- **Verificação:** gates seção 4. **Verdict: Approve.**
- **FYIs:** (1) os 4 moderate restantes estão fora do gate e ficam para change futuro se o gate endurecer; (2) `next` 16.3.6 é minor do próprio fornecedor — changelog não lido item a item, mas build+suíte verdes são a verificação (cobertura frontend segue 100%).

## 3. Revisão de segurança (task 4.2 — `security-and-hardening`)

| Verificação | Resultado |
| --- | --- |
| Triagem por alcance (decision tree da skill) | `next` RCE: código inalcançável (sem `next/og`), mas com fix → corrigido mesmo assim (gate + defesa em profundidade). `brace-expansion` DoS: transitória de ferramentas dev (eslint/stryker via minimatch), com fix → corrigido via overrides. `braces` DoS: sem fix → aceite formal com gatilho (único ignore) |
| Nenhum advisory corrigível mascarado | O `ignoreGhsas` contém só GHSA-vfj7-8cjw-p6xm (`patched <0.0.0` — prova na saída do audit); antes/depois comparados (nenhum outro sumiço) |
| Supply chain | Nenhuma dependência nova; overrides pinam dentro do major (`^1.1.20`, `^5.0.11`); lockfile versionado e revisto no diff (124 linhas, só re-resolução); sem `--fix --force` automático |
| Segredos | Nenhum no change (`grep` de password/secret/token no diff: vazio — só o nome `GHSA` como identificador público) |
| Comportamento de produto | Suítes idênticas ao baseline da main (contracts 14/68, frontend 15/109, backend 67/295); build verde nos 3 workspaces |

**Achado da revisão:** nenhum; o aceite do `braces` é o único risco residual, declarado com gatilho de revisão datado em `docs/security/03-seguranca.md` §12.

## 4. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `pnpm lint` | ✅ (1 warning pré-existente em `frontend/stryker.config.mjs`) |
| `pnpm format` | ✅ |
| `pnpm typecheck` | ✅ |
| `pnpm test` | ✅ contracts 14/68 (100%), frontend 15/109 (100%), backend 67/295 (99,62/97,82/100/99,65) — idênticos ao baseline |
| `pnpm build` | ✅ (contracts + frontend + backend) |
| `pnpm audit --audit-level high` | ✅ saída 0 (`4 moderate | 1 high (1 ignored)`) |
