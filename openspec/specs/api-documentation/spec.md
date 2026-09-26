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

### Requirement: Bloqueio de Pacientes explícito na documentação

As 5 rotas de Pacientes SHALL documentar a resposta 403 com código `AUTH_NOT_IMPLEMENTED` e descrição apontando o `IdentityPendingGuard` e o UC 4.2.1; a documentação SHALL NOT sugerir que essas rotas estejam acessíveis sem autenticação.

#### Scenario: 403 documentado nas rotas de Pacientes

- **WHEN** as operações de `/patients` são lidas no schema gerado
- **THEN** cada uma lista a resposta 403 com o código e a descrição do bloqueio honesto

### Requirement: Docs desabilitadas em produção por padrão

Em produção (`NODE_ENV=production`) sem `SWAGGER_ENABLED=true`, `GET /docs` e `GET /docs-json` SHALL responder 404; fora de produção, SHALL responder conforme os cenários acima.

#### Scenario: Produção sem flag esconde a documentação

- **WHEN** o backend sobe com `NODE_ENV=production` e sem `SWAGGER_ENABLED`
- **THEN** `GET /docs` e `GET /docs-json` respondem 404

#### Scenario: Flag explícita reabilita em produção

- **WHEN** o backend sobe com `NODE_ENV=production` e `SWAGGER_ENABLED=true`
- **THEN** `GET /docs` e `GET /docs-json` respondem conforme os cenários de desenvolvimento
