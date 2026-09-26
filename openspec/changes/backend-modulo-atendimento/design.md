## Context

Ver `proposal.md` (Why). Ponto de partida verificado: `backend/src/patients/` é o módulo de referência mais próximo (entidade com `status`/`anonymizedAt`, porta `findVisible*` que exclui anonimizada na query, `IdentityPendingGuard` honesto em `presentation/guards/`, fakes em `test/fakes/`, ordem TDD Domain→Application→Infrastructure→Presentation em docs/07 §15); `backend/src/scheduling/` é a referência para escrita com `UnitOfWork` — não se aplica aqui (decisão 4); `backend/src/shared/` (kernel da decisão 04 §22) fornece pipe, base de filtro, base de erro e factory de cliente; UC 4.2.5 exige histórico simples operacional, sem prontuário; `docs/security/03-seguranca.md` §4 proíbe dado sensível de saúde no MVP e exige direitos preparáveis; a dívida do change de Pacientes exige visibilidade herdada em joins.

## Goals / Non-Goals

**Goals:**

- CRUD mínimo honesto de histórico (create + listagem por paciente + detalhe), com a invariante "histórico de anonimizada nunca aparece" valendo em TODA leitura, provada por teste dedicado com negação deliberada.
- Estrutura dos direitos do titular sem retrabalho: visibilidade centralizada, `findVisible` como única porta de leitura cruzada.

**Non-Goals:**

- Update/delete de atendimento (histórico é imutável — correção via novo registro; trigger se a Fabiana pedir fluxo de correção).
- Autorização real (Keycloak/RBAC) — mesma decisão do módulo de Pacientes: bloqueio honesto até a Identidade.
- Fotos/anexos, dados clínicos, exportação, offset/busca textual, idempotency-key, criptografia em repouso, migração do frontend.

## Decisions

### 1. Contrato mínimo desenhado do zero (skill `api-and-interface-design`)

`AttendanceInput` (create): `summary` (trim, min 1, max 500 — "o que foi realizado" em texto operacional) e `performedAt` (`z.iso.datetime({ offset: true })` — aceita UTC e offset explícito do cliente administrativo; permite retro-preencher atendimentos passados; default **não** aplicado para não inventar data). O vínculo `patientId` é o parâmetro de path `:patientId` da rota aninhada (decisão 7) — **emenda do apply**: não entra no corpo para não duplicar o vínculo nem abrir divergência path×body; o caso de uso recebe `{ patientId, summary, performedAt }`. `Attendance` (saída): `id` UUID do servidor + `patientId` + `summary` + `performedAt` + `createdAt`/`updatedAt` ISO. Sem `PatientUpdate`-equivalente (não há update), sem status próprio (a visibilidade é herdada, não duplicada), sem nome de paciente persistido. Rationale: cada campo tem uso declarado; `summary` livre com teto é o mínimo operacional real de "o que foi feito" (uma referência a procedimento do catálogo seria link elegante, mas cria acoplamento prematuro a outro contexto sem caso de uso). Alternativas consideradas: `procedureId` FK para o catálogo (rejeitada — acoplamento a segundo contexto sem necessidade; texto operacional basta no MVP); `notes` livre adicional (rejeitada — segundo campo de texto dobra a superfície para dado clínico vazar); `performedAt` default `now()` (rejeitada — inventaria data de passado; recepção informa a data real); `patientId` no corpo (rejeitada na emenda — duplicação do vínculo já carregado pelo path).

### 2. Vínculo por FK sem snapshot de nome (anti-vazamento por desenho)

`Attendance.patientId` FK para `Patient.id`; **nenhum** `patientName` denormalizado no registro. Rationale: snapshot congela PII no momento da criação — se a paciente for anonimizada depois, o histórico exibiria o nome antigo (exatamente o vazamento que a dívida proíbe). Sem o nome persistido, a anonimização apaga a exibição por construção; o nome exibido é sempre o atual, resolvido na leitura. Alternativa considerada: snapshot de nome + revalidação na leitura (rejeitada — duplica PII em segunda tabela, dobra os lugares para auditar e não compra nada: a leitura precisaria da checagem de qualquer jeito).

