## ADDED Requirements

### Requirement: Busca de procedimento por slug

A camada de dados SHALL expor acessor que retorna o procedimento pelo slug/id, ou indefinido quando inexistente, sobre os mesmos mocks (sem novos dados).

#### Scenario: Slug válido e inválido

- **WHEN** solicitado um slug existente
- **THEN** retorna o procedimento; quando inexistente, retorna indefinido
