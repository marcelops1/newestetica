# Change: identidade-ressalvas-r1-r3

## Why

A revisão final do PR #49 (veredito: APROVADO COM RESSALVAS) encontrou três resíduos de documentação da era do bloqueio honesto: a spec `api-documentation` ainda exige 403 `AUTH_NOT_IMPLEMENTED` nas rotas de Pacientes (falso contra a implementação, que documenta 401/403 reais), o `swagger.ts` ainda registra 3 tags legadas sem uso, e o documento OpenAPI não declara o esquema de segurança bearer. Sem a correção, specs e docs mentem sobre a API real.

## What Changes

- R1: delta explícito em `api-documentation` substituindo o requirement "Bloqueio de Pacientes explícito na documentação" por 401/403 reais de autenticação (sem perder cenários).
- R2: remoção dos 3 `.addTag("... (bloqueado até a Identidade)")` sem uso em `backend/src/swagger.ts`.
- R3: esquema de segurança bearer global no Swagger (`addBearerAuth`) + teste em `openapi.int.spec.ts` afirmando que o componente existe e que as 9 rotas administrativas o exigem (RED antes, GREEN depois).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `api-documentation`: requirement de bloqueio honesto substituído pela documentação da autenticação real (401/403 fixos + esquema bearer).

## Impact

- `openspec/specs/api-documentation/spec.md` (via sync do delta, no archive).
- `backend/src/swagger.ts` (3 tags removidas, 1 esquema adicionado).
- `backend/test/integration/openapi.int.spec.ts` (1 teste novo para o esquema bearer).
- Sem impacto em comportamento de runtime, contratos ou outras specs.
