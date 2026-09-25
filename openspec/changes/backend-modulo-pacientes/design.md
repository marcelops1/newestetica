## Context

Ver `proposal.md` (Why). Ponto de partida verificado: `backend/src/scheduling/` é o padrão de referência para escrita (casos de uso com portas, `UnitOfWork` só onde há escrita multi-entidade, `SchedulingModule` com providers por tokens e cliente próprio, vitest `unit`+`integration`, Stryker via command runner); `contracts/src/scheduling/booking.ts` é o precedente de regras de PII (`name` min 2/max 120, `phone` com mínimo de 10 dígitos); `z.iso.datetime({ offset: true })` é a convenção de datetime vigente (`contracts/src/scheduling/slot.ts`); `backend/src/shared/` (kernel da decisão 04 §22) fornece pipe, base de filtro, base de erro e factory de cliente. UC 4.2.4 exige "coleta mínima e finalidade informada" com "direitos do titular preparáveis sem retrabalho estrutural"; `docs/security/03-seguranca.md` §4 (minimização, finalidade, sem dado sensível de saúde, direitos preparáveis) e §10.4 (nunca liberar admin sem autenticação). Ordem TDD por camada em docs/07 §15.

## Goals / Non-Goals

**Goals:**

- CRUD funcional de pacientes (create/read/update + anonimização via delete) no formato de um contrato novo desenhado do zero, com a estrutura dos direitos do titular já operante (não só "preparada no papel").
- Minimização real: 3 campos de entrada + finalidade; nenhum campo que convide dado sensível de saúde.

**Non-Goals:**

- Autorização real (Keycloak/RBAC) — diferida com trigger, risco e restrição de exposição (decisão 8).
- Campo livre de observações, e-mail, telefone único/deduplicação, fotos/binários, offset/busca textual, idempotency-key, criptografia em repouso, trilhas de auditoria, migração do frontend, unificação de providers Prisma.

## Decisions

### 1. Contrato mínimo desenhado do zero (skill `api-and-interface-design`)

`PatientInput` (create): `fullName` (trim, min 2, max 120 — mesma régua do booking, precedente validado), `phone` (max 20 + mínimo de 10 dígitos, mesma regra `hasDddDigits`), `purpose` (string não-vazia, max 200 — a finalidade informada, registrada por registro). `PatientUpdate`: subconjunto opcional dos três (sem status, sem id, sem timestamps). `Patient` (saída): `id` UUID gerado pelo servidor + os três campos + `status` (`active`/`anonymized`) + `createdAt`/`updatedAt` em `z.iso.datetime()`. Rationale: cada campo tem uso declarado (nome = identificação no atendimento; telefone = confirmação operacional via WhatsApp; finalidade = aceite do UC + LGPD). Alternativas consideradas: incluir e-mail (rejeitada — sem uso declarado nesta fatia; "pode ser útil" é escopo latente de breach, não finalidade); campo livre `notes` (rejeitada — texto livre convida dado clínico sensível, violando 03 §4 e §10.3; o booking já tem notes para o agendamento, o cadastro não precisa); `birthDate` (rejeitada — personalização 40+ é uso futuro, não mínimo; nasce em change próprio se a Fabiana pedir); `consentGiven` booleano no cadastro (rejeitado — consentimento de fotos é por foto, escopo futuro; finalidade registrada cumpre o UC).

### 2. Anonimização nesta fatia (não só estrutura)

`DELETE /patients/:id` anonimiza em vez de apagar: PII vira placeholders fixos, `status` → `anonymized`, `anonymizedAt` registrado (só banco/entidade, fora do contrato de saída), resposta 204 sem corpo. Anonimizados saem de todas as leituras (porta `findVisible*`, nome carrega a regra — precedente `findActive`/`findConsented`) e detalhe/delete repetido respondem o mesmo 404 genérico. Rationale: o aceite do UC é "preparáveis sem retrabalho" — estrutura sem prova é presunção (lição dos módulos anteriores: garantia se prova pela falha); o custo marginal (1 caso de uso + 1 rota + testes) compra a prova real de apagabilidade e a base de `status`/`anonymizedAt` que acesso/correção reutilizam depois. Alternativa considerada: adiar o endpoint com trigger (rejeitada — deixaria a estrutura sem prova e o teste de exclusão sem alvo).

