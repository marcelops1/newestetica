## MODIFIED Requirements

### Requirement: Escopo limitado aos contextos com equivalente mockado

Os contratos desta capability SHALL cobrir Catálogo, Agendamento, Conteúdo Público, Pacientes, Atendimento/Histórico e Financeiro Básico; Identidade e Acesso SHALL NOT ter schemas nesta change e nasce com o módulo NestJS correspondente (Feature 4.2).

#### Scenario: Nenhum contrato órfão sem equivalente observável

- **WHEN** os schemas entregues são auditados contra os mocks e casos de uso vigentes
- **THEN** cada schema de Catálogo, Agendamento e Conteúdo Público tem ao menos um mock ou comportamento observável correspondente, e nenhum schema existe para o contexto adiado

#### Scenario: Contrato de Pacientes validado sem mock equivalente

- **WHEN** os schemas de Pacientes são auditados (contexto administrativo sem mock no frontend)
- **THEN** cada schema tem ao menos uma fixture de teste ou regra de domínio correspondente em vez de mock, e a ausência de mock está registrada explicitamente neste change

#### Scenario: Contrato de Atendimento validado sem mock equivalente

- **WHEN** os schemas de Atendimento/Histórico são auditados (contexto administrativo sem mock no frontend)
- **THEN** cada schema tem ao menos uma fixture de teste ou regra de domínio correspondente em vez de mock, e a ausência de mock está registrada explicitamente neste change

#### Scenario: Contrato de Financeiro validado sem mock equivalente

- **WHEN** os schemas de Financeiro Básico são auditados (contexto administrativo sem mock no frontend, nascidos com o módulo NestJS desta change)
- **THEN** cada schema tem ao menos uma fixture de teste ou regra de domínio correspondente em vez de mock, e a ausência de mock está registrada explicitamente neste change

### Requirement: Contrato de registro de atendimento (AttendanceInput)

O contrato de Atendimento/Histórico SHALL definir o formato de criação com resumo operacional do que foi realizado (string não-vazia após trim, máximo 500), data de realização em datetime ISO (UTC ou offset explícito) e valor opcional do atendimento em centavos inteiros (`amountCents`: inteiro, mínimo 0, máximo 10.000.000 — teto de R$ 100.000; ausente quando o valor não for informado); o vínculo com a paciente é o parâmetro de path `:patientId` da rota aninhada, nunca duplicado no corpo; nenhum campo clínico, prontuário, anexo ou identificador próprio (o id é gerado pelo servidor).

#### Scenario: Registro operacional válido é aceito

- **WHEN** um payload com resumo e data válidos é validado contra o contrato
- **THEN** a validação aprova preservando os dois campos

#### Scenario: Registro com valor válido é aceito

- **WHEN** um payload com resumo e data válidos inclui `amountCents` inteiro entre 0 e 10.000.000
- **THEN** a validação aprova preservando os três campos

#### Scenario: Resumo vazio, gigante ou data fora do ISO são rejeitados

- **WHEN** o resumo está vazio ou acima de 500 caracteres, ou a data não é datetime ISO
- **THEN** a validação reprova indicando o campo correspondente

#### Scenario: Valor fracionário, negativo ou acima do teto é rejeitado

- **WHEN** `amountCents` é fracionário, negativo ou acima de 10.000.000
- **THEN** a validação reprova indicando o campo `amountCents`

#### Scenario: Campo clínico não entra no contrato

- **WHEN** um payload inclui diagnóstico, CID, prescrição ou qualquer campo clínico além de resumo operacional
- **THEN** a validação reprova (campo clínico dedicado) ou o campo é ignorado sem efeito (desconhecido, por stripping padrão do Zod)

### Requirement: Contrato de saída do histórico (Attendance)

O contrato de Atendimento/Histórico SHALL definir o formato de saída com identificador UUID gerado pelo servidor, identificador da paciente, resumo operacional, valor em centavos (`amountCents`: inteiro ou nulo — nulo quando não informado na criação, imutável depois dela), data de realização e criação/atualização em datetime ISO; sem PII além do vínculo (o nome da paciente é resolvido no backend somente se visível, nunca persistido duplicado).

#### Scenario: Registro íntegro válido é aceito

- **WHEN** um registro completo é validado contra o contrato
- **THEN** a validação aprova em todos os campos

## ADDED Requirements

### Requirement: Contrato da consulta de resumo (FinanceSummaryQuery)

O contrato de Financeiro Básico SHALL definir o formato da consulta de resumo com janela obrigatória `from`/`to` em data ISO (`YYYY-MM-DD`), onde `from` SHALL NOT ser posterior a `to` e o span (`to` − `from`) SHALL NOT exceder 366 dias; janela ausente, malformada, invertida ou acima do teto SHALL reprovar a validação.

#### Scenario: Janela válida é aceita

- **WHEN** uma consulta com `from` e `to` em data ISO e span dentro de 366 dias é validada contra o contrato
- **THEN** a validação aprova preservando os dois campos

#### Scenario: Janela ausente, invertida ou acima do teto é rejeitada

- **WHEN** `from` ou `to` está ausente ou fora do ISO, `from` é posterior a `to`, ou o span excede 366 dias
- **THEN** a validação reprova indicando o campo ou a janela correspondente

### Requirement: Contrato do resumo financeiro (FinanceSummary)

O contrato de Financeiro Básico SHALL definir o formato do resumo com a janela consultada (`from`/`to`), moeda literal `currency: "BRL"`, total em centavos inteiros (`totalCents`, mínimo 0) e contagem de atendimentos com valor (`count`, inteiro, mínimo 0); sem PII, sem identificador de paciente e sem breakdown por paciente.

#### Scenario: Resumo íntegro válido é aceito

- **WHEN** um resumo com janela, `currency: "BRL"`, `totalCents` e `count` válidos é validado contra o contrato
- **THEN** a validação aprova em todos os campos

#### Scenario: Moeda diferente ou PII são rejeitadas

- **WHEN** o resumo usa moeda diferente de `BRL` ou inclui nome, contato ou qualquer identificador de paciente
- **THEN** a validação reprova (moeda) ou o campo é ignorado sem efeito (PII desconhecida, por stripping padrão do Zod)
