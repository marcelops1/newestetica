# Verificação — backend-modulo-financeiro

- **Change:** `openspec/changes/backend-modulo-financeiro` (branch `feature/backend-modulo-financeiro`)
- **Data:** 2026-10-04
- **Gatilhos de segurança (docs/engineering/07 §7):** entrada de usuário (janela `from`/`to` + `amountCents` na criação), **dados de paciente (PII herdada via join no agregado monetário)**, autorização diferida com guard honesto, ausência de dado real → revisão de segurança obrigatória (seção 3), com os abuse cases do threat model um a um.

## 1. Testes por nível (docs/07 §13)

| Nível | O que cobre | Arquivos | Testes |
| --- | --- | --- | --- |
| Contrato — Financeiro (group 0) | `FinanceSummaryQuery` (janela válida/ausente/malformada/invertida/teto 366d + issues com campo e mensagem) e `FinanceSummary` (janela/BRL/total/contagem, rejeições, PII por stripping) | 1 | 9 |
| Contrato — delta de Atendimento | `AttendanceInput` com `amountCents` 0..10.000.000 (rejeita fracionário/negativo/teto/string/NaN) e `Attendance` com inteiro-ou-nulo | 1 (+3) | 10 |
| Unit — domínio (Financeiro) | `summarize` puro: janela inclusiva, nulos, vazio, centavos sem float, **soma máxima teórica sem overflow**, pureza | 1 | 5 |
| Unit — domínio (Atendimento, delta) | `Attendance` com `amountCents` (create/restore, teto, tipo confundido, sem setter, teto = contrato) | 1 (+5) | 13 |
| Unit — aplicação (Financeiro) | Caso de uso (janela válida/vazia/inválida sem tocar a porta, 366d exato, mensagens, código de erro) + adversarial (tipo confundido, gigante, injeção, superfície sem PII) | 2 | 15 |
| Unit — aplicação (Atendimento, delta) | Criação com valor válido/ausente/hostil (núcleo rejeita sem persistir) | 1 (+2) | 8 |
| Integração — persistência | Reader Prisma contra Postgres real (round-trip, janela nas bordas, nulos, anonimizada, ordem determinística, sem PII); repositório de Atendimento com round-trip do valor | 2 (+1 att.) | 5 + 9 (att.) |
| Integração — HTTP | Rotas com bypass (3), **guard honesto sem bypass (4 casos)**, contrato de saída em duas pontas (2), **não-vazamento no agregado write-then-throw (2)**; Atendimento ganhou 2 casos de valor | 5 (+1 att.) | 14 (fin.) + 10 (att. http/contract) |
| **Total do change** | | **15 novas/alteradas** | **+91 (backend 295→340; contracts 68→80)** |

Suíte completa no Verify: **backend 75 arquivos / 340 testes** (baseline do passo 2: 67/295); **contracts 15/80**; **frontend 15/109 (intocado)**; todas verdes.

**REDs reais colados (não apenas "testes verdes"):**

- 0.1 (contrato): `Cannot find module './finance'`.
- 0.3 (delta de contrato): `amountCents` hostil aceito (`expected true to be false`; 4 falhas/10).
- 1.1 (wire-up): `vitest run src/finance` → `Command failed with exit code 1` (filtro sem arquivos).
- 2.1 (entidade): `expected undefined to be 15000` (campo ignorado); 5 falhas/13.
- 2.3 (agregação): `Cannot find module './summary'`.
- 3.1 (aplicação): `Cannot find module '../../domain/errors/errors'`.
- 3.3/3.4 (**adversarial real**): **`TypeError`** para janela de tipo confundido (null/número/objeto) — hardening do núcleo adicionado (tipo errado → `InvalidFinanceWindow`, nunca `TypeError`); 1 falha/5.
- 4.1 (persistência): `Cannot find module '.../finance-summary.reader.impl'`.
- Atendimento (propagação do delta): mapper sem `amountCents` → `InvalidAttendance` no `restore` (6 falhas); HTTP sem o campo → `expected undefined to be 15000`; contrato → `expected false to be true` (corpo fora do schema).
- 5.1 (HTTP): rota ausente → `expected 404 to be 200` (3 falhas).
- 5.3/5.4 (**guard honesto**): sem o guard, `[200, 422, 422]` em vez de `[403, 403, 403]` — a rota estava acessível; com o guard, 403 `AUTH_NOT_IMPLEMENTED` em 4/4 provas.
- 5.5/5.6 (saída/duas pontas): corpo `{"currency":"BRL","totalCents":15000,"count":1}` reprovado no schema (sem `from`/`to`), componente OpenAPI ausente e 403 ausente (5 falhas); fechado na 5.6.
- 5.7 (**não-vazamento no agregado**): write-then-throw — ver seção 3 (abuse case 3) com as duas saídas.

