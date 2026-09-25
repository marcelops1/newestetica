# Change: backend-modulo-pacientes

## Why

O painel admin (Épico 2) precisa de fonte real para o cadastro de pacientes (UC 4.2.4, hoje "Não iniciado"), seguindo o caminho dos módulos anteriores: contrato primeiro, depois o módulo NestJS em Clean Architecture com TDD por camada. É o dado mais sensível tratado até agora (nome + contato identificáveis, LGPD), e o UC exige direitos do titular preparáveis sem retrabalho estrutural — por isso a estrutura (status, anonimização, timestamps, finalidade registrada) nasce nesta fatia, não depois.

## What Changes

- Novo contexto de contrato em `contracts/src/patients/` (schemas Zod + testes + índice, reexportado no índice do pacote): `PatientInput` (criação), `PatientUpdate` (parcial), `Patient` (saída com id, timestamps e status) e `PatientStatus` (`active`/`anonymized`) — sem nenhum campo de saúde, sem campo livre de observações, sem e-mail.
- Novo módulo `backend/src/patients/` (mesmo padrão dos anteriores, agora sobre `backend/src/shared/`): entidade `Patient` (com `anonymize()`), porta só da entidade única (sem `UnitOfWork`), repositórios Prisma + mappers, controller com `POST /patients` (201), `GET /patients` (lista só de ativos, com `limit`), `GET /patients/:id`, `PATCH /patients/:id` e `DELETE /patients/:id` (anonimização + 204); pipe/filtro/erros locais do módulo.
- Modelos Prisma + migration + seed fictício (3 pacientes claramente fictícios) + `prisma db seed`.
- Saída validada contra os schemas novos nas duas pontas; contrato intocado depois de criado (fonte da verdade).
- Wiring no `AppModule`; escopo do Stryker estendido a `src/patients/**` e `contracts/src/patients/**`.
- Autorização real (Keycloak/RBAC) explicitamente **fora** desta fatia: rotas sob guard honesto de bloqueio (403) até a Identidade, com trigger de substituição no módulo de Identidade (decisão no design).
- Explicitamente fora: campo livre de observações, e-mail, telefone único/deduplicação, fotos/binários, paginação completa com offset, idempotency-key no POST, criptografia em repouso, trilhas de auditoria, migração do frontend.

## Capabilities

### New Capabilities

- `backend-patients`: cadastro básico de pacientes (create, read, update, anonimização via delete) no formato do contrato novo, com PII mínima, finalidade registrada e anonimizados excluídos de qualquer leitura.

### Modified Capabilities

- `api-contracts`: o requirement "Escopo limitado aos contextos com equivalente mockado" passa a admitir o contrato de Pacientes (sem equivalente mockado — validado contra fixtures + regras de domínio em vez de mocks), e novos requirements definem os formatos `PatientInput`/`PatientUpdate`/`Patient`/`PatientStatus`.

## Impact

- `contracts/src/patients/` (novo), `contracts/src/index.ts` (reexport), `contracts/stryker.config.mjs` (escopo), `backend/src/patients/` (novo), `backend/prisma/` (modelo `Patient` + migration + seed), `backend/src/app.module.ts` (wiring), `backend/stryker.config.mjs` (escopo), `docs/product/08-backlog-produto.md` (UC 4.2.4 → Em andamento), `docs/architecture/c2-container.md`/`c3-component.md` (quarto módulo), linha de Purpose de `openspec/specs/api-contracts/spec.md` ("e Pacientes").
- Sem impacto em frontend, mocks, contratos vigentes ou specs além das citadas. Nenhum dado real em nenhum artefato.
