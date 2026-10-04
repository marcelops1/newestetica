## Context

Ver `proposal.md` (Why). Ponto de partida verificado: `backend/src/attendance/` é o módulo mais próximo (entidade imutável com `summary`/`performedAt`, porta `PatientDirectory` com visibilidade, repositório com filtro de relação `patient: { status: "active" }`, `IdentityPendingGuard` honesto importado do kernel, ordem TDD Domain→Application→Infrastructure→Presentation em docs/07 §15); `backend/src/shared/` (kernel da decisão 04 §22) fornece pipe, base de filtro, base de erro e factory de cliente; UC 4.2.6 exige só visão essencial (recebimentos, pendências), sem fiscal/contábil; `docs/security/03-seguranca.md` §4 proíbe dado sensível de saúde e exige coleta mínima; hoje nenhum modelo guarda valor — o dinheiro ainda não tem casa.

## Goals / Non-Goals

**Goals:**

- Dinheiro com casa mínima e imutável: valor opcional no Atendimento, agregado essencial por janela no Financeiro, com a invariante "anonimizada nunca compõe o agregado" valendo em TODA leitura, provada por teste dedicado com negação deliberada.
- Agregado sem PII por construção: a resposta não tem campo para vazar — não há breakdown para filtrar depois.

**Non-Goals:**

- Entidade de cobrança/lançamento, preço no catálogo, contas a receber/pagar, emissão fiscal/contábil.
- Autorização real (Keycloak/RBAC) — mesma decisão dos 5 módulos: bloqueio honesto até a Identidade.
- Breakdown por paciente, exportação, paginação do agregado, update/delete de valor, migração do frontend.

## Decisions

### 1. Valor mora no Atendimento como `amountCents` opcional (skill `api-and-interface-design`)

`amountCents`: inteiro, mínimo 0, máximo 10.000.000 (teto de R$ 100.000), ausente quando não informado; coluna `Int?` nullable no Prisma; aceito na criação (`AttendanceInput`), devolvido na saída (`Attendance`, inteiro ou nulo), imutável depois de criado (não existe rota de alteração — o histórico já é append-only, então a imutabilidade do valor vem de graça da estrutura). Rationale: o UC 2.6.1 pede "recebimentos" — o recebimento É o atendimento valorado; criar casa nova para o mesmo fato duplica a verdade e abre divergência (valor no lançamento ≠ valor no atendimento). Centavos inteiros eliminam arredondamento binário de float; opcional porque nem todo atendimento tem valor no MVP (avaliação, cortesia, pendência de lançamento); teto porque sem limite o campo aceita `Number.MAX_SAFE_INTEGER` como "preço". Alternativas consideradas: entidade própria `Charge`/`Invoice` (rejeitada — segundo agregado para o mesmo fato, exigiria `UnitOfWork` entre atendimento e cobrança sem caso de uso multi-escrita; contabilidade disfarçada de MVP); preço no catálogo (`Procedure.price`, rejeitada — quebra o desacoplamento entre contextos: o realizado varia por paciente/sessão e o catálogo é público, misturar os dois vaza preço para a vitrine e acopla Financeiro a Catálogo sem necessidade); `float` em reais (rejeitada — 0.1+0.2; dinheiro em float é bug agendado); valor obrigatório (rejeitado — impede registrar atendimento sem valor fechado, que é o fluxo real da recepção).

### 2. Contrato do zero, moeda literal, sem PII (skill `api-and-interface-design`)

