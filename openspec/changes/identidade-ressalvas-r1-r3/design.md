## Context

Ver `proposal.md` (Why). Ponto de partida: `backend/src/swagger.ts` registra 3 tags legadas sem uso (controllers usam tags limpas); o documento OpenAPI não declara `securitySchemes`; os 3 controllers administrativos já usam o guard real sem declarar `@ApiBearerAuth`.

## Goals / Non-Goals

**Goals:** documento OpenAPI fiel à autenticação real (401/403 por operação + bearer exigido), sem resíduos do bloqueio honesto.

**Non-Goals:** mudar comportamento de runtime, contratos ou rotas; tocar em outras specs.

## Decisions

### 1. Esquema bearer global + `@ApiBearerAuth()` nos 3 controllers

`.addBearerAuth()` no `DocumentBuilder` (nome padrão `bearer`: `{ type: "http", scheme: "bearer", bearerFormat: "JWT" }`) declara o esquema; `@ApiBearerAuth()` em Pacientes, Atendimento e Financeiro marca as 9 operações com `security: [{ bearer: [] }]`. Rationale: esquema global sem exigência por operação mente tanto quanto operação sem esquema — os dois lados são travados pelo mesmo teste. Alternativas consideradas: só `addBearerAuth` sem `@ApiBearerAuth` (rejeitada — operações sem `security` não exigem nada no papel); `security` global no documento (rejeitada — marcaria até rotas públicas como autenticadas).

### 2. Remoção direta das 3 tags legadas

As strings `"(bloqueado até a Identidade)"` não aparecem em nenhum teste nem controller — remoção sem RED (exceção docs/07 §4: sem comportamento observável; verificação por grep + suíte verde).

## Risks / Trade-offs

- [Risco] OpenAPI 3.x representa `security` por operação como array — o teste usa `toContainEqual`, tolerante a múltiplos esquemas futuros. Mitigação: asserção por inclusão, não igualdade estrita.