### 3. Porta `PatientDirectory` no domínio de Atendimento (comunicação explícita entre contextos)

O domínio de Atendimento declara a sua própria porta `PatientDirectory.findVisiblePatient(id): Promise<{ id: string } | null>` (**emenda do apply**: sem `fullName` — o contrato de saída não expõe nome, então materializá-lo seria dado sem consumidor; a porta carrega só a visibilidade e o vínculo); a implementação Prisma consulta a tabela `Patient` com o filtro `status: "active"` — **nenhum import do domínio de Pacientes** (02 §3 preservado: contextos não conhecem detalhes internos um do outro; a comunicação é explícita, nomeada e controlada pela porta do consumidor). As leituras de histórico usam filtro de relação equivalente na query (`patient: { status: "active" }`), e a criação exige paciente visível (inexistente/anonimizada → mesmo 404). Rationale: a alternativa "boa o suficiente" (importar `PatientRepository` de Pacientes) fundiria os contextos no primeiro join e quebraria a regra que os 4 módulos respeitaram; a alternativa "cega" (sem checagem, só FK) cumpre integridade mas não visibilidade — e visibilidade é a invariante. Alternativa considerada: evento/listener de anonimização em cascata (rejeitada — acoplamento temporal entre módulos + deleção física parcial, contra a decisão de anonimizar sem apagar).

### 4. Sem `UnitOfWork` neste módulo

Rationale: só há escritas de entidade única (`Attendance.create` + `save`); a checagem da paciente é leitura, não escrita — não existe operação multi-escrita para atomizar (mesmo YAGNI dos módulos anteriores, agora com leitura cruzada documentada). Alternativa considerada: reutilizar por simetria com o scheduling (rejeitada — o scheduling atomiza Slot+Booking em escrita; aqui não há segundo agregado em escrita).

### 5. Histórico imutável: sem update, sem delete

Rationale: histórico é append-only por natureza (o que foi realizado não "desacontece"); correção se faz com novo registro; exclusão de dados pessoais acontece na paciente (anonimização), e o histórico de anonimizada some das leituras pela invariante — não há nada para o delete apagar sem violar a regra. Alternativa considerada: PATCH para typos (rejeitada — sem caso de uso da Fabiana; trigger registrado para fluxo de correção com o painel admin).

### 6. Guard honesto movido para o kernel (`backend/src/shared/http/`)

`IdentityPendingGuard` (código `AUTH_NOT_IMPLEMENTED`, mensagem apontando UC 4.2.1) muda de `patients/presentation/guards/` para o kernel, e os dois controllers passam a importar de lá; o módulo de Pacientes só redireciona o import (coberto pela sua suíte de guard). Rationale: o guard contém zero vocabulário de domínio — é plumbing puro, exatamente o que a exceção do kernel (§22) admite; replicá-lo no quinto módulo seria a duplicação que o change anterior eliminou. Alternativa considerada: replicar o guard por módulo (rejeitada — recria em um change o problema resolvido no anterior; o precedente do pipe/filtro manda compartilhar).

### 7. Rotas aninhadas sob a paciente, com checagem de pertencimento

`POST /patients/:patientId/attendances`, `GET /patients/:patientId/attendances` (com `limit`), `GET /patients/:patientId/attendances/:id` — detalhe confere que o atendimento pertence à paciente da URL (cruzado → mesmo 404). Rationale: o aninhamento expressa a propriedade e fecha IDOR por construção (adivinhar id de atendimento de outra paciente não revela nada); erros no formato `{code, message}` com `INVALID_ATTENDANCE`/`PATIENT_NOT_FOUND`/`ATTENDANCE_NOT_FOUND` genéricos, sem eco (**emenda do apply**: o vínculo é parâmetro de path, e o caso de uso recebe `{ patientId, summary, performedAt }`). Alternativas consideradas: `GET /attendances?patientId=` flat (rejeitada — espalha a checagem de visibilidade em parâmetro opcional; o nome da rota deve carregar a regra, precedente `findVisible`); detalhe flat `/attendances/:id` (rejeitada — exigiria a mesma checagem sem o benefício estrutural do aninhamento).