### 3. Sem `UnitOfWork` neste módulo

Rationale: só há escritas de entidade única (create/update/anonymize tocam um `Patient`) — não existe operação multi-entidade para atomizar (mesmo YAGNI do Catálogo/Conteúdo, agora para escrita). Alternativa considerada: reutilizar por simetria com o scheduling (rejeitada — o scheduling atomiza Slot+Booking; aqui não há segundo agregado).

### 4. Identificadores opacos, sem unicidade de telefone

`id` UUID v4 gerado no servidor (`randomUUID`, precedente do Booking); rotas validam `min(1).max(200)` sem checar formato (opaco por desenho — mesmo padrão dos slugs; inexistente/anonimizado → mesmo 404). Sem constraint única em telefone: duplicados operacionais (familiares dividindo número) são reais e merge/dedupe nasce com pedido da Fabiana (trigger registrado). Rationale: unicidade criaria um oráculo 409 enumerável sem necessidade medida.

### 5. Listagem com `limit` desde já (desvio consciente do padrão sem-paginação)

`GET /patients` aceita `limit` opcional (padrão 100, máximo 500; acima → 422); ordem determinística `name asc, id asc`; sem offset/busca nesta fatia (trigger: recepção pedindo localização). Rationale: diferente dos catálogos curados, a base de pacientes cresce sem teto — resposta ilimitada de PII é vetor de DoS/exposição real, não hipotético (skill `api-and-interface-design`: paginar desde o início; aqui a forma mínima honesta é o cap). Alternativas consideradas: sem parâmetro com trigger (rejeitada — o trigger chegaria tarde demais, com a base já grande); paginação completa com offset (rejeitada — complexidade antecipada sem caso de uso).

### 6. Saída = contrato, padrão Catálogo (sem parse em runtime)

Allowlist explícita no controller com tipos do próprio `@newestetica/contracts`; validação nas duas pontas via testes (docs/07 §13). Sem `PublicPatientListSchema.parse` em runtime: não há literal a impor (diferente do `hasConsent: literal(true)`), então o parse seria teatro — a garantia de exclusão vive na porta + testes de ausência, como no Catálogo. Alternativa considerada: parse runtime por simetria com Conteúdo (rejeitada — sem invariante literal, é custo sem prova).

### 7. Superfície HTTP mínima (skill `api-and-interface-design`)

`POST /patients` (201), `GET /patients`, `GET /patients/:id`, `PATCH /patients/:id`, `DELETE /patients/:id` (204); substantivos no plural, sem verbos; erros de domínio no formato `{code, message}` com `INVALID_PATIENT`/`PATIENT_NOT_FOUND` (mensagem genérica feminina "Paciente não encontrada.", sem ecoar PII — ecoar id existiu no scheduling e foi corrigido nos módulos seguintes). Zod padrão (strip) como nos demais contratos — consistência vence rigidez local. Alternativa considerada: `PUT` total (rejeitada — PATCH parcial é o que o painel precisa; skill).

### 8. Guard honesto de bloqueio até a Identidade (nega tudo, não finge nada)

