## 0. Contrato — `contracts/src/attendance/` desenhado do zero (fonte da verdade)

- [x] 0.1 Escrever o teste do contrato (`AttendanceInput` aceita registro operacional válido e rejeita resumo vazio/gigante, data fora do ISO e campo clínico; `Attendance` exige id/patientId/timestamps e valida o formato) e verificar que falha porque os schemas não existem — RED. Verificação: `Cannot find module`
- [x] 0.2 Criar `contracts/src/attendance/attendance.ts` + `attendance.test.ts` + `index.ts` e reexportar no índice do pacote (tipos saem dos próprios schemas; sem tocar em contrato vigente) e verificar que o teste passa — GREEN. Verificação: teste da task 0.1 passa

## 1. Setup de persistência (test-first de wire-up)

- [x] 1.1 Executar `pnpm --filter backend test` filtrado ao novo módulo e constatar que falha (pacote `attendance/` inexistente) — RED. Verificação: filtro sem arquivos
- [x] 1.2 Criar `backend/prisma/schema.prisma` com o modelo `Attendance` (id UUID, `patientId` com FK para `Patient`, `summary`, `performedAt`, `createdAt`/`updatedAt`) + migration inicial + seed fictício (2 atendimentos vinculados às pacientes fictícias do seed) — GREEN parcial. Verificação: `prisma migrate deploy` aplica limpo no banco de teste e o seed popula sem erro

## 2. Domain — Attendance imutável + porta PatientDirectory (unitários puros)

- [x] 2.1 Escrever o teste da entidade (`create` com campos válidos e id gerado fora dela; resumo vazio/gigante e data fora do ISO rejeitados; sem método de update/delete na API da entidade; `restore` preserva e valida) e verificar que falha porque a entidade não existe — RED. Verificação: `Cannot find module`
- [x] 2.2 Criar `domain/entities/attendance.entity.ts` + erros locais (`InvalidAttendance`/`AttendanceNotFound` genérico, sem eco) e verificar que o teste passa — GREEN. Verificação: teste da task 2.1 passa
- [x] 2.3 Escrever o teste das portas (`AttendanceRepository.save`, `findVisibleByPatient`/`findVisibleById` excluindo histórico de anonimizada, `PatientDirectory.findVisiblePatient` retornando nulo para anonimizada — compilando contra fakes manuais) e verificar que falha — RED. Verificação: falha de compilação/tipo (precedente dos módulos anteriores)
- [x] 2.4 Criar `domain/ports/*.ts` (só interfaces + tipos, zero implementação; sem `UnitOfWork` — só escrita de entidade única, design decisão 4; sem importar o domínio de Pacientes) e verificar verde + auditoria de imports (`domain/` sem imports externos, inclusive sem `patients/`) — GREEN. Verificação: typecheck limpo e `grep` de imports externos e cruzados vazio

## 3. Application — casos de uso contra portas com fake em memória

- [ ] 3.1 Escrever o teste de registrar/listar/buscar (create com paciente visível retorna com id; paciente inexistente/anonimizada → não-encontrado idêntico sem criar nada; lista só da paciente consultada em ordem; detalhe encontra; detalhe cruzado → não-encontrado) com fakes e verificar que falha — RED. Verificação: `Cannot find module`
- [ ] 3.2 Implementar os casos de uso dependendo só das portas e verificar verde — GREEN. Verificação: testes da task 3.1 passam, sem importar `infrastructure/`
- [ ] 3.3 Escrever o teste adversarial com payload hostil real (resumo gigante, injeção, unicode, `patientId` malformado/gigante, `limit` acima do teto; sondas: histórico de anonimizada ausente em lista e detalhe; detalhe cruzado entre pacientes) e verificar o comportamento seguro — RED. Verificação: teste falha (módulo ausente ou hostil aceito)
- [ ] 3.4 Implementar o tratamento (validação na fronteira do núcleo + queries parametrizadas + limites; checagem de pertencimento no detalhe) e verificar verde — GREEN. Verificação: hostil rejeitado ou neutralizado sem erro interno vazado

## 4. Infrastructure — Prisma + Postgres real em container

- [ ] 4.1 Escrever o teste de integração dos repositórios (round-trip; `findVisibleByPatient` exclui histórico de anonimizada mesmo com os registros existindo; `findVisibleById` ignora inexistente/anonimizada e cruzado; ordenação determinística; FK impede órfão) e verificar que falha — RED. Verificação: falha de conexão/schema ausente ou módulo inexistente
- [ ] 4.2 Criar o modelo Prisma (com relação FK para `Patient`) + mappers manuais (Data Mapper, nunca Active Record; `PatientDirectory` implementada com o filtro `status: "active"` na query, sem importar domínio de Pacientes) e implementar os repositórios — GREEN. Verificação: testes passam contra Postgres real em container, banco de teste isolado; `resetDatabase` com `attendance.deleteMany()` antes de `patient.deleteMany()` (ordem da FK)

