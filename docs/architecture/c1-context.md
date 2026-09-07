# C1 — Diagrama de Contexto — Newestetica

O sistema Newestetica, seus atores e os sistemas externos já decididos (`docs/02-arquitetura.md`, `docs/04-decisoes-tecnicas.md`).

```mermaid
flowchart LR
    subgraph Atores
        P[Paciente<br/>mulher 40–60]
        F[Fabiana / Equipe<br/>admin e recepção]
    end
    subgraph Externos
        K[Keycloak<br/>planejado]
        E[E-mail transacional<br/>planejado]
        C[Calendário Google/iPhone<br/>planejado, desejável]
        W[WhatsApp<br/>link, sem API no MVP]
    end
    subgraph Sistema
        N((Newestetica))
    end
    P -->|agenda, consulta, pede orçamento| N
    F -->|opera agenda, pacientes, financeiro| N
    N -->|autenticação admin| K
    N -->|confirmações| E
    N -->|convites de agenda| C
    N -->|link de contato| W
```

- **Paciente:** agenda sozinha, consulta catálogo, pede orçamento, lê conteúdo.
- **Fabiana/Equipe:** controla slots, pacientes, procedimentos, histórico, financeiro e usuários.
- Externos marcados como **planejado** ainda não existem; o link de WhatsApp é o único contato real no MVP.

> Este diagrama deve ser atualizado como parte do Verify de qualquer Change que altere sua camada.
