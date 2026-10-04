## 1. Next 16.3.6 no frontend (RCE em next/og)

- [ ] 1.1 Registrar o RED: `pnpm audit --audit-level high` reprova com o critical do `next` (GHSA-vcvr-r3jv-pc5j) — RED. Verificação: saída com código 1 e o advisory listado (log já capturado no estado inicial)
- [ ] 1.2 Subir `next` e `eslint-config-next` para `16.3.6` (fixos), reinstalar, e provar build + testes do frontend verdes com o critical zerado — GREEN parcial. Verificação: `pnpm --filter frontend build`, `test`, `typecheck` verdes e o advisory do `next` ausente no audit

## 2. Overrides de brace-expansion por linha

- [ ] 2.1 Registrar o RED: `pnpm --recursive why brace-expansion` mostra `1.1.18` e `5.0.9` (vulneráveis) — RED. Verificação: as duas versões listadas na saída
- [ ] 2.2 Adicionar os overrides disjuntos no `package.json` raiz, reinstalar, e provar que nenhuma versão vulnerável resta — GREEN parcial. Verificação: `pnpm --recursive why brace-expansion` só com `>=1.1.20` na linha 1.x e `>=5.0.11` na 5.x

## 3. Ignore auditável do braces + aceite formal

- [ ] 3.1 Decidir por experimento o local efetivo do `ignoreGhsas` na 9.15.0 (`package.json` sob `pnpm` vs `pnpm-workspace.yaml`) e provar que só o `braces` é ignorado — RED vira GREEN. Verificação: antes da regra o audit lista GHSA-vfj7-8cjw-p6xm; depois, não lista, sem nenhum outro advisory sumido
- [ ] 3.2 Registrar o aceite formal em `docs/security/03-seguranca.md` (ID, severidade, justificativa, gatilho de revisão) e provar `pnpm audit --audit-level high` com saída 0 — GREEN. Verificação: saída 0 e contagem `0 high/critical` (moderate fora do gate, registrados como FYI)

## 4. Gates, registros e PR

- [ ] 4.1 Rodar os quality gates completos nos três workspaces (lint, format, typecheck, test, build) — GREEN. Verificação: todos os comandos com saída 0
- [ ] 4.2 Revisar com `code-review-and-quality` e `security-and-hardening` (foco: nada além de versões/lockfile/aceite mudou; nenhum comportamento de produto) e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisões registradas
- [ ] 4.3 Abrir o PR com o checklist preenchido (link, audit antes/depois, `why`), sem merge — exceção docs/07 §4 só para a escrita do corpo. Verificação: URL do PR e CI rodando