## 5. Presentation — controller aninhado com guard honesto

- [ ] 5.1 Escrever o teste de contrato da Presentation (`POST /patients/:patientId/attendances` 201; `GET` lista com `limit` válido e acima do teto → 422; `GET` detalhe encontra e cruzado/inexistente/anonimizado → 404 idêntico; corpos validados), executando com bypass do guard (`overrideGuard`, simulando a Identidade futura) e verificar que falha — RED. Verificação: 404 de rota ou `Cannot find module`
- [ ] 5.2 Criar controller (rotas aninhadas, `@UseGuards(IdentityPendingGuard)` importado do kernel em todas as rotas, sem exceção) + `AttendanceModule` (mesmo padrão de wiring: providers por tokens, cliente próprio, pipe/filtro/erros locais, guard nos providers, sem `UnitOfWork`) e verificar verde de ponta a ponta com bypass — GREEN. Verificação: testes passam contra o app com banco de teste
- [ ] 5.3 Escrever o teste do guard honesto (sem bypass, cada uma das 3 rotas responde 403 com `AUTH_NOT_IMPLEMENTED`) e verificar que falha enquanto o guard não protege — RED: sem o guard aplicado, as rotas respondem normalmente. Verificação: o teste falha porque a rota está acessível (200/201/404 em vez de 403)
- [ ] 5.4 Confirmar o guard importado do kernel (sem duplicar a classe no módulo) e verificar verde — GREEN: rotas bloqueadas por padrão, e os testes de rotas com bypass continuam verdes. Verificação: teste da task 5.3 passa; nenhum teste anterior quebra; `grep` confirma uma única definição de `IdentityPendingGuard` (no kernel)
- [ ] 5.5 Escrever o teste de saída conforme o contrato (corpos validados contra os schemas nas duas pontas, 07 §13, com bypass do guard) e verificar que falha antes do ajuste — RED. Verificação: divergência reprova
- [ ] 5.6 Ajustar o formato de saída até zerar a divergência (allowlist explícita, sem nome de paciente persistido — resolvido na leitura só se visível; tipo de retorno = tipos do próprio `@newestetica/contracts`) — GREEN. Verificação: teste passa; nenhuma divergência nova
- [ ] 5.7 Prova de não-vazamento via join (dedicada e explícita — quita a dívida de Pacientes): semear atendimento de paciente ativa e simular join com anonimizada (anonimizar a paciente no setup do teste) e asserir que nenhuma leitura contém o histórico da anonimizada — RED: o histórico aparece hoje (join ingênuo por `patientId`); GREEN: o filtro de visibilidade (`patient: {status: "active"}`) bloqueia e o teste passa. Verificação: o teste distingue as duas situações (falha sem o filtro, passa com ele) — garantia provada pela falha, não presumida; cobre listagem E detalhe

## 6. Mutation, segurança, registros e backlog

- [ ] 6.1 Rodar Stryker contra o módulo (`pnpm --filter backend mutation`, banco de teste no ar; estender o escopo `mutate` para `src/attendance/**`) e contra `contracts/src/attendance/`, e registrar score real + triagem de sobreviventes em `verification.md` — GREEN. Verificação: relatório completo no registro (meta docs/07 §13)
- [ ] 6.2 Revisar segurança com `security-and-hardening` contra `docs/security/03-seguranca.md` (gatilhos: entrada de usuário, **PII herdada via join**, ausência de auth com guard honesto, enumeração cruzada, DoS de listagem) e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada, com os abuse cases do threat model um a um
- [ ] 6.3 Revisar com `code-review-and-quality` e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada
- [ ] 6.4 Atualizar `docs/product/08-backlog-produto.md` (UC 4.2.5 → Em andamento) e avaliar `c2/c3-component.md` — exceção docs/07 §4 (verificação por releitura). Verificação: releitura confirma os status
- [ ] 6.5 Avaliar a complexidade da sessão (emendas? padrões reutilizáveis?) e alimentar a seção 14 de docs/07 ou registrar a dispensa com motivo — exceção docs/07 §4. Verificação: seção 14 atualizada ou dispensa justificada em `verification.md`
