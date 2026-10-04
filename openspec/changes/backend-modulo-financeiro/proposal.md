# Change: backend-modulo-financeiro

## Why

O resumo financeiro essencial (UC 4.2.6, hoje "Não iniciado") ainda não existe como fonte real: sem ele, o Épico 2 não tem como exibir recebimentos e pendências para a Fabiana. É também o primeiro módulo que agrega outro contexto em leitura — e a invariante herdada do change de Atendimento (histórico de paciente anonimizada nunca aparece) precisa valer dentro do agregado monetário, o que precisa ser desenhado e provado agora, não depois.

## What Changes

- Novo contexto de contrato em `contracts/src/finance/` (schemas Zod + testes + índice, reexportado no índice do pacote), desenhado do zero: `FinanceSummaryQuery` (janela `from`/`to` obrigatória, teto de 366 dias) e `FinanceSummary` (total em centavos, contagem, `currency: "BRL"` literal) — sem PII, sem breakdown por paciente.
- Valor no Atendimento como `amountCents` opcional (centavos inteiros, teto de R$ 100.000, imutável depois de criado): coluna nullable no Prisma + migration, aceito na criação e devolvido na saída — sem entidade própria de cobrança e sem preço no catálogo (rejeitados no design).
- Novo módulo `backend/src/finance/` (mesmo padrão dos anteriores, sobre `backend/src/shared/`): agregação pura no domínio, porta própria de leitura, caso de uso de resumo, reader Prisma e controller com `GET /finance/summary` — sob o mesmo `IdentityPendingGuard` honesto do kernel, sem exceção.
- Leitura agregada somente de atendimentos de pacientes visíveis (nunca anonimizadas): filtro de relação na query + prova dedicada write-then-throw no HTTP.
- Sem `UnitOfWork` (só leitura) e com cliente Prisma próprio (`createPrismaClientFromEnv` do kernel — sexto pool consciente, mesmo padrão dos cinco módulos; unificação adiada com trigger).
- Wiring no `AppModule`; escopo do Stryker estendido a `src/finance/**` e `contracts/src/finance/**`.
- Autorização real (Keycloak/RBAC) explicitamente **fora** desta fatia (mesma decisão dos módulos anteriores: bloqueio honesto até a Identidade, sem guarda falso).
- Explicitamente fora: entidade de cobrança/lançamento, preço no catálogo, breakdown por paciente, emissão fiscal/contábil, update/delete de valor (imutável — correção via novo registro, com trigger se a Fabiana pedir), exportação, paginação do agregado, migração do frontend.

## Capabilities

### New Capabilities

- `backend-finance`: resumo financeiro agregado essencial por janela (só leitura), com visibilidade herdada da paciente e moeda fixa.

### Modified Capabilities

- `api-contracts`: deltas MODIFIED explícitos nos requirements de Atendimento (aceite e saída de `amountCents`) e no requirement de escopo (Financeiro Básico ganha schemas nascidos com o módulo, mesmo precedente de Pacientes/Atendimento); requirements ADDED definem os formatos `FinanceSummaryQuery`/`FinanceSummary`. Nenhuma edição direta em `openspec/specs/` (regra 7 do `AGENTS.md`).
- `backend-attendance`: delta MODIFIED explícito no requirement de registro (valor opcional na criação, imutável) e na saída conforme o contrato (inclui `amountCents`). Nenhuma edição direta em `openspec/specs/`.

## Impact

- `contracts/src/finance/` (novo), `contracts/src/index.ts` (reexport), `contracts/src/attendance/*` (aceite/saída de `amountCents`), `contracts/stryker.config.mjs` (escopo), `backend/src/finance/` (novo, com cliente Prisma próprio), `backend/src/attendance/` (entidade/mappers com `amountCents`, sem alteração de wiring), `backend/prisma/` (coluna `amountCents` + migration + seed com valores fictícios), `backend/src/app.module.ts` (wiring), `backend/stryker.config.mjs` (escopo), `docs/product/08-backlog-produto.md` (UC 4.2.6 → Em andamento), `docs/architecture/c2-container.md`/`c3-component.md` (sexto módulo), linha de Purpose de `openspec/specs/api-contracts/spec.md` ("e Financeiro Básico").
- Sem impacto em frontend, mocks, contratos vigentes além dos deltas citados, specs além das citadas ou comportamento dos 5 módulos existentes (o módulo de Atendimento só ganha o campo opcional — criação sem valor continua válida).
