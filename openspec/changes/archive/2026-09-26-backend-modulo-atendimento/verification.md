# Verificação — backend-modulo-atendimento

- **Change:** `openspec/changes/backend-modulo-atendimento` (branch `feature/backend-modulo-atendimento`)
- **Data:** 2026-09-26
- **Gatilhos de segurança (docs/engineering/07 §7):** entrada de usuário (registro + `limit`), **dados de paciente (PII herdada via join — histórico vinculado)** e **autorização diferida com guard honesto** → revisão de segurança obrigatória, registrada na seção 3 com foco nos três pontos pedidos: **(a)** rotas aninhadas fechando IDOR; **(b)** `findVisible` respeitado em todos os pontos de leitura; **(c)** guard compartilhado sem exceção.

## 1. Testes por nível (docs/07 §13)

| Nível | O que cobre | Arquivos | Testes |
| --- | --- | --- | --- |
| Contrato (group 0) | `AttendanceInput`/`Attendance` (resumo com trim/teto, ISO com Z ou offset, strip de campo clínico, chaves exatas) | 1 | 7 |
| Unit — domínio | `Attendance` (imutável, valida-antes-de-aplicar, tipo confundido → `InvalidAttendance`, timestamps) + portas/fakes | 2 | 13 |
| Unit — aplicação | Três casos de uso + adversarial (hostil, tipo confundido, limite hostil, TOCTOU, anti-eco) | 4 | 24 |
| Integração — persistência | Repositório Prisma + `PatientDirectory` contra Postgres real (round-trip, visibilidade na query, ordem, limite, FK órfã, sem PII) | 1 | 8 |
| Integração — HTTP | Rotas com bypass (8), **guard honesto sem bypass (4 casos)**, contrato de saída (4), **visibilidade dedicada write-then-throw (5)** | 4 | 21 |
| **Total do módulo** | | **12** | **73** |

Suíte completa no Verify: **todas as suítes dos três workspaces verdes** (números na seção 5).

**REDs reais colados (não apenas "testes verdes"):**

- 0.1 (contrato): `Cannot find module './attendance'`; a rodada seguinte revelou que `z.iso.datetime()` puro rejeita offset — contrato ajustado para `{ offset: true }` antes do GREEN.
- 1.1 (wire-up): `No test files found, exiting with code 1`.
- 2.1 (entidade): `Cannot find module './attendance.entity'`.
- 2.3 (portas): `Cannot find module '.../in-memory-attendance.repository'`.
- 3.1 (aplicação): 3× `Cannot find module './*-attendance*.use-case'`.
- 3.3/3.4 (**adversarial real**): 2/8 falhas com **`TypeError`** (`Cannot read properties of null (reading 'trim')`) para tipos confundidos — hardening do domínio adicionado (tipo errado → `InvalidAttendance`, nunca TypeError).
- 4.1 (persistência): `Cannot find module '.../attendance.repository.impl'`.
- 5.1 (HTTP): `Cannot find module '.../attendance.module'`.
- 5.3/5.4 (**guard**): 4/4 falhas — `expected 201 to be 403` (POST), `expected 200 to be 403` (GET lista e detalhe) e bloqueio total ausente (`[201, 200, 200]`) — **sem guard, as rotas respondiam normalmente**.
- 5.5/5.6 (saída): 3/3 falhas com o corpo sem `updatedAt` (`AttendanceSchema.safeParse` → false).
- 5.7 (**findVisible via join**): write-then-throw em camadas — ver abaixo.

**Provas negativas (garantias críticas provadas pela falha, não pela ausência dela):**

- **Guard honesto é a ÚNICA barreira (task 5.3→5.4):** com o guard ativo e sem bypass, as 3 rotas respondem 403 `AUTH_NOT_IMPLEMENTED` (4/4 provas, corpo só `code`+`message`); com `overrideGuard()` (simulando a Identidade futura), as MESMAS rotas respondem 200/201 conforme contrato (8/8) — o contraste prova que nada além do guard protegia.
- **`findVisible` via join, camada a camada (task 5.7 — quita a dívida R3 de Pacientes):**
  1. **Camada 2 fora** (filtro de relação removido de propósito das duas queries do repositório): o teste de integração do repositório reprovou — `findVisibleById` devolveu o atendimento de paciente anonimizada (`expected Attendance{...} to be null`); o teste HTTP dedicado **continuou verde** (a camada 1 sozinha bloqueia o acesso direto) — cada camada tem papel próprio.
  2. **Camadas 1 e 2 fora** (porta `PatientDirectory` também deixou de filtrar): o teste HTTP dedicado reprovou com **vazamento real** — lista e detalhe da anonimizada responderam `200` em vez de `404`, e o registro respondeu `201` em vez de `404` (`expected 200 to be 404` / `expected 201 to be 404`).
  3. **Camadas restauradas:** 13/13 verdes (repositório + visibilidade HTTP), árvore idêntica ao commitado (`git diff` vazio na infraestrutura).
