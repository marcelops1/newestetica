# Change: backend-modulo-atendimento

## Why

O histórico de atendimentos (UC 4.2.5, hoje "Não iniciado") ainda vive só como ideia: sem fonte real, o Épico 2 não tem como exibir o que foi realizado por paciente. É também o primeiro módulo que lê outro contexto — e a dívida registrada no change de Pacientes exige que o histórico de paciente anonimizada nunca vaze via join, o que precisa ser desenhado e provado agora, não depois.

## What Changes

- Novo contexto de contrato em `contracts/src/attendance/` (schemas Zod + testes + índice, reexportado no índice do pacote): `AttendanceInput` (criação vinculada a paciente visível), `Attendance` (saída com id, patientId, resumo operacional, data de realização e timestamps) — sem campo clínico, sem prontuário, sem PII além do vínculo.
- Novo módulo `backend/src/attendance/` (mesmo padrão dos anteriores, sobre `backend/src/shared/`): entidade `Attendance` (imutável: sem update/delete), porta `AttendanceRepository` + porta `PatientDirectory` (contrato explícito de leitura do outro contexto, com visibilidade), repositórios Prisma + mappers, controller com `POST /patients/:patientId/attendances`, `GET /patients/:patientId/attendances` e `GET /patients/:patientId/attendances/:id` — todas sob o mesmo `IdentityPendingGuard` honesto (movido para o kernel, decisão no design).
- Modelo Prisma `Attendance` + migration + seed fictício (2 registros vinculados a pacientes fictícias do seed) + `prisma db seed`.
- Saída validada contra os schemas novos nas duas pontas; contrato intocado depois de criado.
- Wiring no `AppModule`; escopo do Stryker estendido a `src/attendance/**` e `contracts/src/attendance/**`.
- Autorização real (Keycloak/RBAC) explicitamente **fora** desta fatia (mesma decisão do módulo de Pacientes: bloqueio honesto até a Identidade, sem guarda falso).
- Explicitamente fora: update/delete de atendimento (histórico é imutável — correção via novo registro, com trigger se a Fabiana pedir fluxo de correção), exportação, paginação completa com offset (mesmo `limit` com teto dos módulos anteriores), fotos/anexos, dados clínicos, migração do frontend.

## Capabilities

### New Capabilities

- `backend-attendance`: registro e leitura do histórico simples de atendimentos por paciente, com visibilidade herdada do paciente (anonimizada nunca aparece) e histórico imutável.

### Modified Capabilities

- `api-contracts`: o requirement de escopo passa a admitir Atendimento/Histórico (contrato sem mock equivalente — validado contra fixtures + regras de domínio, mesmo precedente de Pacientes); novos requirements definem os formatos `AttendanceInput`/`Attendance`.

## Impact

- `contracts/src/attendance/` (novo), `contracts/src/index.ts` (reexport), `contracts/stryker.config.mjs` (escopo), `backend/src/attendance/` (novo), `backend/src/shared/http/identity-pending.guard.*` (guard movido do módulo de Pacientes + spec ajustada), `backend/prisma/` (modelo `Attendance` + migration + seed), `backend/src/app.module.ts` (wiring), `backend/stryker.config.mjs` (escopo), `docs/product/08-backlog-produto.md` (UC 4.2.5 → Em andamento), `docs/architecture/c2-container.md`/`c3-component.md` (quinto módulo), linha de Purpose de `openspec/specs/api-contracts/spec.md` ("e Atendimento/Histórico").
- Sem impacto em frontend, mocks, contratos vigentes, specs além das citadas ou comportamento dos 4 módulos existentes (o módulo de Pacientes só tem seu import do guard redirecionado — coberto pela suíte).
