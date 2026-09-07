## Purpose

Fornece o mapa visual da arquitetura em 3 níveis C4, distinguindo o implementado do planejado para orientar IAs e desenvolvedores.

## ADDED Requirements

### Requirement: Diagrama de contexto com atores e externos

`docs/architecture/c1-context.md` SHALL conter diagrama Mermaid do sistema, atores (Paciente, Fabiana/Admin) e sistemas externos já decididos (Keycloak, e-mail futuro, calendário futuro), cada externo marcado como real ou planejado.

#### Scenario: Leitura do contexto

- **WHEN** alguém abre o C1
- **THEN** identifica atores, sistema e externos sem ler outros docs

### Requirement: Diagrama de contêineres real vs planejado

`docs/architecture/c2-container.md` SHALL conter diagrama Mermaid com Frontend Next.js (real), Backend NestJS, PostgreSQL e Keycloak (planejados), sem inventar contêineres fora de `docs/02`.

#### Scenario: Distinção real/planejado

- **WHEN** alguém abre o C2
- **THEN** distingue de imediato o que existe do que é plano

### Requirement: Diagrama de componentes do frontend real

`docs/architecture/c3-component.md` SHALL conter diagrama Mermaid dos componentes existentes (`app/`, `components/`, `features/`, `lib/`, camada de dados) e registrar que componentes internos do backend (Domain/Application/Infrastructure/Presentation) serão detalhados por módulo quando implementados.

#### Scenario: Mapeamento de código novo

- **WHEN** uma nova tela ou módulo é proposto
- **THEN** há um lugar canônico no diagrama para situá-lo

### Requirement: Nota de manutenção por camada

Cada um dos 3 arquivos SHALL terminar com a nota de que o diagrama deve ser atualizado no Verify de qualquer Change que altere sua camada.

#### Scenario: Change altera camada

- **WHEN** um Change toca frontend, backend ou integrações
- **THEN** a nota indica qual diagrama revisar no Verify