### 8. Listagem com `limit` desde já (mesmo padrão de Pacientes)

`limit` opcional (padrão 100, máximo 500; acima → 422), ordem `performedAt` descendente (convenção de histórico, mais recentes primeiro) com desempate `id` ascendente; sem offset/busca (trigger: recepção pedindo localização). Rationale: mesma defesa proporcional de Pacientes — histórico cresce sem teto por paciente longeva. Alternativas: sem parâmetro (rejeitada — resposta ilimitada de dados operacionais), paginação completa (rejeitada — prematura).

### 9. Saída = contrato, padrão Catálogo (sem parse em runtime)

Allowlist explícita no controller com tipos do próprio `@newestetica/contracts`; validação nas duas pontas via testes. Sem parse runtime (não há literal a impor — a invariante de visibilidade vive na query + testes de ausência, como no Catálogo). Alternativa considerada: parse runtime por simetria com Conteúdo (rejeitada — sem invariante literal, é custo sem prova).

### 10. Cliente Prisma próprio, unificação adiada de novo

Mesmo padrão dos 4 módulos (factory compartilhada do kernel, instância própria no `AttendanceModule` — quinto pool conscientemente adiado; trigger de provider compartilhado continua em change próprio).

### 11. Seed fictício mínimo (detalhe)

2 atendimentos fictícios vinculados às pacientes fictícias do seed (ids fixos do seed de Pacientes); testes inserem direto via repositório. Summaries operacionais fictícios ("Limpeza de pele realizada, sem intercorrências" — sem dado clínico), `performedAt` em datas passadas fictícias. Nenhum dado real em nenhum artefato.

## Checklist §16 (obrigatório para este change, que cria módulo novo)

- **(a) `api-and-interface-design` citada:** carregada nesta sessão de planejamento; aplicada nas decisões 1 (contrato mínimo do zero, cada campo com uso declarado, rejeições), 2 (vínculo sem snapshot), 7 (rotas aninhadas, erro único) e 8 (cap com trigger).
- **(b) `security-and-hardening` no planejamento:** carregada nesta sessão; threat model abaixo com rigor de PII herdada. Revisão do Verify continua obrigatória (docs/07 §7).
- **(c) Mutation:** tasks deste change incluem medição Stryker contra o módulo + `contracts/src/attendance/` (se a capability nasceu lá, mede-se lá), com score e triagem em `verification.md` (meta docs/07 §13).
- **(d) Adversarial:** tasks incluem teste com payload hostil real (resumos gigantes, injeção, unicode, `patientId` malformado/gigante, `limit` estourado) + sondas de bypass (histórico de anonimizada some; detalhe cruzado → 404; acesso direto sem passar pela visibilidade) — não só raciocínio.
- **(e) §14:** tasks incluem avaliação ao final — se o apply exigir emendas ou render padrões reutilizáveis, alimenta; senão, registra a dispensa com motivo.

### Threat model da fronteira (planejamento, skill `security-and-hardening`)

