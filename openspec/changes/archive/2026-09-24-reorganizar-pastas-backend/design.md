## Context

Ver proposal.md (Why) para motivação. Estado atual verificado em disco: os 4 alvos existem nos caminhos antigos; `app.controller.ts` só é referenciado por `app.module.ts` (import + array `controllers`); `domain/errors` é importado por ~10 arquivos (domain, application, infrastructure, presentation, fakes e specs); `prisma-unit-of-work.ts`/`transaction-context.ts` são importados pelos 2 repo impls, `scheduling.module.ts` e 4 specs de integração (mantendo os dois juntos, o import relativo `./transaction-context` entre eles não muda); não há barrels (`index.ts`) em `backend/src`; `overbooking.spec.ts` importa `./entities/*` e `./errors` (mudam para `../`); `errors.spec.ts` move junto com `errors.ts` (o `./errors` continua válido). Restrição crítica: `backend/vitest.config.ts` exclui `"src/app.controller.ts"` da cobertura por caminho explícito — o move 1 exige atualizar esse exclude, senão o gate de cobertura quebra.

## Goals / Non-Goals

**Goals:**

- Os mesmos arquivos, nos lugares que o próximo módulo vai copiar, com a suíte inteiramente verde e o `git log` mostrando renames (não deletes+creates).

**Non-Goals:**

- Qualquer mudança de lógica, API, contrato ou comportamento; novo código além de ajustes de import/path; mudar a regra de dependência.

## Decisions

### 1. Health sem módulo próprio (registro direto no `AppModule`)

Rationale: health check é um endpoint sem dependências; um `health.module.ts` para um controller sem providers é estrutura prematura (YAGNI) e aumenta o diff sem benefício. Alternativa considerada: `health.module.ts` com controller registrado nele (rejeitada — só se justificaria quando o health ganhar readiness checks de banco/Keycloak; registrar essa condição aqui para revisitar). O move exige atualizar 1 linha de import em `app.module.ts` + o exclude de cobertura (ver Context).

### 2. `git mv`, nunca delete+create

Rationale: preserva `blame`/histórico e faz o review mostrar renames, provando que nada mudou além do caminho. Alternativa considerada: deletar e recriar (rejeitada — apaga histórico e impossibilita distinguir move de rewrite no review).

### 3. Um move por vez, com RED/GREEN entre moves

Rationale: fail-fast — mover tudo de uma vez e depurar 15 imports quebrados juntos esconde qual move quebrou o quê. Sequência por move: `git mv` → observar typecheck/testes falharem (RED) → atualizar imports → tudo verde (GREEN). Critério de aceite por move: `tsc --noEmit` limpo + suíte do backend verde + `grep` pelos caminhos antigos retornando vazio.

### 4. `c3-component.md` não precisa de atualização

Rationale: verificado em disco — o doc referencia filenames (`scheduling.controller.ts`) e nomes de camada/conceito (`domain/`, `PrismaUnitOfWork`, `PrismaTransactionContext`), nunca os caminhos exatos que mudam; a descrição "erros e portas" em `domain/` continua verdadeira com `domain/errors/`. Alternativa considerada: atualizar o doc "por precaução" (rejeitada — doc sem mudança real vira ruído; registrado aqui para o revisor conferir).

### 5. `skip_specs` mantido (prova pela suíte, não por spec)

Rationale: verificado que nenhuma spec descreve layout de pastas do backend (a `backend-scheduling` só referencia `contracts/src/scheduling/`, intocado); inventar requirement só para satisfazer validação violaria a regra do OpenSpec. A prova de "nada mudou" é a suíte completa verde + diff mostrando apenas moves e imports (tasks).

## Risks / Trade-offs

- [Risco] Import esquecido fora do alcance do `grep` (ex.: import dinâmico) → Mitigação: typecheck + suíte completa + build como gates por move; `grep` pelos 4 caminhos antigos deve retornar vazio como aceite.
- [Risco] Exclude de cobertura desatualizado derruba o gate → Mitigação: atualizar `"src/app.controller.ts"` → `"src/health/health.controller.ts"` dentro do próprio move 1 (mapeado nas tasks).
- [Risco] `domain/errors/` com um único arquivo parece over-organização → Mitigação aceita: `errors.ts` já tem spec + 4 classes e cresce a cada módulo; a pasta fixa o padrão antes do segundo módulo.
- [Trade-off] Mover `overbooking.spec.ts` para `invariants/` cria categoria nova com um único teste → aceito: a categoria existe para invariantes multi-entidade futuras, documentada na task; alternativa (manter no `domain/`) foi rejeitada porque recriaria exatamente a dispersão que este change elimina.