`FinanceSummaryQuery`: `from`/`to` obrigatórios em data ISO (`YYYY-MM-DD`), `from` ≤ `to`, span ≤ 366 dias — janela obrigatória para nunca varrer a tabela inteira sem bound. `FinanceSummary`: `{ from, to, currency: "BRL", totalCents, count }` — `currency` literal (não enum aberto: só existe BRL no MVP; enum sugere multi-moeda que não há), `totalCents` inteiro ≥ 0, `count` inteiro ≥ 0 (atendimentos COM valor — o denominador é declarado, não ambíguo). Sem `patientId`, sem nome, sem breakdown: a resposta não tem campo para PII, então não há filtro para esquecer. Rationale (contrato primeiro, skill §Contract First): cada campo tem uso declarado na tela essencial da Fabiana (total + contagem por período); Hyrum's Law ao contrário — o que nunca foi exposto nunca vira compromisso. Alternativas consideradas: `GET /finance/summary` sem janela com default "mês atual" (rejeitada — default inventa período; janela explícita é auditável); breakdown por paciente (rejeitada — é PII agregada com outro nome; nasce com requisito explícito e RBAC real, nunca por acidente); `totalCents` incluindo atendimentos sem valor como zero no `count` (rejeitada — denominador ambíguo: "12 atendimentos, R$ 800" de 12 valorados ou de 30 com 18 zerados?; `count` = contribuintes, documentado); multi-moeda (rejeitada — YAGNI; literal vira enum em change próprio se um dia houver).

### 3. Só leitura agregada, agregação pura no domínio, porta própria

`GET /finance/summary?from=&to=` — a única rota do módulo. O domínio expõe função pura `summarize(entries, from, to): { totalCents, count }` (zero import externo — mesma regra dos demais domínios): filtra por período + valor não-nulo, soma em inteiros. A porta `FinanceSummaryReader` (definida no domínio de Financeiro, implementada no Prisma) devolve apenas pares `{ amountCents, performedAt }` de atendimentos de pacientes visíveis — nunca entidades, nunca PII. Rationale: agregado não é entidade (não tem id, não tem ciclo de vida) — entidade de "resumo" seria Active Record disfarçado; função pura é testável sem banco e sem NestJS. Alternativas consideradas: agregação no SQL (`SUM`/`COUNT` direto, rejeitada — esconde a regra no dialeto e impede o teste unitário puro; o dataset por janela é pequeno, sem motivo de performance); reutilizar `AttendanceRepository.findVisibleByPatient` em loop por paciente (rejeitada — N+1 por construção e exige listar pacientes, que é PII na veia da leitura).

### 4. Sem `UnitOfWork`; cliente Prisma próprio (sexto pool, unificação adiada)

Sem `UnitOfWork`: o módulo só lê — não há escrita alguma para atomizar (YAGNI ainda mais barato que no Atendimento). Cliente próprio: o `FinanceModule` cria o seu `PrismaClient` com `createPrismaClientFromEnv` do kernel, igual aos outros cinco módulos — sexto pool consciente, mesmo padrão das decisões 10 anteriores (cliente próprio por módulo; adiado é SÓ a unificação em provider compartilhado, em change próprio com o mesmo gatilho). **Gatilho:** quando o provider compartilhado nascer (ou sob pressão de pools), o wiring migra sem tocar domínio/aplicação — a porta não conhece o cliente. Alternativas consideradas: cliente emprestado do Atendimento via token exportado (`ATTENDANCE_PRISMA_CLIENT`, rejeitada — acopla dois bounded contexts no wiring e exige alterar o `AttendanceModule`, já fechado; importar o módulo vizinho pelo cliente é dependência concreta entre contextos, exatamente o que o 02 §3 proíbe); provider compartilhado agora (rejeitada — pertence a change próprio com trigger, não a carona neste); ler via `AttendanceRepository` (rejeitada — decisão 3: N+1 + PII).

### 5. Visibilidade herdada no agregado, filtro na query

O reader Prisma filtra `patient: { status: "active" }` na relação (mesma 2ª camada do Atendimento) e ignora `amountCents: null`; atendimentos sem valor não somem do histórico — só não compõem dinheiro. Anonimizar a paciente remove seus valores do agregado futuro sem apagar o histórico (LGPD por construção: o dado some da leitura, não do disco). Rationale: a invariante vive onde o dado é tocado (query), não em filtro de memória — registro de anonimizada não sai do banco em leitura visível.

