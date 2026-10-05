# backend-attendance Specification

## Purpose

Dá à Fabiana (via API) o registro e a recuperação do histórico simples de atendimentos por paciente: create e read no formato do contrato novo, com visibilidade herdada do paciente (anonimizada nunca aparece nem via join) e histórico imutável — operacional, sem prontuário.

## Requirements

### Requirement: Registro de atendimento vinculado a paciente visível

A API SHALL expor a criação de atendimento vinculada a paciente existente e visível, com valor opcional em centavos inteiros (`amountCents`: inteiro, mínimo 0, máximo 10.000.000; ausente quando não informado); o valor é imutável depois de criado (não existe rota de alteração — correção se faz com novo registro); o identificador é gerado pelo servidor (UUID v4); paciente inexistente ou anonimizada SHALL responder não-encontrado, sem distinguir motivos; payload inválido SHALL responder erro de validação estruturado.

#### Scenario: Registro válido retorna 201 com o atendimento criado

- **WHEN** um registro com paciente visível, resumo e data válidos é enviado
- **THEN** a resposta é 201 contendo o atendimento no formato do contrato, com id gerado e timestamps

#### Scenario: Registro com valor válido retorna 201 com o valor persistido

- **WHEN** um registro com paciente visível e `amountCents` inteiro entre 0 e 10.000.000 é enviado
- **THEN** a resposta é 201 contendo o atendimento com o valor informado, e leituras posteriores devolvem o mesmo valor

#### Scenario: Paciente inexistente ou anonimizada responde não-encontrado

- **WHEN** um registro é enviado para id de paciente inexistente ou anonimizada
- **THEN** a resposta é não-encontrado, idêntica nos dois casos, sem criar nada

### Requirement: Leitura do histórico só de pacientes visíveis

A API SHALL expor a listagem por paciente e o detalhe contendo somente registros cuja paciente esteja visível; histórico de paciente anonimizada SHALL nunca aparecer, mesmo com os registros existindo na base; `limit` opcional (padrão 100, máximo 500) limita a listagem; id inexistente, anonimizado ou de outra paciente SHALL responder não-encontrado, sem distinguir motivos.

#### Scenario: Base com ativas e anonimizadas lista só histórico de ativas

- **WHEN** a listagem de uma paciente ativa é consultada existindo atendimentos dela e de paciente anonimizada
- **THEN** a resposta contém exatamente os atendimentos da paciente consultada, cada um no formato do contrato

#### Scenario: Paciente anonimizada responde não-encontrado na listagem e no detalhe

- **WHEN** a listagem ou o detalhe é consultado para paciente anonimizada
- **THEN** a resposta é não-encontrado (lista vazia na listagem), sem expor registros

#### Scenario: Detalhe cruzado entre pacientes responde não-encontrado

- **WHEN** o detalhe de um atendimento é consultado sob o id de outra paciente
- **THEN** a resposta é não-encontrado, sem revelar a existência do registro

#### Scenario: Limite acima do máximo responde 422

- **WHEN** a listagem é consultada com `limit` acima de 500
- **THEN** a resposta é 422 com código de validação

### Requirement: Histórico imutável (sem update/delete)

A API SHALL NOT expor atualização nem exclusão de atendimento; correção se faz com novo registro; a exclusão de dados pessoais acontece na paciente (anonimização), nunca no histórico.

#### Scenario: Auditoria de escopo

- **WHEN** a superfície HTTP do módulo é auditada
- **THEN** não existe rota de escrita além da criação, e nenhuma rota exige autenticação além do que o UC prevê nesta fatia (bloqueio honesto até a Identidade)

### Requirement: Saída conforme o contrato publicado

Toda resposta de leitura/escrita de atendimentos SHALL ser compatível com os schemas de `contracts/src/attendance/`, incluindo o valor em centavos (`amountCents`, inteiro ou nulo); divergência entre implementação e contrato reprova.

#### Scenario: Listagens, detalhe e escrita validam contra o contrato

- **WHEN** qualquer resposta de atendimento é validada contra o contrato
- **THEN** a validação aprova em todos os campos

### Requirement: Autenticação real via Keycloak

Todas as rotas de Atendimento SHALL exigir autenticação real via Keycloak (guard real no kernel compartilhado, via `@UseGuards` no controller, sem exceção): requisição sem token válido SHALL responder 401; token válido sem papel autorizado SHALL responder 403 com código e mensagem fixos, sem expor dado algum nem distinguir existência de recursos; com token válido e papel autorizado, as rotas SHALL funcionar conforme seus contratos — as suítes existentes servem como caracterização, provando zero regressão de negócio (o contraste "sem token = 401/403" vs "token válido com papel = acesso" substitui o `overrideGuard` anterior).

#### Scenario: Requisição com o guard ativo é bloqueada com 403 explícito

- **WHEN** qualquer rota de Atendimento é chamada sem token válido, com o guard real ativo (o 403 `AUTH_NOT_IMPLEMENTED` do bloqueio honesto foi substituído por 401/403 reais neste change)
- **THEN** a resposta é 401, idêntica em todos os casos, sem corpo de dados

#### Scenario: Token válido sem papel autorizado responde 403 idêntico

- **WHEN** qualquer rota de Atendimento é chamada com token válido mas sem papel, ou com papel insuficiente
- **THEN** a resposta é 403, byte-idêntica nos dois casos, sem expor dado algum

#### Scenario: Token válido com papel autorizado responde conforme o contrato

- **WHEN** as rotas são chamadas com token válido e papel autorizado
- **THEN** cada rota responde conforme seu contrato, com comportamento idêntico ao caracterizado pelas suítes vigentes