**Estados frágeis planejados (docs/07 §14.8 — registrados nas tasks, sem emenda):**
1. Controller nasceu SEM o guard na 5.2; o RED da 5.3 (`[200, 422, 422]`) provou que o guard é a barreira real.
2. Saída nasceu parcial (`currency`/`totalCents`/`count`) na 5.2; o RED da 5.5 provou a divergência até a 5.6 fechar o contrato.

**Provas negativas (garantias críticas provadas pela falha, não pela ausência dela):**
- **Guard é a ÚNICA barreira:** com bypass, a mesma rota responde 200/422; sem bypass, 403 em 4/4 variantes (inclusive janela inválida — o guard roda antes da validação).
- **Visibilidade no agregado, camada única (query):** o reader é a única barreira do total — removido o filtro de relação, o valor da anonimizada entra (RED); restaurado, bloqueia (GREEN) — seção 3.
- **Teto de span em duas camadas:** Zod na fronteira (422) e núcleo (`InvalidFinanceWindow` sem tocar a porta) — provado em unit, adversarial, contrato e HTTP (367d rejeitado; 366d exato aceito).
- **Tipo confundido vira erro de domínio:** janela null/número/objeto → `InvalidFinanceWindow`; `amountCents` string/NaN → `InvalidAttendance` (contrato, entidade, caso de uso).
- **Soma sem overflow/float:** 100 mil registros no teto (R$ 100 bi em centavos) continuam `Number.isSafeInteger` (threat model, abuse 6).

## 2. Mutation testing (task 6.1 — docs/07 §16.c)

- **Backend (módulo Financeiro):** `pnpm --filter backend exec stryker run --mutate 'src/finance/**/*.ts,!src/finance/**/*.spec.ts,!src/finance/**/*.module.ts'` (escopo também estendido no `backend/stryker.config.mjs`). **106 mutantes**:
  1. **1ª rodada: 78,30%** (83 mortos / 23 sobreviventes, 0 sem cobertura, 0 timeout).
  2. **Triagem:** âncoras do regex do núcleo, fronteira `>=` (from = to), ordenação (primária e desempate), mensagens/paths das regras e código do erro → **testes de caracterização adicionados** (comportamento já existia; passam direto — **sem RED**, registrados como tal): lixo nas âncoras, data parcial, calendário inexistente, from = to, mensagens `posterior`/`exceder`, código `INVALID_FINANCE_WINDOW`, ordenação determinística com data fora de ordem e empate, e o teto de overflow.
- **Árvore final: 95,28%** — **101 mortos / 5 sobreviventes**, 0 sem cobertura, 0 timeout (3ª rodada na árvore final, já com a caracterização e o teste de overflow).
- **Sobreviventes finais aceitos (5, todos justificados):**
  - **1 equivalente** no núcleo (`use-case.ts:36`): `parts.length !== 3 || !DAY_PATTERN.test(value)` → `false || !DAY_PATTERN...` é indistinguível — para strings, o padrão só é `true` quando há exatamente 3 partes; não existe entrada que separe as duas versões (a checagem de calendário em seguida cobre o resto). O `false` só muda o branch, não o comportamento observável.
  - **4 literais de documentação no controller** (`finance.controller.ts:34,36,37,37`): `type: "object"`/`"string"` do esquema de exemplo do 403; o teste OpenAPI asserta o que importa (descrição com guard/UC 4.2.1 e `code.example`); trocar o tipo/literal do exemplo não muda comportamento (mesmo racional dos 4 sobreviventes aceitos no Atendimento).
- **Contracts (Financeiro):** escopo estendido (`contracts/stryker.config.mjs`); **100,00% (28/28 mortos, 0 sobreviventes)** na medição final (1ª rodada 67,86% → caracterização das issues do Zod: mensagem + path + fronteira from = to → 100%).
- **Contracts (delta de Atendimento):** **100,00% (11/11 mortos, 0 sobreviventes)**.

## 3. Revisão de segurança (task 6.2 — `security-and-hardening`)

Abuse cases do threat model do `design.md`, um a um:

