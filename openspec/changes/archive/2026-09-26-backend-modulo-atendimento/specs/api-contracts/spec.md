## MODIFIED Requirements

### Requirement: Escopo limitado aos contextos com equivalente mockado

Os contratos desta capability SHALL cobrir Catálogo, Agendamento, Conteúdo Público, Pacientes e Atendimento/Histórico; Identidade e Acesso e Financeiro Básico SHALL NOT ter schemas nesta change e nascem com os módulos NestJS correspondentes (Feature 4.2).

#### Scenario: Nenhum contrato órfão sem equivalente observável

- **WHEN** os schemas entregues são auditados contra os mocks e casos de uso vigentes
- **THEN** cada schema de Catálogo, Agendamento e Conteúdo Público tem ao menos um mock ou comportamento observável correspondente, e nenhum schema existe para os dois contextos adiados

#### Scenario: Contrato de Pacientes validado sem mock equivalente

- **WHEN** os schemas de Pacientes são auditados (contexto administrativo sem mock no frontend)
- **THEN** cada schema tem ao menos uma fixture de teste ou regra de domínio correspondente em vez de mock, e a ausência de mock está registrada explicitamente neste change

#### Scenario: Contrato de Atendimento validado sem mock equivalente

- **WHEN** os schemas de Atendimento/Histórico são auditados (contexto administrativo sem mock no frontend)
- **THEN** cada schema tem ao menos uma fixture de teste ou regra de domínio correspondente em vez de mock, e a ausência de mock está registrada explicitamente neste change

## ADDED Requirements

### Requirement: Contrato de registro de atendimento (AttendanceInput)

O contrato de Atendimento/Histórico SHALL definir o formato de criação com resumo operacional do que foi realizado (string não-vazia após trim, máximo 500) e data de realização em datetime ISO (UTC ou offset explícito); o vínculo com a paciente é o parâmetro de path `:patientId` da rota aninhada, nunca duplicado no corpo; nenhum campo clínico, prontuário, anexo ou identificador próprio (o id é gerado pelo servidor).

#### Scenario: Registro operacional válido é aceito

- **WHEN** um payload com resumo e data válidos é validado contra o contrato
- **THEN** a validação aprova preservando os dois campos

#### Scenario: Resumo vazio, gigante ou data fora do ISO são rejeitados

- **WHEN** o resumo está vazio ou acima de 500 caracteres, ou a data não é datetime ISO
- **THEN** a validação reprova indicando o campo correspondente

#### Scenario: Campo clínico não entra no contrato

- **WHEN** um payload inclui diagnóstico, CID, prescrição ou qualquer campo clínico além de resumo operacional
- **THEN** a validação reprova (campo clínico dedicado) ou o campo é ignorado sem efeito (desconhecido, por stripping padrão do Zod)

### Requirement: Contrato de saída do histórico (Attendance)

O contrato de Atendimento/Histórico SHALL definir o formato de saída com identificador UUID gerado pelo servidor, identificador da paciente, resumo operacional, data de realização e criação/atualização em datetime ISO; sem PII além do vínculo (o nome da paciente é resolvido no backend somente se visível, nunca persistido duplicado).

#### Scenario: Registro íntegro válido é aceito

- **WHEN** um registro completo é validado contra o contrato
- **THEN** a validação aprova em todos os campos
