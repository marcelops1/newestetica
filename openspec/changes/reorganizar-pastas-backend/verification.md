# Verificação — reorganizar-pastas-backend

Reorganização pura de arquivos (4 moves via `git mv`), sem mudança de comportamento. Data: 2026-09-24.

## Prova de comportamento idêntico — cobertura contra o baseline real

Cobertura medida no `main` pré-reorganização (worktree limpo, mesmo lockfile) vs. após a reorganização:

| Métrica | Baseline (`main`) | Após reorganização |
|---|---|---|
| Statements | 99,21% (126/127) | 99,21% (126/127) |
| Branches | 93,93% (62/66) | 93,93% (62/66) |
| Functions | 100% (59/59) | 100% (59/59) |
| Lines | 99,2% (125/126) | 99,2% (125/126) |

**Idêntica em todas as métricas.** Prova adicional do risco mapeado no design (exclude de cobertura desatualizado): o relatório de cobertura **não contém** `health.controller`/`app.controller`/`main.ts` — o exclude foi atualizado para o novo caminho no mesmo move, então nenhum arquivo entrou/saiu artificialmente do cômputo.

## RED→GREEN por move (RED real colado)

| Move | RED | GREEN |
|---|---|---|
| 1. `app.controller.ts` → `health/health.controller.ts` | `TS2307: Cannot find module './app.controller'` em `app.module.ts` | typecheck 0, 60/60, cobertura idêntica; grep do caminho antigo vazio |
| 2. `domain/errors.ts`+spec → `domain/errors/` | **16 erros** `TS2307` (`'../errors'`, `'../../domain/errors'`) | typecheck 0, 60/60, cobertura idêntica; 17 arquivos ajustados |
| 3. `overbooking.spec.ts` → `domain/invariants/` | `Cannot find module './entities/booking.entity'` (vitest) + 3 `TS2307` | typecheck 0, 60/60, cobertura idêntica |
| 4. `prisma-unit-of-work.ts`+`transaction-context.ts` → `persistence/unit-of-work/` | **13 erros** `TS2307` (importadores externos + imports internos dos movidos, um nível mais fundo) | typecheck 0, 60/60, cobertura idêntica; 9 arquivos ajustados |

## Histórico preservado (renames, não delete+create)

- Commits de move registram rename com similaridade alta (`errors.ts (100%)`, `overbooking.spec.ts (89%)`, `transaction-context.ts (85%)`).
- `git log --follow` alcança o commit original (#35) nos 4 arquivos movidos (health, errors, overbooking, transaction-context) — verificado por comando.

## Notas honestas

- **Desvio pequeno registrado:** a classe em `health.controller.ts` foi renomeada `AppController` → `HealthController` (rename sem comportamento — o nome do arquivo e o export precisam concordar; o design previa "só imports").
- **Correção de rota no move 2:** o script de atualização também tocou o import interno do `errors.spec.ts` (`./errors` já era correto após o move) — corrigido de volta e validado por typecheck/testes.
- `docs/architecture/c3-component.md` **não precisou de atualização** — premissa do design confirmada por grep: o doc referencia filenames (`scheduling.controller.ts`) e conceitos (`domain/`, `PrismaUnitOfWork`), nenhum dos caminhos movidos.

## Gatilho de segurança (docs/07 §7)

- **Nenhum gatilho acionado:** reorganização de arquivos sem mudança de lógica, entrada de usuário, autenticação, dados de paciente, integração ou segredo. Nenhum dado, contrato ou comportamento alterado. Registro feito mesmo fora dos gatilhos.

## Gates finais

- `pnpm lint` / `pnpm format` / `pnpm typecheck` — verdes.
- `pnpm test` — contracts 54/54 (100%), backend **60/60** (cobertura idêntica ao baseline), frontend 109/109 (100%).
- `pnpm build` — verde.
- `git diff --stat main...HEAD` — apenas renames e linhas de import/path (nenhuma linha de lógica alterada).
- `pnpm exec openspec validate --all` — ver registro no archive.
