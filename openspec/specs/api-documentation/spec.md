# api-documentation Specification

## Purpose

Dar a desenvolvedores e IAs uma referência navegável e sempre fiel da API do backend (rotas, formatos e erros), servida pelo próprio NestJS em `/docs` e `/docs-json`, sem duplicar os contratos Zod que continuam sendo a fonte da verdade.

## Requirements

### Requirement: Swagger UI e schema OpenAPI servidos pelo backend

A API SHALL expor a interface Swagger UI em `GET /docs` (HTML 200, fora de produção) e o schema OpenAPI em `GET /docs-json` (JSON 200 com `openapi` 3.x válido), ambos gerados a partir das rotas e dos contratos vigentes.

#### Scenario: UI acessível em desenvolvimento

- **WHEN** um `GET /docs` é feito com o backend rodando fora de produção
- **THEN** a resposta é 200 com HTML da interface Swagger

#### Scenario: Schema JSON válido

- **WHEN** um `GET /docs-json` é feito com o backend rodando fora de produção
- **THEN** a resposta é 200 com documento OpenAPI 3.x parseável

### Requirement: Cobertura total das rotas implementadas

O schema SHALL conter as 14 rotas implementadas: `GET /health`, `GET /slots/available`, `POST /slots/:slotId/bookings`, `GET /procedures`, `GET /procedures/:slug`, `GET /testimonials`, `GET /posts`, `GET /posts/:slug`, `GET /before-after`, `POST /patients`, `GET /patients`, `GET /patients/:id`, `PATCH /patients/:id` e `DELETE /patients/:id`, cada uma com operação, parâmetros, corpo e respostas documentados.

#### Scenario: Nenhuma rota sem documentação

- **WHEN** os paths do schema gerado são auditados contra as rotas registradas no NestJS
- **THEN** cada rota existente aparece documentada e nenhuma rota inexistente aparece

### Requirement: Schema fiel aos contratos Zod vigentes

Os componentes do schema SHALL derivar dos schemas Zod de `contracts/` sem duplicação manual de campos; divergência entre o schema gerado e o contrato reprova.

#### Scenario: Amostra dos contratos valida contra o schema gerado

- **WHEN** fixtures válidas de cada contexto são validadas contra os componentes correspondentes do schema gerado
- **THEN** todas aprovam, e campos dos contratos aparecem sem omissão nem acréscimo

### Requirement: Docs desabilitadas em produção por padrão

Em produção (`NODE_ENV=production`) sem `SWAGGER_ENABLED=true`, `GET /docs` e `GET /docs-json` SHALL responder 404; fora de produção, SHALL responder conforme os cenários acima.

#### Scenario: Produção sem flag esconde a documentação

- **WHEN** o backend sobe com `NODE_ENV=production` e sem `SWAGGER_ENABLED`
- **THEN** `GET /docs` e `GET /docs-json` respondem 404

#### Scenario: Flag explícita reabilita em produção

- **WHEN** o backend sobe com `NODE_ENV=production` e `SWAGGER_ENABLED=true`
- **THEN** `GET /docs` e `GET /docs-json` respondem conforme os cenários de desenvolvimento

### Requirement: Autenticação real documentada (401/403 + bearer)

As 9 rotas administrativas (Pacientes, Atendimento e Financeiro) SHALL documentar as respostas 401 com código `AUTH_UNAUTHENTICATED` e 403 com código `AUTH_FORBIDDEN`, ambas com descrições fixas; o documento SHALL declarar um esquema de segurança bearer global e cada rota administrativa SHALL exigi-lo; a documentação SHALL NOT referenciar `IdentityPendingGuard`, `AUTH_NOT_IMPLEMENTED` ou bloqueio honesto.

#### Scenario: 401 e 403 fixos nas rotas administrativas

- **WHEN** as operações de `/patients`, `/patients/{patientId}/attendances` e `/finance/summary` são lidas no schema gerado
- **THEN** cada uma lista a resposta 401 com o código `AUTH_UNAUTHENTICATED` e a resposta 403 com o código `AUTH_FORBIDDEN`

#### Scenario: Esquema bearer declarado e exigido

- **WHEN** os `securitySchemes` do documento e a chave `security` das 9 operações são lidos no schema gerado
- **THEN** existe um esquema bearer e cada operação administrativa o exige
