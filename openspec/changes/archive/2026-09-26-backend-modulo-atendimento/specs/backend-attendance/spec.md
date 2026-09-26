## Purpose

Dá à Fabiana (via API) o registro e a recuperação do histórico simples de atendimentos por paciente: create e read no formato do contrato novo, com visibilidade herdada do paciente (anonimizada nunca aparece nem via join) e histórico imutável — operacional, sem prontuário.

## ADDED Requirements

### Requirement: Registro de atendimento vinculado a paciente visível

A API SHALL expor a criação de atendimento vinculada a paciente existente e visível; o identificador é gerado pelo servidor (UUID v4); paciente inexistente ou anonimizada SHALL responder não-encontrado, sem distinguir motivos; payload inválido SHALL responder erro de validação estruturado.

#### Scenario: Registro válido retorna 201 com o atendimento criado

- **WHEN** um registro com paciente visível, resumo e data válidos é enviado
- **THEN** a resposta é 201 contendo o atendimento no formato do contrato, com id gerado e timestamps

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

Toda resposta de leitura/escrita de atendimentos SHALL ser compatível com os schemas de `contracts/src/attendance/`; divergência entre implementação e contrato reprova.

#### Scenario: Listagens, detalhe e escrita validam contra o contrato

- **WHEN** qualquer resposta de atendimento é validada contra o contrato
- **THEN** a validação aprova em todos os campos

### Requirement: Bloqueio honesto até a Identidade

Todas as rotas de Atendimento SHALL nascer sob o mesmo guard honesto de Pacientes (`IdentityPendingGuard` no kernel compartilhado, via `@UseGuards` no controller, sem exceção): qualquer requisição com o guard ativo SHALL responder 403 com código `AUTH_NOT_IMPLEMENTED` e mensagem explícita de autenticação pendente, sem expor dado algum. A substituição deste guard pelo guard real de Keycloak/RBAC SHALL ser próximo passo obrigatório do módulo de Identidade (UC 4.2.1), não implícito.

#### Scenario: Requisição com o guard ativo é bloqueada com 403 explícito

- **WHEN** qualquer rota de Atendimento é chamada com o guard ativo e sem bypass
- **THEN** a resposta é 403 com o código `AUTH_NOT_IMPLEMENTED` e a mensagem de autenticação pendente, sem corpo de dados