- **Teto de `limit` em três camadas:** Zod na fronteira (`max(500)` → 422 para 501 e `abc`), guarda no núcleo (0/negativo/501/10k/fracionário/NaN → `InvalidAttendance`) e `take: limit` na query — provado em unit, adversarial, integração e HTTP.
- **Anti-enumeração:** paciente inexistente e anonimizada respondem o MESMO 404 (corpos comparados literalmente no HTTP); atendimento cruzado/inexistente → mesmo 404; `findVisibleById` exige o vínculo (`patientId`) na query; mensagens fixas sem eco de id/PII.
- **Tipo confundido vira erro de domínio:** resumo/data/id/paciente não-string (null, número, objeto com `trim`/`toString`) → `InvalidAttendance`; snapshot corrompido no banco não derruba o `restore` com TypeError.
- **Histórico imutável:** nenhum update/delete na entidade (API da classe auditada por teste); `PUT`/`PATCH`/`DELETE` na rota → 404 de rota, com a linha conferida intacta no banco depois.
- **FK impede órfão:** inserir atendimento para paciente inexistente é rejeitado pelo banco (constraint real), sem catch silencioso.

**Emendas de design (registradas em `design.md`/spec de delta ANTES do GREEN — padrão §14.9):**

1. `AttendanceInput` sem `patientId` (o vínculo vive no path — decisão 7); caso de uso recebe `{ patientId, summary, performedAt }`.
2. `performedAt` aceita UTC e offset explícito (`z.iso.datetime({ offset: true })`) e o núcleo valida ISO estrito — o RED 3.1 mostrou que `new Date` sozinho aceita `10/09/2026` como data.
3. `PatientDirectory.findVisiblePatient` retorna `{ id }` (sem `fullName` — o contrato de saída não expõe nome; materializá-lo seria dado sem consumidor).
4. Vocabulário de erro do módulo inclui `PATIENT_NOT_FOUND` (paciente invisível no registro/listagem/detalhe) além de `INVALID_ATTENDANCE`/`ATTENDANCE_NOT_FOUND`.

## 2. Mutation testing (task 6.1 — docs/07 §16.c)

- **Backend (módulo Atendimento):** `pnpm --filter backend exec stryker run --mutate 'src/attendance/**/*.ts,!src/attendance/**/*.spec.ts,!src/attendance/**/*.module.ts'` — **207 mutantes**. Histórico real da medição:
  1. **1ª rodada: 82,61%** (171 mortos / 36 sobreviventes, 0 sem cobertura, 0 timeout).
  2. **Triagem:** 2 mutantes de âncora do regex, 1 de short-circuit de tipo, 5 de checagem de timestamps, 1 de fronteira (`summary` de 1 caractere), 1 do filtro de relação na listagem (só detectável consultando a anonimizada diretamente) e 1 de fronteira do `limit` no HTTP (`?limit=2`) → testes de caracterização adicionados (comportamento já existia; passam direto — **sem RED**, registrados como tal). Os 2 mutantes de âncora motivaram também testes de string com espaço e com lixo nas pontas.
  3. **2ª rodada (árvore intermediária): 91,79%** (190 mortos / 17 sobreviventes).
  4. **3ª rodada (árvore final): 91,79%** — **190 mortos / 17 sobreviventes**, 0 sem cobertura, 0 timeout; a árvore final mudou (testes de âncora/espaço) e a medição foi refeita nela.
- **Sobreviventes finais aceitos (17, todos justificados):**
  - **2 equivalentes no regex do núcleo (âncoras `^`/`$`):** removidas as âncoras, qualquer string com prefixo/sufixo que ainda chegue ao `new Date` vira `Invalid Date` — e o V8 **não** faz trim de ISO (`new Date(" 2026-09-10T14:30:00.000Z")` → `NaN`, verificado no runtime); o mesmo `InvalidAttendance` é lançado nas duas versões. A âncora é defesa redundante com a checagem de instância.
  - **10 literais de mensagem de erro** (entidade, erros, dois casos de uso): o texto não altera o contrato observável (classe e `code` são assertados; as duas mensagens que importam — `Paciente não encontrada.` e `Atendimento não encontrado.` — são assertadas no adversarial).
  - **4 literais de documentação no controller** (`type: "object"`/`"string"` do `FORBIDDEN_SCHEMA`): o teste OpenAPI asserta o que importa (descrição do 403 com guard/UC 4.2.1 e `code.example`); trocar o tipo/literal do esquema de exemplo não muda comportamento.
  - **1 equivalente no filtro de exceções:** mapear todo `DomainError` para 404 é indistinguível de 422 no HTTP — o `InvalidAttendance` do núcleo nunca chega ao filtro (a validação Zod reprova antes, defesa em profundidade); o 404 dos dois `NotFound` é assertado.