Todas as rotas do controller de Pacientes nascem sob um guard NestJS real — `IdentityPendingGuard`, em `backend/src/patients/presentation/guards/` — aplicado via `@UseGuards` no controller (todas as rotas, sem exceção) e registrado nos providers do `PatientsModule` (escopo do módulo, nunca global). O guard nega TODA requisição com 403 e corpo `{code: "AUTH_NOT_IMPLEMENTED", message: "Autenticação ainda não implementada para este módulo — aguardando Identidade e Acesso (UC 4.2.1)"}` (via `ForbiddenException` com objeto, que preserva o formato `{code, message}` do repo; 403 e não 401, porque 401 prometeria um desafio de autenticação que não existe). Nota sobre a referência: cita-se o UC 4.2.1, não o épico — no backlog, Épico 4 é "Backend e Contratos" e Épico 3 é "Autenticação e Acesso"; UC 4.2.1 é a referência inequívoca.

Rationale: a decisão anterior (risco só em texto, sem mecanismo) deixava a proteção refém do deploy — "o backend não está exposto" não protege contra exposição por engano ou num change de deploy futuro. Este guard não simula autenticação (diferente do placeholder com token falso, que continua rejeitado): ele declara a verdade e bloqueia. E diferente do fail-closed genérico antes rejeitado, a testabilidade está preservada: `overrideGuard()` do `TestingModule` remove o guard nos testes (simulando a Identidade futura), então Application/Domain seguem testáveis sem o guard e a integração prova os dois estados — bloqueado por padrão, funcional com bypass. Quando a Identidade chegar, este guard é SUBSTITUÍDO pelo guard real de Keycloak/RBAC: a troca é próximo passo obrigatório e explícito (requirement + trigger abaixo), não implícito. Alternativas consideradas: risco só em texto (rejeitada — era a decisão anterior; sem mecanismo, a "restrição de exposição" não é verificável por teste nenhum); guard placeholder com token/env falso (rejeitada — segurança de mentira + código descartável; mantida a rejeição); fail-closed sem override (rejeitada — mataria a testabilidade; o override resolve sem enfraquecer o bloqueio em produção); travar tudo até a Identidade (rejeitada — atrasa o Épico 2; o módulo segue funcionalmente completo e testado atrás do bloqueio honesto).

### 9. POST documentado como inseguro para retry (sem idempotency-key)

Sem chave natural (telefone não é único por decisão 4), idempotência exigiria coluna de chave de cliente + constraint — desproporcional para API admin operada pela recepção. Documentado como inseguro para retry + trigger (chave de idempotência nasce com o painel admin). Alternativa considerada: implementar já (rejeitada — custo sem caso de uso).

### 10. Cliente Prisma próprio, unificação adiada de novo

Mesmo padrão dos 3 módulos (factory compartilhada, instância própria). O trigger da decisão 8 ("provider compartilhado vira change próprio no 4º módulo") chegou — e a decisão consciente é **não** contrabandear a unificação neste change (tocaria 3 módulos verdes por pressão ainda não observada); a unificação continua candidata a change próprio. Alternativa considerada: unificar já (rejeitada — blast radius sem necessidade medida; o trigger pedia change próprio, não carona).

### 11. Seed fictício mínimo + dados de teste

3 pacientes 100% fictícios (nomes + telefones com prefixo 5555, "Paciente ilustrativa" no rastro), só ativos; testes inserem direto via repositório. Nenhum dado real em nenhum artefato (03 §4/§11).

## Checklist §16 (obrigatório para este change, que cria módulo novo)

- **(a) `api-and-interface-design` citada:** carregada nesta sessão de planejamento; aplicada nas decisões 1 (contrato mínimo do zero, cada campo com uso declarado, rejeições), 5 (cap com trigger), 7 (forma dos endpoints, PATCH, erro único) e 9 (idempotência documentada).
- **(b) `security-and-hardening` no planejamento:** carregada nesta sessão; threat model abaixo. Revisão do Verify continua obrigatória (docs/07 §7).
- **(c) Mutation:** tasks deste change incluem medição Stryker contra o módulo + `contracts/src/patients/` (se a capability nasceu lá, mede-se lá), com score e triagem em `verification.md` (meta docs/07 §13).
- **(d) Adversarial:** tasks incluem teste com payload hostil real (nomes/telefones gigantes, injeção, unicode, `limit` estourado) + sondas de bypass (anonimizado some das leituras; double-delete → 404; `status` via PATCH neutralizado) — não só raciocínio.
- **(e) §14:** tasks incluem avaliação ao final — se o apply exigir emendas ou render padrões reutilizáveis, alimenta; senão, registra a dispensa com motivo.