| # | Abuse case | Resultado / evidência |
| --- | --- | --- |
| 1 | Janela malformada/gigante/invertida/span estourado | Zod `superRefine` na fronteira (422 sem eco; contrato testa issues) + núcleo revalida com `InvalidFinanceWindow` sem tocar a porta (adversarial: gigante 100k, injeção `' OR '1'='1`, `"; DROP TABLE ...`, ISO parcial) — testes com saída colada (seção 1) |
| 2 | `amountCents` hostil na criação | Contrato rejeita fracionário/negativo/teto/string/NaN (422); entidade rejeita de novo (defesa em profundidade, sem persistir); HTTP prova 422 sem eco e 0 registros criados |
| 3 | **Bypass de visibilidade no agregado (vetor central)** | **Write-then-throw dedicado**: filtro removido do reader → `expected 114000 to be 15000` (o valor da anonimizada entra no total) e `expected 99000 to be +0`; filtro `patient: { status: "active" }` restaurado → 2/2 verdes. Prova adicional: integração do reader (anonimizada fora) e HTTP dedicado (`finance.visibility.int.spec.ts`) |
| 4 | Inferência de PII por janelas estreitas (fishing) | **Risco aceito e declarado** (design): admin futuro sob RBAC; sem breakdown/contagem por paciente; a superfície não tem campo para PII (auditada por inspeção e por chaves exatas) |
| 5 | Acesso não autenticado | Guard honesto do kernel em todas as variantes: 403 `AUTH_NOT_IMPLEMENTED` (4/4), antes de qualquer validação; bypass só via `overrideGuard` no teste |
| 6 | Float/overflow na soma | Centavos inteiros com teto na entrada; teste de soma máxima teórica (100k × teto = 1e12, `Number.isSafeInteger`); janela limitada a 366 dias (bound de varredura) |

| Verificação transversal | Resultado |
| --- | --- |
| Injeção SQL | Prisma parametrizado; `grep` de `queryRaw`/`executeRaw`/`eval` no Financeiro: **vazio** |
| PII em logs/erros | Nenhum log no módulo (`grep` de `console.`/`Logger`: vazio); filtro devolve só `code`+`message`; 422 sem eco (testado); resposta sem nome/vínculo/breakdown |
| Over-collection / LGPD | Reader seleciona só `amountCents`/`performedAt`; contrato sem PII; anonimização da paciente remove os valores do agregado futuro sem apagar o histórico (query, provado) |
| Acoplamento entre contextos | `grep`: Financeiro não importa nada de `attendance/` nem de `patients/`; cliente próprio via `createPrismaClientFromEnv` (kernel); sem `UnitOfWork` (só leitura) |
| Guard | Definição **única** em `backend/src/shared/http/identity-pending.guard.ts` (grep: 1), importado pelo controller sem exceção |
| Segredos | Nenhum no módulo; `DATABASE_URL` via env (factory do kernel falha rápido sem ela) |
| DoS de varredura | Span máximo de 366 dias (contrato + núcleo) e janela obrigatória — sem full scan sem bound |
| Autorização real pendente | Risco residual registrado nos 5 módulos anteriores: bloqueio honesto ≠ autenticação; trigger obrigatório no módulo de Identidade (UC 4.2.1) |

**Achado da revisão:** nenhum vazamento ou bypass encontrado; o agregado é sem PII por construção e a visibilidade herdada está **operante e provada por falha** (write-then-throw na camada única da query).

## 4. Revisão de código (task 6.3 — `code-review-and-quality`)

- **Correção:** 28 testes do módulo Financeiro (contrato 9, domínio 5, aplicação 15… totais por arquivo na seção 1) e 10 novos do Atendimento; spec `backend-finance` exercitada (agregado, zeros, teto, visibilidade, sem PII, guard); delta de `backend-attendance` exercitado (valor opcional imutável, saída no contrato).
- **Legibilidade/simplicidade:** arquivos pequenos (maior de produção: controller 98 linhas; total 963), nomes consistentes com os módulos anteriores; `toResponse` é a única allowlist; scaffold provisório removido (grep de `Scaffold`/`TODO`/cast: vazio); sem abstração além do necessário (sem entidade de resumo, sem `UnitOfWork`, sem provider compartilhado).
- **Arquitetura:** `domain/` sem imports externos/cruzados (grep: só tipos do próprio domínio); `application/` só domínio (`summarize` + porta); `infrastructure/` implementa a porta com Data Mapper e filtro de visibilidade na query; `presentation/` fina com guard/pipe/filtro do kernel/local; `FinanceModule` wireado no `AppModule`; sexto pool consciente (decisão 4) com trigger de unificação registrado. **Módulo de Atendimento intocado no wiring** (`git diff` do módulo: vazio).
- **Segurança:** seção 3 (revisão dedicada).
- **Performance:** leitura única bounded por janela (sem N+1), seleção de 2 campos, índice existente `(patientId, performedAt)` aproveitável; agregado sem paginação por desenho (não é listagem).
- **Verificação documentada:** REDs colados; gates completos (seção 5).
- **FYIs:** (1) a resposta ecoa `from`/`to` — string de data, não PII; (2) `fishing` por janelas estreitas declarado como risco residual, com trigger no RBAC; (3) pool próprio do Financeiro é o sexto — unificação adiada com trigger.