- **Contracts (schemas de Atendimento):** escopo estendido (`contracts/stryker.config.mjs`); **100,00% (9/9 mortos, 0 sobreviventes)** já na primeira medição.
- **Escopos dos configs estendidos** (`backend/stryker.config.mjs` e `contracts/stryker.config.mjs`) para `src/attendance/**`.

## 3. Revisão de segurança (task 6.2 — `security-and-hardening`)

Foco pedido (join com PII + guard), um a um:

| Verificação | Resultado |
| --- | --- |
| **(a) Rotas aninhadas fecham IDOR** | Controller em `patients/:patientId/attendances`; o detalhe exige o vínculo na query (`where: { id, patientId, patient: active }`); paciente e atendimento cruzados respondem 404 idêntico (comparação literal de corpos no HTTP); id de URL limitado (mín 1/máx 200) e opaco (nunca interpretado) |
| **(b) `findVisible` em TODOS os pontos de leitura** | `create` consulta a porta (paciente invisível → 404 sem criar); `list` consulta a porta e filtra a relação na query; `detail` consulta a porta e a query exige paciente ativa; a porta implementa o MESMO `status: "active"` do dono e seleciona só o `id`. Provado por write-then-throw em duas camadas (seção 1) |
| **(c) Guard compartilhado sem exceção** | Uma única definição (`grep`: `backend/src/shared/http/identity-pending.guard.ts`), `@UseGuards` no controller (3 rotas, sem exceção); suíte de Pacientes (29 testes) verde após a movimentação — zero regressão; 403 `AUTH_NOT_IMPLEMENTED` em 4/4 provas |
| Injeção | Prisma parametrizado; zero `$queryRaw`/`$executeRaw`/`eval`; resumo hostil (`' OR 1=1 -- \u0000 ✨`) persistido literalmente (testado) |
| Enumeração | 404 idêntico inexistente/anonimizado (paciente E atendimento); mensagens fixas sem eco; TOCTOU (visível na porta, invisível na query) → `AttendanceNotFound` (testado) |
| Over-collection / LGPD | Contrato sem campo clínico, sem prontuário, sem nome/e-mail da paciente; `patientId` só como vínculo; sem snapshot de PII no histórico (só FK); directory seleciona só `id`; campos fora do contrato ignorados sem efeito (chaves exatas testadas); seed 100% fictício |
| PII em logs/erros | Nenhum log no módulo (`grep`); filtro devolve só `code`+`message`; 422 sem eco (testado) |
| Segredos | Nenhum no módulo; `DATABASE_URL` via env (factory do kernel) |
| Imutabilidade como direito do titular | Sem update/delete na entidade nem na rota; correção por novo registro; exclusão de dados pessoais acontece na paciente (anonimização), e o histórico some das leituras junto com ela |
| DoS de listagem | `limit` com teto (500) em três camadas + índice `(patientId, performedAt)`; rate limiting entra com o hardening de staging (mesma decisão dos módulos anteriores) |
| Autorização real pendente | Risco residual registrado: bloqueio honesto ≠ autenticação; trigger de substituição obrigatório no módulo de Identidade — agora com o guard no kernel, a troca alcança os dois módulos administrativos de uma vez |
| Resíduo de conteúdo | `summary` é texto livre operacional: um operador PODE digitar dado clínico apesar do contrato não ter campo clínico — resíduo de processo (teto de 500 + revisão humana; campo clínico dedicado exigiria requisito explícito do UC) — registrado como FYI |

**Achado da revisão:** nenhum vazamento ou bypass encontrado; a dívida R3 de Pacientes (join respeitando `findVisible`) está **operante e provada por falha**, com cada camada de defesa exercitada isoladamente.

## 4. Revisão de código (task 6.3 — `code-review-and-quality`)

