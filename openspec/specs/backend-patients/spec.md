# backend-patients Specification

## Purpose

Dá ao painel admin uma fonte real para o cadastro básico de pacientes: create, read, update e anonimização via delete, no formato do contrato novo, com PII mínima, finalidade registrada e anonimizados excluídos de qualquer leitura — estrutura pronta para os direitos do titular sem retrabalho futuro.

## Requirements

### Requirement: Cadastro de paciente

A API SHALL expor a criação de paciente no formato do contrato vigente; o identificador é gerado pelo servidor (UUID v4); payload inválido SHALL responder erro de validação estruturado, sem ecoar valores de PII.

#### Scenario: Cadastro válido retorna 201 com o paciente criado

- **WHEN** um cadastro com nome, telefone e finalidade válidos é enviado
- **THEN** a resposta é 201 contendo o paciente no formato do contrato, com id gerado e timestamps

#### Scenario: Cadastro inválido responde 422 sem ecoar PII

- **WHEN** um cadastro com nome curto ou telefone sem DDD é enviado
- **THEN** a resposta é 422 com código de validação, sem repetir os valores enviados

### Requirement: Leitura de pacientes ativos

A API SHALL expor a listagem e o detalhe de pacientes contendo somente registros ativos, em ordem determinística alfabética; registro anonimizado SHALL nunca aparecer em leitura, mesmo existindo na base; `limit` opcional (padrão 100, máximo 500) limita a resposta; id inexistente ou anonimizado SHALL responder não-encontrado, sem distinguir motivos.

#### Scenario: Base com ativos e anonimizados lista só os ativos

- **WHEN** a listagem é consultada existindo pacientes ativos e anonimizados
- **THEN** a resposta contém exatamente os ativos, cada um no formato do contrato

#### Scenario: Limite acima do máximo responde 422

- **WHEN** a listagem é consultada com `limit` acima de 500
- **THEN** a resposta é 422 com código de validação

#### Scenario: Id inexistente ou anonimizado responde não-encontrado

- **WHEN** um id inexistente ou de paciente anonimizado é consultado
- **THEN** a resposta é não-encontrado, idêntica nos dois casos

### Requirement: Atualização parcial de paciente

A API SHALL expor a atualização parcial de paciente ativo pelo seu id; somente nome, telefone e finalidade são atualizáveis; registro inexistente ou anonimizado SHALL responder não-encontrado.

#### Scenario: Atualização válida retorna o paciente atualizado

- **WHEN** uma atualização com telefone válido é enviada para um id ativo existente
- **THEN** a resposta contém aquele paciente com o campo alterado e os demais preservados

### Requirement: Anonimização via delete

A API SHALL expor a anonimização de paciente ativo pelo seu id: PII é substituída por placeholders fixos, status vira `anonymized` com timestamp, e a resposta é 204 sem corpo; o registro anonimizado SHALL sair de todas as leituras; segunda chamada ou id inexistente SHALL responder não-encontrado.

#### Scenario: Delete anonimiza e some das leituras

- **WHEN** um id ativo existente é excluído e a listagem é consultada em seguida
- **THEN** a resposta da exclusão é 204 sem corpo e o id não aparece mais em nenhuma leitura

### Requirement: Saída conforme o contrato publicado

Toda resposta de leitura/escrita de pacientes SHALL ser compatível com os schemas de `contracts/src/patients/`; divergência entre implementação e contrato reprova.

#### Scenario: Listagens, detalhe e escrita validam contra o contrato

- **WHEN** qualquer resposta de paciente é validada contra o contrato
- **THEN** a validação aprova em todos os campos

### Requirement: Autenticação real via Keycloak

Todas as rotas de Pacientes SHALL exigir autenticação real via Keycloak (guard real no kernel compartilhado, via `@UseGuards` no controller, sem exceção): requisição sem token válido SHALL responder 401; token válido sem papel autorizado SHALL responder 403 com código e mensagem fixos, sem expor dado algum nem distinguir existência de recursos; com token válido e papel autorizado, as rotas SHALL funcionar conforme seus contratos — as suítes existentes servem como caracterização, provando zero regressão de negócio (o contraste "sem token = 401/403" vs "token válido com papel = acesso" substitui o `overrideGuard` anterior).

#### Scenario: Requisição com o guard ativo é bloqueada com 403 explícito

- **WHEN** qualquer rota de Pacientes é chamada sem token válido, com o guard real ativo (o 403 `AUTH_NOT_IMPLEMENTED` do bloqueio honesto foi substituído por 401/403 reais neste change)
- **THEN** a resposta é 401, idêntica em todos os casos, sem corpo de dados

#### Scenario: Com bypass (Identidade simulada) as rotas funcionam normalmente

- **WHEN** as rotas são chamadas com token válido e papel autorizado (o bypass de teste foi substituído por credencial real neste change)
- **THEN** cada rota responde conforme seu contrato (201/200/204/404), com comportamento idêntico ao caracterizado pelas suítes vigentes

#### Scenario: Token válido sem papel autorizado responde 403 idêntico

- **WHEN** qualquer rota de Pacientes é chamada com token válido mas sem papel, ou com papel insuficiente
- **THEN** a resposta é 403, byte-idêntica nos dois casos, sem expor dado algum
