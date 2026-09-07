# C2 — Diagrama de Contêineres — Newestetica

Contêineres do sistema — o que é real hoje vs. planejado (`docs/02-arquitetura.md`).

```mermaid
flowchart TB
    P[Paciente<br/>navegador mobile-first]
    F[Equipe<br/>navegador]
    subgraph Real
        FE[Frontend Next.js<br/>App Router + TS + Tailwind<br/>mocks]
        R1[/<br/>home/]
        R2[/tratamentos<br/>catálogo/]
        R3[/tratamentos/[slug]<br/>detalhe/]
        R4[/sobre<br/>institucional/]
    end
    subgraph Planejado
        BE[Backend NestJS<br/>monolito modular]
        DB[(PostgreSQL)]
        K[Keycloak + 2FA]
    end
    P -->|HTTPS| FE
    F -->|HTTPS| FE
    FE --- R1
    FE --- R2
    FE --- R3
    FE --- R4
    FE -->|API REST futura| BE
    BE -->|Repository + Data Mapper| DB
    BE -->|OIDC| K
    F -->|login| K
```

- **Real:** somente o Frontend com mocks e a camada de dados isolada pronta para a troca — rotas `/`, `/tratamentos`, `/tratamentos/[slug]` e `/sobre`.
- **Planejado:** Backend, PostgreSQL e Keycloak entram após a validação visual, via contratos em `contracts/`.
- Nenhum outro contêiner existe ou está previsto no MVP (sem microserviços, sem app nativo).

> Este diagrama deve ser atualizado como parte do Verify de qualquer Change que altere sua camada.
