# Change: reorganizar-pastas-backend

## Why

O módulo de Agendamento cresceu organicamente e acumulou arquivos fora do lugar: health check na raiz de `src/`, erros e invariantes espalhados no `domain/`, e as duas peças da transação (`prisma-unit-of-work.ts` + `transaction-context.ts`) separadas na mesma pasta. Reorganizar agora, antes do segundo módulo nascer, fixa o layout que os próximos 6 módulos vão copiar.

## What Changes

- `src/app.controller.ts` (health check) → `src/health/health.controller.ts`, com decisão registrada no design sobre módulo próprio vs. registro direto no `AppModule`.
- `backend/src/scheduling/domain/errors.ts` + `errors.spec.ts` → `backend/src/scheduling/domain/errors/errors.ts` + `errors.spec.ts`.
- `backend/src/scheduling/domain/overbooking.spec.ts` → `backend/src/scheduling/domain/invariants/overbooking.spec.ts` (nova categoria para invariantes que cruzam múltiplas entidades).
- `backend/src/scheduling/infrastructure/persistence/prisma-unit-of-work.ts` + `transaction-context.ts` → `backend/src/scheduling/infrastructure/persistence/unit-of-work/` (mesma subpasta, as duas peças da propagação via AsyncLocalStorage juntas).
- `scheduling.module.ts` permanece na raiz de `scheduling/` (composition root do módulo, mesmo papel de `src/app.module.ts` na raiz da aplicação).
- Todos os imports afetados atualizados (via `grep`, não memória); `docs/architecture/c3-component.md` atualizado se referenciar caminhos que mudaram.
- Nenhuma mudança de comportamento, lógica ou API: mover arquivos, sem editar conteúdo além de imports.

## Capabilities

### New Capabilities

- Nenhuma (reorganização pura, sem comportamento novo).

### Modified Capabilities

- Nenhuma (nenhuma spec descreve o layout de pastas do backend — verificado: a spec `backend-scheduling` só referencia `contracts/src/scheduling/`, que não muda; logo nenhum requirement muda).

## Impact

- Arquivos movidos em `backend/src/` + imports atualizados nos arquivos que os referenciam (+ `c3-component.md` se aplicável).
- `skip_specs: true` em `.openspec.yaml` (sem mudança de comportamento em nível de spec; a prova é a suíte real verde, registrada nas tasks).
- Sem impacto em comportamento, API, contratos, specs ou dados.
