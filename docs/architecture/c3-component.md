# C3 — Diagrama de Componentes — Frontend (real)

Componentes existentes do frontend (`frontend/`). O backend será detalhado por módulo quando implementado.

```mermaid
flowchart LR
    subgraph Rotas
        APP[app/<br/>rotas e páginas]
    end
    subgraph UI
        COMP[components/<br/>reutilizáveis]
        FEAT[features/<br/>por domínio]
    end
    subgraph Dados
        LIB[lib/<br/>interfaces + mocks + acesso]
    end
    subgraph Estilo
        STY[styles/<br/>tokens]
    end
    APP --> FEAT
    APP --> COMP
    FEAT --> COMP
    FEAT --> LIB
    COMP --> STY
    FEAT --> STY
```

- Pastas verificadas no repositório: `app/`, `components/`, `features/`, `lib/`, `styles/`.
- Regra: componentes consomem `lib/` via interfaces; trocar mocks pela API altera só `lib/`.

## Backend (placeholder normatizado)

Quando cada módulo for implementado, detalhar aqui suas camadas — Domain, Application, Infrastructure, Presentation (`docs/02-arquitetura.md` §7) — módulo a módulo, não antes.

> Este diagrama deve ser atualizado como parte do Verify de qualquer Change que altere sua camada.
