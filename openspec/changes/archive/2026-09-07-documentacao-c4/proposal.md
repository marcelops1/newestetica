# Change: documentacao-c4

## Why

A arquitetura do Newestetica vive hoje dispersa em texto (`docs/02`, `docs/04`) sem uma visão diagramada por níveis. Documentar os 3 primeiros níveis C4 em `docs/architecture/` dá a futuras IAs e desenvolvedores um mapa visual do que é real (frontend) versus planejado (backend, Keycloak, integrações), antes que a implementação do backend comece.

## What Changes

- Novos arquivos `docs/architecture/c1-context.md`, `c2-container.md` e `c3-component.md`, cada um com diagrama Mermaid + texto de apoio.
- C1: sistema, atores (Paciente, Fabiana/Admin) e sistemas externos já decididos (Keycloak, e-mail futuro, calendário futuro) marcados como "planejado".
- C2: contêineres Frontend Next.js (real), Backend NestJS, PostgreSQL e Keycloak (planejados) — nada além do que `docs/02` prevê.
- C3: componentes reais do frontend (`app/`, `components/`, `features/`, `lib/`); backend registrado como "a detalhar por módulo quando implementado".
- Nível 4 (Code) explicitamente fora — cedo demais.
- Nota de manutenção ao final de cada arquivo: atualizar o diagrama no Verify de qualquer Change que altere a camada.
- Explicitamente fora: backend, telas, rotas, mudança de escopo, alteração de decisões vigentes.

## Capabilities

### New Capabilities

- `architecture-docs`: documentação C4 do projeto em `docs/architecture/` (níveis 1–3 em Mermaid) com regra de manutenção por camada.

### Modified Capabilities

- Nenhuma (nenhum requirement existente muda de comportamento).

## Impact

- Pastas afetadas: `docs/architecture/` (nova). Nada de código, nada de specs de comportamento.
- Proposta no `design.md`: novo gatilho na Definition of Done (`docs/07` §6) exigindo atualização dos diagramas — sem amarração de skill, pois `documentation-and-adrs` não está instalada.