### 6. Guard honesto do kernel em todas as rotas

`IdentityPendingGuard` (código `AUTH_NOT_IMPLEMENTED`) via `@UseGuards` no controller de Financeiro, sem exceção e sem duplicar a classe. Rationale: zero vocabulário de domínio — é plumbing, exatamente o que o kernel admite; o sexto módulo replica o padrão dos 5, não o problema que o kernel resolveu.

### 7. Deltas MODIFIED explícitos, specs congeladas intocadas (regra 7 do `AGENTS.md`)

`api-contracts` e `backend-attendance` mudam SOMENTE via delta neste change (blocos MODIFIED completos, nunca parciais — a regra do archive: MODIFIED parcial perde detalhe). A regra 7 ("Nunca altere openspec/specs/ fora do ciclo de changes") é respeitada pelo mecanismo, não pela intenção: `openspec/specs/` não é tocado nesta sessão; o archive aplica os deltas. Rationale: specs são fonte da verdade — edição direta é burla do processo mesmo com boa intenção.

### 8. Saída = contrato, sem parse em runtime

Allowlist explícita no controller com tipos do próprio `@newestetica/contracts`; validação nas duas pontas via testes. Sem parse runtime (a invariante de visibilidade vive na query + testes de ausência, como no Catálogo/Atendimento). Erros em `{code, message}` sem eco.

### 9. Seed fictício com valores (detalhe)

Atendimentos fictícios do seed ganham `amountCents` em parte (um com valor, um sem) para exercitar os dois caminhos; valores fictícios irrealistas-arredondados (ex.: 15000 = R$ 150,00), sem dado clínico, sem dado real em nenhum artefato.

## Checklist §16 (obrigatório para este change, que cria módulo novo)

- **(a) `api-and-interface-design` citada:** carregada nesta sessão de planejamento; aplicada nas decisões 1 (centavos inteiros com teto, cada campo com uso declarado, rejeições) e 2 (contrato do zero, janela obrigatória, moeda literal, sem breakdown).
- **(b) `security-and-hardening` no planejamento:** carregada nesta sessão; threat model abaixo com rigor de agregado monetário. Revisão do Verify continua obrigatória (docs/07 §7).
- **(c) Mutation:** tasks deste change incluem medição Stryker contra o módulo + `contracts/src/finance/` e o delta de `contracts/src/attendance/`, com score e triagem em `verification.md` (meta docs/07 §13).
- **(d) Adversarial:** tasks incluem teste com payload hostil real (janela malformada/gigante/invertida, span estourado, `amountCents` fracionário/negativo/gigante, injeção em query) + sondas de bypass (anonimizada fora do agregado; agregado sem PII/breakdown) — não só raciocínio.
- **(e) §14:** tasks incluem avaliação ao final — se o apply exigir emendas ou render padrões reutilizáveis, alimenta; senão, registra a dispensa com motivo.

### Threat model da fronteira (planejamento, skill `security-and-hardening`)