- **Fronteira:** `POST /patients/:patientId/attendances`, `GET /patients/:patientId/attendances[?limit]`, `GET /patients/:patientId/attendances/:id` — todas sob o guard honesto (403) até a Identidade, por desenho (decisão 6).
- **Ativos:** histórico operacional (resumos) + PII herdada via join (nome resolvido somente se visível).
- **Abuse cases:** (1) resumo gigante/malformado com injeção ou unicode → Zod na fronteira (422, teto 500); texto é dado opaco, nunca interpretado; queries parametrizadas do Prisma; (2) `patientId` malformado/gigante/com injeção → id opaco em lookup parametrizado, inexistente/anonimizada respondem o mesmo 404; (3) **bypass de visibilidade via join (vetor central)** — o filtro é na query (`patient: {status: "active"}` + porta `PatientDirectory` com o mesmo filtro); a prova é no HTTP (atendimento de anonimizada semeado, assert de ausência) — três camadas conceituais sem confiar uma na outra: FK impede órfão, filtro exclui, teste prova; (4) enumeração cruzada (adivinhar id de atendimento de outra paciente) → detalhe confere pertencimento, 404 idêntico; (5) over-collection/clínico → contrato sem campo clínico, teto de tamanho, sem notes/e-mail; dado clínico enviado é rejeitado ou ignorado (strip), nunca persistido como tal; (6) acesso não autenticado → bloqueado pelo guard honesto (403 explícito), mesmo risco residual e trigger da decisão 6 de Pacientes; (7) DoS por listagem → cap `limit` (decisão 8).
- **STRIDE resumido:** Spoofing sem identidade nesta fatia (guard nega tudo); Tampering sem escrita cruzada (UoW desnecessário, decisão 4); Repudiation fora de escopo (trilhas futuras, 03 §12); Information disclosure controlado por visibilidade na query + 404 idêntico + pertencimento no detalhe; DoS limitado pelo cap; Elevation bloqueado pelo guard até a Identidade (trigger).

### Prova de `findVisible` via join (dedicada — quita a dívida de Pacientes)

A invariante "histórico de anonimizada nunca é servido" é provada em três pontos, do mais barato ao mais caro: (1) **unitário**: `PatientDirectory` fake que retorna nulo para anonimizada → casos de uso respondem não-encontrado; (2) **integração do repositório**: atendimento semeado + paciente anonimizada no banco → `findVisible*` retorna vazio; (3) **HTTP dedicado (task explícita)**: semear atendimento de paciente ativa e simular join com anonimizada (anonimizar a paciente via repositório de Pacientes no setup do teste), asserir que `GET` lista só o da ativa e o detalhe da anonimizada responde 404 — **RED**: com o filtro de relação removido de propósito (write-then-throw), o histórico da anonimizada aparece na resposta e o teste reprova; **GREEN**: com `patient: {status: "active"}` o teste passa. A garantia é distinguível pela falha, não presumida — mesmo padrão das provas de consentimento e anonimização. Escopo da prova cobre listagem E detalhe (as duas superfícies que tocam o join).

## Risks / Trade-offs

- [Risco] Nome resolvido ao vivo (sem snapshot) acopla leitura ao join → Mitigação: join indexado por PK/FK, dataset por paciente pequeno; N+1 futuro vira change de performance com trigger, não antecipação.
- [Risco] Mover o guard quebra o módulo de Pacientes → Mitigação: só o import muda; a suíte de guard de Pacientes (6 provas 403 + 9 com bypass) roda verde como caracterização na task de migração.
- [Risco] Resumo livre recebe dado clínico apesar do contrato → Mitigação: teto + ausência de campo dedicado + revisão humana no Verify; campo clínico dedicado nasce com requisito explícito, nunca por acidente.
- [Trade-off] Sem update/delete agora → aceito com trigger explícito na decisão 5.
- [Trade-off] Quinto pool de conexão (cliente próprio) → aceito com trigger explícito na decisão 10.
- [Trade-off] Sem exportação do histórico nesta fatia → a estrutura (visibilidade + timestamps) deixa o endpoint trivial depois; registrado como trigger, não dívida oculta.

## Migration Plan

Sem migração de dados: tabela `Attendance` nova via migration versionada (com FK para `Patient`); rollback = reverter o merge. Nenhum dado existente é tocado. Ordem de `deleteMany` no `resetDatabase` respeita a FK (attendances antes de pacientes).

## Open Questions

Nenhuma bloqueante. Fluxo de correção (update), exportação do histórico, offset/busca, provider Prisma compartilhado e guard Keycloak/RBAC pertencem a changes futuros explícitos com triggers registrados.
