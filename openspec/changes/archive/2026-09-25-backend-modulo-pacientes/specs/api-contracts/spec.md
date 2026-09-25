## MODIFIED Requirements

### Requirement: Escopo limitado aos contextos com equivalente mockado

Os contratos desta capability SHALL cobrir Catálogo, Agendamento, Conteúdo Público e Pacientes; Identidade e Acesso, Atendimento/Histórico e Financeiro Básico SHALL NOT ter schemas nesta change e nascem com os módulos NestJS correspondentes (Feature 4.2).

#### Scenario: Nenhum contrato órfão sem equivalente observável

- **WHEN** os schemas entregues são auditados contra os mocks e casos de uso vigentes
- **THEN** cada schema de Catálogo, Agendamento e Conteúdo Público tem ao menos um mock ou comportamento observável correspondente, e nenhum schema existe para os três contextos adiados

#### Scenario: Contrato de Pacientes validado sem mock equivalente

- **WHEN** os schemas de Pacientes são auditados (contexto administrativo sem mock no frontend)
- **THEN** cada schema tem ao menos uma fixture de teste ou regra de domínio correspondente em vez de mock, e a ausência de mock está registrada explicitamente neste change

## ADDED Requirements

### Requirement: Contrato de cadastro de paciente (PatientInput)

O contrato de Pacientes SHALL definir o formato de criação com nome completo (mínimo 2 caracteres após trim, máximo 120), telefone/WhatsApp (máximo 20 caracteres, mínimo 10 dígitos) e finalidade informada da coleta (string não-vazia, máximo 200); nenhum campo de saúde, e-mail, observações livres ou identificador.

#### Scenario: Cadastro mínimo válido é aceito

- **WHEN** um payload com nome, telefone e finalidade válidos é validado contra o contrato
- **THEN** a validação aprova preservando os três campos

#### Scenario: Nome curto, telefone sem DDD ou finalidade ausente são rejeitados

- **WHEN** o nome tem menos de 2 caracteres, o telefone tem menos de 10 dígitos ou a finalidade está ausente
- **THEN** a validação reprova indicando o campo correspondente

#### Scenario: Campo de saúde ou desconhecido não entra no contrato

- **WHEN** um payload inclui campo clínico, e-mail ou qualquer campo fora de nome/telefone/finalidade
- **THEN** a validação reprova (campo clínico/e-mail) ou o campo é ignorado sem efeito (desconhecido, por stripping padrão do Zod)

### Requirement: Contrato de atualização parcial (PatientUpdate)

O contrato de Pacientes SHALL definir o formato de atualização como subconjunto opcional de nome, telefone e finalidade (mesmas regras do cadastro); status, identificadores e timestamps SHALL NOT ser atualizáveis por esta via.

#### Scenario: Atualização parcial válida é aceita

- **WHEN** um payload com somente telefone válido é validado contra o contrato
- **THEN** a validação aprova com apenas aquele campo

#### Scenario: Tentativa de alterar status pela atualização é neutralizada

- **WHEN** um payload de atualização inclui `status`
- **THEN** o campo não produz efeito na atualização (fora do formato aceito)

### Requirement: Contrato de saída e status (Patient)

O contrato de Pacientes SHALL definir o formato de saída com identificador UUID gerado pelo servidor, nome, telefone, finalidade, status (`active`/`anonymized`), criação e atualização em datetime ISO; registros anonimizados SHALL nunca ser servidos neste formato com PII legível.

#### Scenario: Registro ativo válido é aceito

- **WHEN** um registro ativo completo é validado contra o contrato
- **THEN** a validação aprova em todos os campos

#### Scenario: Status fora do vocabulário é rejeitado

- **WHEN** um registro usa status diferente de `active` ou `anonymized`
- **THEN** a validação reprova indicando o campo de status
