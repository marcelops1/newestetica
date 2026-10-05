# backend-finance Specification

## Purpose

Dá à Fabiana (via API) o resumo financeiro essencial por janela: total recebido e contagem de atendimentos com valor, agregados somente sobre atendimentos de pacientes visíveis — sem PII, sem breakdown, sem fiscal/contábil.

## Requirements

### Requirement: Resumo financeiro agregado por janela

A API SHALL expor a leitura agregada do resumo financeiro em `GET /finance/summary` com janela `from`/`to` obrigatória (span máximo de 366 dias); a resposta SHALL conter a janela consultada, `currency: "BRL"`, `totalCents` (soma dos valores em centavos) e `count` (atendimentos com valor no período); janela ausente, malformada, invertida ou acima do teto SHALL responder erro de validação estruturado.

#### Scenario: Janela com atendimentos valorados retorna o agregado

- **WHEN** o resumo é consultado para uma janela contendo atendimentos com valor de pacientes visíveis
- **THEN** a resposta contém `currency: "BRL"`, o `totalCents` igual à soma dos valores e o `count` igual ao número de atendimentos com valor, sem nenhum dado de paciente

#### Scenario: Janela vazia retorna zeros

- **WHEN** o resumo é consultado para uma janela sem atendimentos com valor de pacientes visíveis
- **THEN** a resposta contém `totalCents: 0` e `count: 0`, sem erro

#### Scenario: Janela acima do teto responde 422

- **WHEN** o resumo é consultado com span acima de 366 dias
- **THEN** a resposta é 422 com código de validação

### Requirement: Agregado só de pacientes visíveis

O agregado SHALL considerar somente atendimentos cuja paciente esteja visível; atendimentos de paciente anonimizada SHALL nunca compor total nem contagem, mesmo com os registros e valores existindo na base.

#### Scenario: Anonimizada não compõe o agregado

- **WHEN** o resumo é consultado para janela contendo atendimentos com valor de paciente ativa e de paciente anonimizada
- **THEN** o total e a contagem refletem exatamente os atendimentos da paciente ativa

### Requirement: Resumo sem PII e sem breakdown

A resposta do resumo SHALL NOT conter nome, contato, identificador de paciente nem qualquer decomposição por paciente; divergência entre implementação e os schemas de `contracts/src/finance/` reprova.

#### Scenario: Auditoria de superfície do resumo

- **WHEN** a resposta do resumo é inspecionada e validada contra o contrato
- **THEN** nenhum campo fora de janela, moeda, total e contagem está presente, e a validação aprova

### Requirement: Autenticação real via Keycloak

A rota de Financeiro SHALL exigir autenticação real via Keycloak (guard real no kernel compartilhado, via `@UseGuards` no controller, sem exceção): requisição sem token válido SHALL responder 401; token válido sem papel autorizado SHALL responder 403 com código e mensagem fixos, sem expor dado algum nem distinguir existência de recursos; com token válido e papel autorizado, a rota SHALL funcionar conforme seu contrato — as suítes existentes servem como caracterização, provando zero regressão de negócio (o contraste "sem token = 401/403" vs "token válido com papel = acesso" substitui o `overrideGuard` anterior).

#### Scenario: Requisição com o guard ativo é bloqueada com 403 explícito

- **WHEN** a rota de Financeiro é chamada sem token válido, com o guard real ativo (o 403 `AUTH_NOT_IMPLEMENTED` do bloqueio honesto foi substituído por 401/403 reais neste change)
- **THEN** a resposta é 401, idêntica em todos os casos, sem corpo de dados

#### Scenario: Token válido sem papel autorizado responde 403 idêntico

- **WHEN** a rota de Financeiro é chamada com token válido mas sem papel, ou com papel insuficiente
- **THEN** a resposta é 403, byte-idêntica nos dois casos, sem expor dado algum

#### Scenario: Token válido com papel autorizado responde conforme o contrato

- **WHEN** a rota é chamada com token válido e papel autorizado
- **THEN** a resposta segue o contrato vigente do módulo, com comportamento idêntico ao caracterizado pelas suítes vigentes
