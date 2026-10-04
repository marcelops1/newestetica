## Purpose

Dá à Fabiana (via API) o resumo financeiro essencial por janela: total recebido e contagem de atendimentos com valor, agregados somente sobre atendimentos de pacientes visíveis — sem PII, sem breakdown, sem fiscal/contábil.

## ADDED Requirements

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

### Requirement: Bloqueio honesto até a Identidade

A rota de Financeiro SHALL nascer sob o mesmo guard honesto dos módulos administrativos (`IdentityPendingGuard` no kernel compartilhado, via `@UseGuards` no controller, sem exceção): qualquer requisição com o guard ativo SHALL responder 403 com código `AUTH_NOT_IMPLEMENTED` e mensagem explícita de autenticação pendente, sem expor dado algum. A substituição deste guard pelo guard real de Keycloak/RBAC SHALL ser próximo passo obrigatório do módulo de Identidade (UC 4.2.1), não implícito.

#### Scenario: Requisição com o guard ativo é bloqueada com 403 explícito

- **WHEN** a rota de Financeiro é chamada com o guard ativo e sem bypass
- **THEN** a resposta é 403 com o código `AUTH_NOT_IMPLEMENTED` e a mensagem de autenticação pendente, sem corpo de dados
