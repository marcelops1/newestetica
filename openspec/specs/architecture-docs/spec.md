# architecture-docs Specification

## Purpose
Fornece o mapa visual da arquitetura em 3 níveis C4, distinguindo o implementado do planejado para orientar IAs e desenvolvedores.

## Requirements

### Requirement: Diagrama de contexto com atores e externos

`docs/architecture/c1-context.md` SHALL conter diagrama Mermaid do sistema, atores (Paciente, Fabiana/Admin) e sistemas externos já decididos (Keycloak, e-mail futuro, calendário futuro), cada externo marcado como real ou planejado.

#### Scenario: Leitura do contexto

- **WHEN** alguém abre o C1
- **THEN** identifica atores, sistema e externos sem ler outros docs

### Requirement: Diagrama de contêineres real vs planejado

`docs/architecture/c2-container.md` SHALL conter diagrama Mermaid com Frontend Next.js (real, detalhando as rotas `/`, `/tratamentos`, `/tratamentos/[slug]` e `/sobre`), Backend NestJS, PostgreSQL e Keycloak (planejados), sem inventar contêineres fora de `docs/02`.

#### Scenario: Distinção real/planejado

- **WHEN** alguém abre o C2
- **THEN** distingue de imediato o que existe do que é plano

#### Scenario: Rotas visíveis no contêiner

- **WHEN** alguém pergunta quais páginas públicas existem
- **THEN** o C2 lista as 4 rotas reais sem precisar abrir o código

### Requirement: Diagrama de componentes do frontend real

`docs/architecture/c3-component.md` SHALL conter diagrama Mermaid dos componentes existentes (`app/` com as rotas reais, `components/` reutilizáveis, `features/` com `home`, `catalog`, `about` e `booking`, `lib/` com interfaces + mocks + acesso) e registrar que componentes internos do backend (Domain/Application/Infrastructure/Presentation) serão detalhados por módulo quando implementados.

#### Scenario: Mapeamento de código novo

- **WHEN** uma nova tela ou módulo é proposto
- **THEN** há um lugar canônico no diagrama para situá-lo

### Requirement: Nota de manutenção por camada

Cada um dos 3 arquivos SHALL terminar com a nota de que o diagrama deve ser atualizado no Verify de qualquer Change que altere sua camada.

#### Scenario: Change altera camada

- **WHEN** um Change toca frontend, backend ou integrações
- **THEN** a nota indica qual diagrama revisar no Verify
