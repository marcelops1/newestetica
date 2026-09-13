## ADDED Requirements

### Requirement: Campos do post do blog

Cada post mockado SHALL ter categoria (string não-vazia), título, resumo, conteúdo completo em parágrafos (`content` não-vazio, cada parágrafo string não-vazia) e data fictícia; o total SHALL ser de ao menos 4 posts, todos fictícios, em tom educativo e tranquilizador — nunca alarmista sobre procedimentos; as abas de filtro SHALL derivar das categorias existentes mais "Todos", sem categoria órfã.

#### Scenario: Post completo para a página de detalhe

- **WHEN** um post é exibido no detalhe
- **THEN** categoria, título, data e todos os parágrafos estão preenchidos com conteúdo fictício

#### Scenario: Filtro sem categoria órfã

- **WHEN** as abas são geradas a partir dos mocks
- **THEN** toda aba de categoria possui ao menos um post

### Requirement: Busca de post por slug

A camada de dados SHALL expor acessor que retorna o post pelo slug/id, ou indefinido quando inexistente, sobre os mesmos mocks (sem novos dados além dos campos do requirement anterior).

#### Scenario: Slug válido e inválido

- **WHEN** solicitado um slug existente
- **THEN** retorna o post; quando inexistente, retorna indefinido