### Threat model da fronteira (planejamento, skill `security-and-hardening`)

- **Fronteira:** `POST /patients`, `GET /patients[?limit]`, `GET /patients/:id`, `PATCH /patients/:id`, `DELETE /patients/:id` — todas sob o guard honesto de bloqueio (403) nesta fatia, por desenho (decisão 8).
- **Ativos:** PII de pacientes (nome, telefone); integridade da anonimização (anonimizado nunca servido).
- **Abuse cases:** (1) injeção/malformado em nome/telefone/id/`limit` → Zod na fronteira (422), id opaco em `findUnique` parametrizado, `limit` com teto; (2) enumeração de pacientes → 404 idêntico para inexistente/anonimizado, sem 409-oráculo (decisão 4), mensagens sem eco de PII; (3) acesso direto a anonimizado → sem rota de detalhe que o sirva; excluído da lista e do detalhe (prova HTTP com write-then-throw: sem o filtro, o anonimizado aparece e o teste reprova); (4) over-collection → 3 campos + finalidade, sem notes/e-mail/saúde (decisão 1); (5) PII em logs/erros → nenhum log de payload no módulo; filtro devolve só `code` + `message`; (6) acesso não autenticado à PII → bloqueado pelo guard honesto (403 com código e mensagem explícitos, sem expor dado); risco residual: nenhum enforcement real até a Identidade, com trigger explícito de substituição (decisão 8); (7) DoS por listagem ilimitada → cap `limit` (decisão 5); dataset administrativo sem paginação completa por decisão 5.
- **STRIDE resumido:** Spoofing sem identidade, com bloqueio total pelo guard até a Identidade (risco 6 residual); Tampering sem escrita cruzada (UoW desnecessário, decisão 3); Repudiation fora de escopo (trilhas futuras, 03 §12); Information disclosure controlado por allowlist + 404 idêntico + exclusão de anonimizados; DoS limitado pelo cap; Elevation bloqueado pelo guard até a Identidade, com RBAC real no trigger.

## Risks / Trade-offs

- [Risco] Rotas de PII com bloqueio honesto mas sem auth real até a Identidade → Mitigação: guard nega tudo por padrão (verificável em teste) + trigger explícito de substituição pelo guard Keycloak/RBAC + spec honesta (nada de guarda falso).
- [Risco] Telefone duplicado sem constraint → Mitigação: decisão consciente (oráculo 409 evitado); merge/dedupe vira change com pedido da Fabiana.
- [Risco] Anonimização irreversível sem confirmação → Mitigação: semântica documentada (placeholders + status); confirmação é UX do painel futuro, fora desta API.
- [Trade-off] `limit` sem offset agora → aceito com trigger explícito na decisão 5.
- [Trade-off] Quarto pool de conexão (cliente próprio) → aceito com trigger explícito na decisão 10.
- [Trade-off] Sem exportação (acesso do titular) nesta fatia → a estrutura (status, timestamps, finalidade, `findVisible`) deixa o endpoint de exportação trivial depois; registrado como trigger, não dívida oculta.

## Migration Plan

Sem migração: tabela `Patient` nova via migration versionada; rollback = reverter o merge. Nenhum dado existente é tocado (só há seeds fictícios dos outros módulos).

## Open Questions

Nenhuma bloqueante. Exportação de dados do titular, guarda Keycloak/RBAC, offset/busca, idempotency-key e provider Prisma compartilhado pertencem a changes futuros explícitos com triggers registrados.