- **Fronteira:** `GET /finance/summary?from=&to=` — sob o guard honesto (403) até a Identidade, por desenho (decisão 6).
- **Ativos:** agregado monetário (total + contagem). Sem PII em repouso na resposta por construção (decisão 2).
- **Abuse cases:** (1) janela malformada/gigante/invertida ou span estourado → Zod na fronteira (422, teto 366d); o teto é também bound de DoS de varredura; (2) `amountCents` hostil na criação (fracionário, negativo, gigante, injeção) → Zod no contrato + validação no domínio, 422 sem eco; (3) **bypass de visibilidade no agregado (vetor central)** — o filtro é na query (`patient: {status: "active"}`); a prova é no HTTP (valor de anonimizada semeado, assert de ausência no total) — FK impede órfão, filtro exclui, teste prova; (4) inferência de PII via agregado (fishing por janelas estreitas para isolar uma paciente) → sem breakdown e sem contagem 1=1 protegida? Não: janela de 1 dia com 1 atendimento ainda revela valor — **risco aceito e declarado**: o módulo é administrativo (Fabiana, admin) sob futuro RBAC, não público; o mesmo risco existe na listagem de histórico; mitigação futura é papel `reception` sem financeiro, em change de Identidade; (5) acesso não autenticado → bloqueado pelo guard honesto (403 explícito), mesmo risco residual e trigger dos 5 módulos; (6) float/overflow na soma → inteiros com teto de entrada; soma de janela limitada não estoura `Number.MAX_SAFE_INTEGER` (teto por registro × registros de 366 dias, ordens abaixo do limite — assert em teste).
- **STRIDE resumido:** Spoofing sem identidade nesta fatia (guard nega tudo); Tampering sem escrita (só leitura + valor imutável na criação, decisão 1); Repudiation fora de escopo (trilhas futuras, 03 §12); Information disclosure controlado por ausência de campo PII + visibilidade na query + risco de fishing declarado acima; DoS limitado pelo teto de span; Elevation bloqueado pelo guard até a Identidade (trigger).

### Prova de visibilidade no agregado (dedicada — write-then-throw)

A invariante "anonimizada nunca compõe o agregado" é provada em três pontos, do mais barato ao mais caro: (1) **unitário**: `summarize` pura sobre entradas mistas (com/sem valor, dentro/fora da janela) → total e contagem exatos, sem banco; (2) **integração do reader**: atendimentos valorados semeados + paciente anonimizada no banco → reader devolve só os da ativa; (3) **HTTP dedicado (task explícita)**: semear valores em paciente ativa e em paciente que será anonimizada, anonimizar via repositório de Pacientes no setup, asserir que `GET /finance/summary` reflete só a ativa — **RED**: com o filtro de relação removido de propósito (write-then-throw), o valor da anonimizada entra no total e o teste reprova; **GREEN**: com `patient: {status: "active"}` o teste passa. A garantia é distinguível pela falha, não presumida — mesmo padrão das provas de consentimento, anonimização e join do histórico.

## Risks / Trade-offs

- [Risco] Sexto pool de conexão (cliente próprio) → Mitigação: mesmo padrão consciente dos 5 módulos; gatilho de unificação registrado na decisão 4 (provider compartilhado em change próprio ou sob pressão de pools).
- [Risco] Fishing por janelas estreitas revela valor individual → Mitigação: risco declarado no threat model (abuse 4); módulo administrativo sob futuro RBAC; sem breakdown, o vazamento exige adivinhar a janela exata.
- [Risco] `amountCents` livre recebe dado errado (valor digitado errado, imutável) → Mitigação: teto + tipo inteiro + correção via novo registro; fluxo de correção com trigger se a Fabiana pedir.
- [Trade-off] Sem breakdown por paciente agora → aceito: nasce com requisito explícito + RBAC, nunca por acidente.
- [Trade-off] Sexto pool (cliente próprio, mesmo padrão dos 5 módulos) → aceito com trigger explícito na decisão 4.
- [Trade-off] Sem fiscal/contábil nesta fatia → fora do MVP por definição (UC 2.6.1); estrutura (janela + centavos) não bloqueia evolução.

## Migration Plan

Sem migração de dados: coluna `amountCents` nullable via migration versionada (nullable = atendimentos existentes continuam válidos, sem backfill inventando valor); rollback = reverter o merge. Nenhum dado existente é tocado. Ordem de `deleteMany` no `resetDatabase` inalterada (sem tabela nova). O módulo de Atendimento não é alterado no wiring (só entidade/mappers ganham o campo).

## Open Questions

Nenhuma bloqueante. Fluxo de correção de valor, breakdown por paciente, papel `reception` sem financeiro, exportação, provider Prisma compartilhado e guard Keycloak/RBAC pertencem a changes futuros explícitos com triggers registrados.
