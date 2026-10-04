## MODIFIED Requirements

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

### Requirement: Saída conforme o contrato publicado

Toda resposta de leitura/escrita de atendimentos SHALL ser compatível com os schemas de `contracts/src/attendance/`, incluindo o valor em centavos (`amountCents`, inteiro ou nulo); divergência entre implementação e contrato reprova.

#### Scenario: Listagens, detalhe e escrita validam contra o contrato

- **WHEN** qualquer resposta de atendimento é validada contra o contrato
- **THEN** a validação aprova em todos os campos
