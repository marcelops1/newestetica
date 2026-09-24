# Verificação — fechar-lacunas-processo-agendamento

Fechamento das lacunas pós-`backend-modulo-agendamento`: Frente A (mutation testing real em `backend/` e `contracts/`) e Frente B (checklist estrutural para módulo novo). Data: 2026-09-20.

## Frente A — mutation scores reais (Stryker, manual, fora do CI)

### Backend (`backend/src/scheduling/`, 228 mutantes)

| Arquivo | Score | Mortos | Sobreviventes |
|---|---|---|---|
| errors.ts | 100% | 12 | 0 |
| list-availability.use-case.ts | 100% | 1 | 0 |
| slot.mapper.ts | 100% | 4 | 0 |
| booking.repository.impl.ts | 100% | 18 | 0 |
| slot.repository.impl.ts | 100% | 12 | 0 |
| prisma-unit-of-work.ts | 100% | 2 | 0 |
| transaction-context.ts | 100% | 2 | 0 |
| console-notification.adapter.ts | 100% | 3 | 0 |
| zod-validation.pipe.ts | 100% | 6 | 0 |
| domain-exception.filter.ts | 88,89% | 8 | 1 |
| slot.entity.ts | 89,74% | 35 | 4 |
| booking.entity.ts | 87,23% | 41 | 6 |
| create-booking.use-case.ts | 78,57% | 22 | 6 |
| booking.mapper.ts | 76,92% | 20 | 6 |
| scheduling.controller.ts | 68,42% | 13 | 6 |
| **Total** | **87,28%** | **199** | **29** |

- Execução: `pnpm --filter backend mutation` (com `pnpm infra:up`), **9m54s**, meta de 80% atingida.
- Evolução com a triagem: **82,89%** (1ª medição, 12m35s) → **85,53%** (corpo exato no teste HTTP) → **87,28%** (testes de fronteira de whitespace).

### Contracts (`contracts/src/scheduling/`, 18 mutantes)

- `booking.ts`: 92,86% → `slot.ts`: 100% → **total 100%** (18/18), **14s**.
- Evolução com a triagem: **88,89%** → **94,44%** → **100%**.

### Triagem dos sobreviventes

Gaps reais fechados com teste novo:
1. `errors.ts` 50%→100%: teste dos 4 códigos estáveis (contrato da API) — antes, mutar o `code` não era detectado.
2. `scheduling.controller.ts` 36,84%→68,42%: teste HTTP passou a assertar o corpo exato (incluindo `treatment` presente) + caso sem treatment (chave ausente).
3. `booking.entity.ts`/`slot.entity.ts`: testes de fronteira de whitespace-only em `id`/`slotId`/`phone` (só o nome era coberto).
4. `contracts/booking.ts`: telefone curto **com pontuação** (`"(11) 1234"` passava) e fronteira de **exatamente 10 dígitos** (`>= 10` vs `> 10`).

Sobreviventes documentados como equivalentes (justificativa, não lacuna):
- **Spread `undefined` vs ausente** (controller L50/51/56, use-case L45/46/59, mapper L21/22): `{...(true ? { x: undefined } : {})}` serializa igual a `{}` — indistinguível no JSON/resposta.
- **Texto de mensagem de erro** (entity/mapper StringLiterals): copy de UX deliberadamente não assertado (a decisão de segurança registra que a mensagem não é contrato; o `code` é).
- **Pré-checagem defense-in-depth** (use-case L36/37): mutar a checagem amigável não muda comportamento observável porque a guarda do Domain (`Slot.occupy()`) lança o mesmo erro — equivalência causada pelo desenho de dupla proteção.
- **Spread de `notes` nunca exposto** (controller L51): a resposta não inclui `notes` por minimização; mutar seu spread é inobservável.
- **Leitura `toBookingDomain` sem chamador de produção** (mapper L9/12): o port `BookingRepository` só tem `save`; o mapper de leitura é testado por spec própria, mas seus mutantes de caminho completo só morrerão quando existir leitura real (dívida consciente, registrada).

### Achado de ferramental (importante)

O `@stryker-mutator/vitest-runner@10.0.0` (última versão) **não ativa mutantes no `vitest@5`**: o setup grava cobertura em `suite.meta` (API do vitest ≥4.1) que não chega no vitest 5 — resultado **silencioso de 0%** com todos os mutantes "sobrevivendo" (pior que erro). O runner também não lida com os `projects` do vitest (IDs de teste colidem no merge de cobertura) e o discovery de plugin falha no layout pnpm sem `plugins` explícito. **Fallback aplicado** (design decisão 4): `testRunner: "command"` (exit code) + `vitest.mutation.config.ts` single-project no backend + `plugins` explícito. Documentado nos comentários dos configs.

### Defeito descoberto — config do frontend (fora do escopo, follow-up)

`pnpm --filter frontend mutation` **nunca funcionou**: aborta com `Cannot find TestRunner plugin "vitest"` (discovery no layout pnpm) e, mesmo corrigido, cairia na incompatibilidade com o vitest 5. Evidência: probe `--mutate lib/booking.ts` no frontend abortou com o erro. O probe abortado deixou `.stryker-tmp/` e a suíte do frontend passou a varrer testes duplicados (218 = 2×109) até a remoção do resíduo — recomenda-se, em change próprio, aplicar `plugins` + command runner + ignores no frontend.

## Frente B — checklist estrutural

- **§16 do docs/07** ("Checklist obrigatório para módulo de backend novo", linha 232): 5 itens com evidência nomeada (contrato sob `api-and-interface-design`; `security-and-hardening` no planejamento; mutation medido; teste adversarial real; §14 alimentada) + nota de que prompts futuros de módulo novo devem citá-la. `grep` por nomes de modelo/fornecedor → vazio.
- **`.github/pull_request_template.md`**: bloco condicional "Checklist de módulo de backend novo (só se este PR cria um módulo de backend)" com os 5 itens; checklist geral intacto.
- **§14 do docs/07**: 4 padrões observados na sessão do Agendamento (itens 4–7: grupos por camada com revisão entre eles; prova negativa real; revisão de segurança formal mesmo quando "parece" coberto; emenda de design em voo), agnósticos de modelo (`grep` → vazio).

## Gates e segurança

- `pnpm lint` / `pnpm format` / `pnpm typecheck` — verdes (`.stryker-tmp/` e `reports/` ignorados nos dois workspaces: achado de que o sandbox era varrido pelo lint durante a execução).
- `pnpm test` — contracts **54/54 (100%)**, backend **58/58 (99,21%)**, frontend **109/109 (100%)**.
- `pnpm build` — verde; `pnpm audit --audit-level high` — sem high/critical (Stryker é dev-only).
- `pnpm exec openspec validate --all` — ver registro no archive.
- **Segurança:** sem gatilho direto (meta-processo; nenhum dado de paciente ou entrada de usuário nova). As duas dependências novas são dev-only do Stryker; auditoria limpa. Nota: os testes novos de fronteira (whitespace/limites) reforçam a validação de entrada do módulo — efeito colateral positivo da triagem.
