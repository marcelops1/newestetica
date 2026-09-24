## 1. Health check para `src/health/` (sem módulo próprio)

- [x] 1.1 Mover `src/app.controller.ts` → `src/health/health.controller.ts` via `git mv`, sem tocar mais nada, e constatar que `tsc --noEmit` falha (RED). Verificação: saída do typecheck com erro de módulo não encontrado. Execução: RED real `TS2307: Cannot find module './app.controller'` em `app.module.ts`
- [x] 1.2 Atualizar o import em `src/app.module.ts`, atualizar o exclude de cobertura `"src/app.controller.ts"` → `"src/health/health.controller.ts"` em `backend/vitest.config.ts`, e constatar suite verde (GREEN). Verificação: `tsc --noEmit` limpo + `pnpm --filter backend test` verde + `grep -rn "src/app.controller" backend/ docs/` vazio. Exceção docs/07 §4 registrada (sem mudança de lógica, só localização; a prova é a suíte). Execução: typecheck exit=0, 60/60 testes, cobertura **idêntica ao baseline** (99,21% stmts / 93,93% branches / 100% funcs), grep vazio. Desvio pequeno registrado: a classe foi renomeada `AppController` → `HealthController` (rename sem comportamento — o nome do arquivo e o export precisam concordar; o design previa "só imports", mas o rename é parte do move)

## 2. Erros para `domain/errors/`

- [x] 2.1 Mover `domain/errors.ts` + `errors.spec.ts` → `domain/errors/` via `git mv`, sem tocar mais nada, e constatar que `tsc --noEmit` falha (RED). Verificação: saída do typecheck com erros nos importadores. Execução: RED real — **16 erros** `TS2307: Cannot find module '../errors' / '../../domain/errors'` nos importadores
- [x] 2.2 Atualizar os imports `domain/errors` → `domain/errors/errors` nos ~10 arquivos que o referenciam (lista exata via `grep -rln "domain/errors" backend/src backend/test`), sem alterar conteúdo além do path, e constatar suite verde (GREEN). Verificação: `tsc --noEmit` limpo + suite verde + `grep -rn "domain/errors[^/]" backend/src backend/test` vazio. Exceção docs/07 §4 registrada. Execução: 17 arquivos ajustados pelo script; typecheck exit=0, 60/60 testes, cobertura **idêntica ao baseline**. Nota honesta: o script também tocou o import interno do `errors.spec.ts` (`./errors` já era correto após o move) — corrigido de volta e validado por typecheck/testes

## 3. Invariante para `domain/invariants/`

- [x] 3.1 Mover `domain/overbooking.spec.ts` → `domain/invariants/overbooking.spec.ts` via `git mv`, sem tocar mais nada, e constatar que a suite falha (RED). Verificação: saída do teste/vitest com erro de módulo não encontrado. Execução: RED real — `Cannot find module './entities/booking.entity'` no vitest + 3 erros `TS2307` no typecheck
- [x] 3.2 Atualizar os imports `./entities/*` → `../entities/*` e `./errors` → `../errors` dentro do spec movido, e constatar suite verde (GREEN). Verificação: teste `overbooking.spec.ts` passando no novo caminho + suite verde. Exceção docs/07 §4 registrada. Execução: typecheck exit=0, 60/60 testes, cobertura **idêntica ao baseline**

## 4. Transação para `persistence/unit-of-work/`

- [ ] 4.1 Mover `persistence/prisma-unit-of-work.ts` + `persistence/transaction-context.ts` → `persistence/unit-of-work/` via `git mv`, sem tocar mais nada (o import relativo `./transaction-context` entre eles continua válido), e constatar que `tsc --noEmit` falha nos importadores externos (RED). Verificação: saída do typecheck com erros em `slot.repository.impl.ts`, `booking.repository.impl.ts`, `scheduling.module.ts` e specs de integração
- [ ] 4.2 Atualizar os imports externos para `persistence/unit-of-work/*`, sem alterar conteúdo além do path, e constatar suite verde (GREEN). Verificação: `tsc --noEmit` limpo + suite verde + `grep -rn "persistence/prisma-unit-of-work\|persistence/transaction-context" backend/` vazio. Exceção docs/07 §4 registrada

## 5. Verificação final

- [ ] 5.1 Rodar gates completos (`lint`, `format`, `typecheck`, testes com cobertura, `build`) e confirmar `git log --follow`/`git status` mostrando renames (não deletes+creates). Verificação: gates verdes + `git diff --stat main` sem arquivos de lógica alterados além de imports + cobertura inalterada vs. baseline. `docs/architecture/c3-component.md` não precisa de atualização (verificado no design: referencia filenames, não os caminhos movidos)
