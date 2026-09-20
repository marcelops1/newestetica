## Purpose

Define os formatos de dados oficiais entre frontend e backend para Catálogo, Agendamento e Conteúdo Público, de modo que mocks, frontend e futuro backend falem a mesma língua validável.

## ADDED Requirements

### Requirement: Contrato do catálogo de procedimentos

O contrato de Catálogo SHALL definir o formato de um procedimento com identificador slug (string não-vazia), nome, descrição, duração como texto livre e lista de categorias não-vazia restrita a `facial`, `corporal` e `rejuvenescimento`.

#### Scenario: Procedimento válido é aceito

- **WHEN** um payload com todos os campos preenchidos conforme o formato é validado contra o contrato
- **THEN** a validação aprova sem erros

#### Scenario: Categoria fora do vocabulário é rejeitada

- **WHEN** um procedimento usa categoria fora de `facial`/`corporal`/`rejuvenescimento`
- **THEN** a validação reprova indicando o campo de categorias

#### Scenario: Mocks vigentes de procedimentos são compatíveis

- **WHEN** cada item de `proceduresMock` é validado contra o contrato
- **THEN** todos aprovam, ou a divergência está mapeada explicitamente neste change

### Requirement: Contrato da solicitação de agendamento

O contrato de Agendamento SHALL definir o formato da solicitação de booking com nome (mínimo 2 caracteres após trim), telefone/WhatsApp (mínimo 10 dígitos), tratamento de interesse opcional e mensagem opcional; campos ausentes ou malformados SHALL reprovar a validação.

#### Scenario: Solicitação válida é aceita

- **WHEN** uma solicitação com nome e telefone válidos é validada
- **THEN** a validação aprova preservando os campos opcionais fornecidos

#### Scenario: Nome ou telefone inválido é rejeitado

- **WHEN** o nome tem menos de 2 caracteres ou o telefone tem menos de 10 dígitos
- **THEN** a validação reprova indicando o campo correspondente

#### Scenario: Comportamento vigente do mock é compatível

- **WHEN** os exemplos aceitos e rejeitados por `parseQuoteInput`/`submitBookingRequest` (contrato da fronteira UI ↔ submissão) são validados contra o contrato
- **THEN** os aceitos aprovam e os rejeitados reprovam, ou a divergência está mapeada explicitamente

### Requirement: Contrato dos slots de disponibilidade

O contrato de Agendamento SHALL definir o formato de um slot com identificador, início em data-hora ISO, duração em minutos (inteiro positivo) e flag de disponibilidade.

#### Scenario: Slots vigentes são compatíveis

- **WHEN** cada item de `slotsMock` é validado contra o contrato
- **THEN** todos aprovam, ou a divergência está mapeada explicitamente

### Requirement: Contrato de depoimentos

O contrato de Conteúdo Público SHALL definir o formato de um depoimento com identificador, relato, autoria em iniciais/contexto fictício e contexto de paciente ilustrativa, todos strings não-vazias.

#### Scenario: Depoimentos vigentes são compatíveis

- **WHEN** cada item de `testimonialsMock` é validado contra o contrato
- **THEN** todos aprovam, ou a divergência está mapeada explicitamente

### Requirement: Contrato de antes/depois com consentimento obrigatório

O contrato de Conteúdo Público SHALL exigir o campo de consentimento explícito (`hasConsent`) em cada caso de antes/depois, com título, resumo, sessões, recuperação e objetivo como strings não-vazias; o formato de listagem pública SHALL conter somente casos com consentimento verdadeiro.

#### Scenario: Caso sem consentimento nunca aparece na listagem pública

- **WHEN** a lista pública de casos é produzida a partir de itens com e sem consentimento
- **THEN** somente os itens com consentimento verdadeiro estão presentes

#### Scenario: Casos vigentes com consentimento são compatíveis

- **WHEN** cada item de `resultsMock` com consentimento é validado contra o contrato
- **THEN** todos aprovam, ou a divergência está mapeada explicitamente

### Requirement: Contrato dos posts do blog

O contrato de Conteúdo Público SHALL definir o formato de um post com identificador slug, título, resumo, categoria editorial (string não-vazia), conteúdo completo em lista de parágrafos não-vazia e data de publicação.

#### Scenario: Posts vigentes são compatíveis

- **WHEN** cada item de `postsMock` é validado contra o contrato
- **THEN** todos aprovam, ou a divergência está mapeada explicitamente

### Requirement: Contrato de contato e orçamento

O contrato de Conteúdo Público SHALL definir o formato da mensagem de contato (nome mínimo 2 caracteres, contato como e-mail válido OU telefone com DDD mínimo 10 dígitos, mensagem não-vazia) e da solicitação de orçamento (nome, telefone com DDD, procedimento opcional restrito às opções vigentes, mensagem opcional).

#### Scenario: Contato flexível válido é aceito

- **WHEN** uma mensagem com e-mail válido ou WhatsApp com DDD é validada
- **THEN** a validação aprova em ambos os casos

#### Scenario: Contato sem canal válido é rejeitado

- **WHEN** o campo de contato não é e-mail válido nem telefone com DDD
- **THEN** a validação reprova indicando o campo de contato

#### Scenario: Comportamento vigente dos mocks é compatível

- **WHEN** os exemplos aceitos e rejeitados por `parseContactInput`/`validateContactFields` e `parseQuoteInput`/`validateQuoteFields` são validados contra o contrato
- **THEN** os aceitos aprovam e os rejeitados reprovam, ou a divergência está mapeada explicitamente

### Requirement: Contrato das informações institucionais e do quiz

O contrato de Conteúdo Público SHALL definir o formato das informações institucionais fictícias (WhatsApp, link, horários, endereço) e dos objetivos/recomendações do quiz (identificador, título, descrição curta; recomendação com protocolo e descrição vinculados a um objetivo existente).

#### Scenario: Mocks vigentes de quiz e contato são compatíveis

- **WHEN** `contactMock`, `quizGoalsMock`, `quizRecommendationsMock` e `treatmentOptionsMock` são validados contra o contrato
- **THEN** todos aprovam, ou a divergência está mapeada explicitamente

### Requirement: Erros de validação consistentes e sem vazamento

Toda validação de contrato SHALL reprovar payloads malformados com erro estruturado (código legível por máquina + mensagem + campo correspondente quando aplicável), sem expor detalhes internos, stack traces ou dados sensíveis.

#### Scenario: Payload malformado recebe erro estruturado

- **WHEN** um payload com tipo errado (ex.: objeto nulo, campo obrigatório ausente) é validado
- **THEN** o resultado indica falha com código e mensagem, sem conteúdo interno do validador

### Requirement: Escopo limitado aos contextos com equivalente mockado

Os contratos desta capability SHALL cobrir somente Catálogo, Agendamento e Conteúdo Público; Identidade e Acesso, Pacientes, Atendimento/Histórico e Financeiro Básico SHALL NOT ter schemas nesta change e nascem com os módulos NestJS correspondentes (Feature 4.2).

#### Scenario: Nenhum contrato órfão sem equivalente observável

- **WHEN** os schemas entregues são auditados contra os mocks e casos de uso vigentes
- **THEN** cada schema tem ao menos um mock ou comportamento observável correspondente, e nenhum schema existe para os quatro contextos adiados
