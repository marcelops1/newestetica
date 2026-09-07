## ADDED Requirements

### Requirement: Página de catálogo com filtro e busca

A rota `/tratamentos` SHALL listar todos os procedimentos dos mocks com filtro por categoria (abas derivadas, `aria-pressed`) e busca por nome, sem recarregar.

#### Scenario: Busca por nome

- **WHEN** a paciente digita parte do nome de um procedimento
- **THEN** somente os coincidentes permanecem, com mensagem acolhedora se vazio

#### Scenario: Filtro + busca combinados

- **WHEN** categoria e texto estão ativos juntos
- **THEN** a lista respeita ambos os critérios

### Requirement: Detalhe por procedimento

A rota `/tratamentos/[slug]` SHALL exibir nome, descrição clara (o que é, o que esperar), duração, categoria e CTA de agendar; slug inexistente SHALL mostrar página de não-encontrado acolhedora, sem erro técnico.

#### Scenario: Slug inválido

- **WHEN** a paciente abre um slug inexistente
- **THEN** ela vê mensagem acolhedora com caminho de volta ao catálogo

### Requirement: Agendar a partir do catálogo

O CTA de agendar (lista e detalhe) SHALL abrir o `BookingModal` existente com o tratamento pré-selecionado via `resolveTreatment`, mantendo os 4 estados e o envio mockado.

#### Scenario: Agendar do detalhe

- **WHEN** a paciente agenda a partir da página de um procedimento
- **THEN** o modal abre com esse tratamento pré-selecionado