## 5. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `pnpm lint` | ✅ limpo (1 warning pré-existente em `frontend/stryker.config.mjs`) |
| `pnpm format` | ✅ limpo (após `format:write` nos arquivos do change) |
| `pnpm build` | ✅ limpo (contracts + frontend + backend) |
| `pnpm typecheck` | ✅ limpo (build antes do typecheck, como no CI — tipos do Next são gerados no build) |
| `pnpm test` | ✅ **backend 75/340** (cobertura 99,66% stmts / 98,08% branches / 100% funcs / 99,65% lines); **contracts 15/80 (100%)**; **frontend 15/109 (100%)** |
| `pnpm audit --audit-level high` | ⚠️ exit 1 — 6 moderate/5 high/1 critical **pré-existentes** (lockfile idêntico ao `main`; advisories publicados depois do último merge). Fora do escopo deste change; registrado como FYI para o CI/PR |

## 6. Regressão do Atendimento (rede de segurança do passo 2)

- **Baseline registrado antes de qualquer mudança:** suíte completa do backend 67 arquivos / 295 testes verdes (cobertura 99,62/97,82/100/99,62); recorte do Atendimento 11 arquivos / 66 testes.
- **Após adicionar `amountCents` ao Atendimento (entidade, caso de uso, mapper, controller):** recorte do Atendimento **11 arquivos / 76 testes verdes** (66 originais preservados + 10 novos) — **zero regressão**; suíte completa final 75/340 verdes.
- Contrato vigente preservado fora do delta: criação sem valor continua válida (`amountCents` nulo), imutabilidade intacta, visibilidade herdada intacta.

## 7. Documentação atualizada (task 6.4)

- `docs/product/08-backlog-produto.md` — UC 4.2.6 → **Em andamento** (resumo agregado por janela, visibilidade herdada provada, guard honesto; pendentes com trigger: breakdown por paciente com RBAC, correção de valor via novo registro, unificação de pools, guard Keycloak/RBAC).
- `docs/architecture/c2-container.md` — sexto módulo no container Backend + rota `GET /finance/summary` e tabela de valor do Atendimento.
- `docs/architecture/c3-component.md` — seção "Backend (real — módulo Financeiro)" com diagrama (agregação pura, porta/reader, guard, sem `UnitOfWork`) + kernel atualizado (Financeiro usa factory/guard).
- `docs/engineering/07-workflow-de-engenharia.md` — §17: cobertura do `openapi.int.spec.ts` atualizada de 17 → **18 rotas**; §14: padrão 10 (delta de contrato em módulo existente fecha o vertical no mesmo grupo, contra baseline registrado) — task 6.5.

## 8. Checklist §16 (docs/07)

- [x] **(a)** `api-and-interface-design` carregada no planejamento e citada no `design.md` (decisões 1–2); aplicada na prática: centavos inteiros com teto, janela obrigatória com teto de 366d, moeda literal, sem breakdown, cada campo com uso declarado.
- [x] **(b)** `security-and-hardening` carregada no planejamento (threat model no `design.md`) e no Verify (seção 3), com os 6 abuse cases um a um e as verificações transversais.
- [x] **(c)** Mutation real medido e registrado (seção 2): backend 78,30% → **95,28%** na árvore final com triagem completa; contracts Financeiro 100%; delta de Atendimento 100%.
- [x] **(d)** Teste adversarial: janela hostil real (tipo confundido, gigante, injeção, malformada), `amountCents` hostil na criação (contrato/entidade/caso de uso/HTTP), sondas de superfície sem PII/breakdown + write-then-throw da visibilidade no agregado.
- [x] **(e)** §14 alimentada — padrão 10 (não dispensa): o delta de contrato de módulo existente tem janela vermelha transitória; o grupo fecha o vertical (entidade→caso de uso→mapper→controller) e re-roda a suíte do módulo contra o baseline antes de seguir.

## 9. Emendas e ajustes

- Nenhuma emenda de design no Apply: os dois estados frágeis (guard e saída) já estavam planejados nas tasks 5.2/5.3/5.5/5.6 (§14.8).
- Testes de caracterização adicionados pós-mutation (comportamento já existia; sem RED, como manda a disciplina) — registrados na seção 2.
- Ajuste de fixture descoberto no GREEN 4.2 (`seedPatient` sem default marcava a paciente como anonimizada) — corrigido antes do commit, sem impacto no resultado.
