## ADDED Requirements

> Em camada sobre o delta de `mock-data` do change `frontend-foundation-mocks` (arquivar a fundação primeiro).

### Requirement: Objetivos e recomendações do quiz

Os mocks SHALL fornecer os 4 objetivos do simulador (id, título, descrição curta) e a recomendação de cada um (protocolo indicado + descrição), todos fictícios.

#### Scenario: Recomendação por objetivo

- **WHEN** a UI solicita a recomendação de um objetivo válido
- **THEN** recebe exatamente um protocolo com título e descrição não vazios

### Requirement: Categorias e campos de tratamentos para filtros e cards

Cada procedimento mockado SHALL ter categoria entre as abas do filtro e os campos exibidos no card (categoria, duração, nome, descrição); as abas SHALL derivar das categorias existentes mais "Todos".

#### Scenario: Filtro sem categoria órfã

- **WHEN** as abas são geradas a partir dos mocks
- **THEN** toda aba de categoria possui ao menos um procedimento

### Requirement: Campos do caso clínico de resultados

Cada caso mockado SHALL ter título, resumo, sessões, recuperação, objetivo e `hasConsent`; somente casos com consentimento são listados.

#### Scenario: Caso completo para o painel

- **WHEN** um caso com consentimento é exibido
- **THEN** todos os campos do painel estão preenchidos com conteúdo fictício

### Requirement: Opções do modal e canais de contato fictícios

Os mocks SHALL fornecer as opções de "tratamento de interesse" do modal e os canais de contato (WhatsApp, endereço, horários) com valores visivelmente fictícios.

#### Scenario: Inspeção dos contatos

- **WHEN** os arquivos de mock de contato são inspecionados
- **THEN** números, endereços e nomes são identificavelmente fictícios