- **Correção:** 73 testes do módulo verdes; contrato nas duas pontas; as 6 requirements da spec exercitadas (registro, leitura visível, imutabilidade, contrato, guard, escopo do `limit`).
- **Arquitetura:** `domain/` sem imports externos além do kernel de erro (auditado); `application/` só domínio + `node:crypto`; `infrastructure/` implementa as portas e **não importa o domínio de Pacientes** (leitura cruzada pela porta `PatientDirectory`); `presentation/` fina com guard do kernel, pipe/filtro locais; sem `UnitOfWork` (escrita de entidade única — decisão 4); `AttendanceModule` wireado no `AppModule`.
- **Legibilidade:** nomes consistentes com os módulos anteriores; comentários só de decisão (imutabilidade, visibilidade em camadas, emendas); allowlist única no controller.
- **Simplicidade:** nenhuma abstração nova além do necessário; o scaffold frágil planejado (controller sem guard, mapeamento sem `updatedAt`) foi removido no fechamento das tasks; sem dead code (cast provisório removido quando o mapeamento fechou).
- **Segurança:** seção 3 (revisão dedicada).
- **Performance:** queries por PK/FK com índice `(patientId, performedAt)`, ordem determinística, `take: limit`; sem N+1; sem paginação completa (trigger registrado).
- **FYIs:** quinto pool de conexão conscientemente adiado (decisão 10); guard movido ao kernel sem duplicação; FK `RESTRICT` documenta que a paciente não é apagada fisicamente (anonimização).

## 5. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `pnpm lint` | ✅ limpo (1 warning pré-existente em `frontend/stryker.config.mjs`) |
| `pnpm format` | ✅ limpo (após `format:write` nos arquivos do módulo) |
| `pnpm typecheck` | ✅ limpo |
| `pnpm test` | ✅ **96 arquivos / 472 testes** (backend 67/295, contracts 14/68, frontend 15/109); cobertura backend 99,62% linhas / 97,82% branches |
| `pnpm build` | ✅ limpo |
| `pnpm audit --audit-level high` | ✅ 0 high/critical (3 moderate — baseline do repo) |

## 6. Documentação atualizada (task 6.4)

- `docs/product/08-backlog-produto.md` — UC 4.2.5 → **Em andamento** (histórico imutável, visibilidade herdada provada, guard compartilhado; pendentes com trigger: correção, exportação, offset/busca, guard Keycloak/RBAC).
- `docs/product/05-estado-atual.md` — pendência do join em Pacientes marcada como **resolvida** por este change (dívida de backups pré-anonimização permanece, com trigger de produção).
- `docs/architecture/c2-container.md` — quinto módulo e rotas no container Real; PostgreSQL com a FK nova.
- `docs/architecture/c3-component.md` — seção "Backend (real — módulo Atendimento/Histórico)" com diagrama, duas camadas de visibilidade, imutabilidade e bloqueio honesto; seção do kernel atualizada (guard com definição única + módulos Pacientes/Atendimento).
- `docs/engineering/07-workflow-de-engenharia.md` §14 — padrão 9 (emenda de design no Apply registrada antes do GREEN) — task 6.5.
- `docs/engineering/07-workflow-de-engenharia.md` §17 — contagem de rotas cobertas pelo `openapi.int.spec.ts` atualizada (14 → 17) na mesma task dos decorators.
- `openspec/specs/api-contracts/spec.md` — Purpose com "e Atendimento/Histórico" + requirements novos, no archive/sync.

## 7. Checklist §16 (docs/07)

- [x] **(a)** `api-and-interface-design` carregada no planejamento e citada no `design.md` (decisões 1, 2, 3, 7 e 8 — contrato mínimo do zero, vínculo sem snapshot, forma das rotas, cap com trigger).
- [x] **(b)** `security-and-hardening` carregada no planejamento (threat model no `design.md`) — revisão do Verify na seção 3, com foco em IDOR/visibilidade/guard.
- [x] **(c)** Mutation real medida e registrada (seção 2), com triagem completa em três rodadas (contratos 100% na primeira).
- [x] **(d)** Teste adversarial: payloads hostis reais (tipo confundido, injeção/unicode, limites, id gigante), sondas de bypass (TOCTOU, cruzado) + guard (RED real) + write-then-throw da visibilidade em duas camadas.
- [x] **(e)** §14 alimentada — padrão 9 (novo), não dispensa.

## 8. Emendas e ajustes

- Emendas de design registradas na seção 1 (antes do GREEN, conforme padrão §14.9) — nenhuma lacuna estrutural encontrada nas revisões do Verify que exigisse nova emenda.
