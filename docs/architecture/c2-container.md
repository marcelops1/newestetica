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
        R5[/antes-depois<br/>casos com consentimento/]
        R6[/depoimentos<br/>depoimentos fictícios/]
        R7[/orcamento<br/>orçamento personalizado/]
        R8[/contato<br/>mensagem para a clínica/]
        R9[/blog<br/>conteúdo educativo/]
        R10[/blog/[slug]<br/>artigo/]
        CONTRACTS[contracts/<br/>schemas Zod]
        BE[Backend NestJS<br/>módulo Agendamento<br/>Clean Architecture]
        DB[(PostgreSQL)]
    end
    subgraph Planejado
        K[Keycloak + 2FA]
    end
    P -->|HTTPS| FE
    F -->|HTTPS| FE
    FE --- R1
    FE --- R2
    FE --- R3
    FE --- R4
    FE --- R5
    FE --- R6
    FE --- R7
    FE --- R8
    FE --- R9
    FE --- R10
    FE -.->|API REST futura — Épico 5| BE
    BE -->|valida entrada/saída| CONTRACTS
    BE -->|Repository + Data Mapper| DB
    BE -.->|OIDC futuro| K
    F -->|login| K
```

- **Real:** o Frontend com mocks e a camada de dados isolada pronta para a troca — rotas `/`, `/tratamentos`, `/tratamentos/[slug]`, `/sobre`, `/antes-depois`, `/depoimentos`, `/orcamento`, `/contato`, `/blog` e `/blog/[slug]` —, os contratos de API em `contracts/` (schemas Zod dos contextos já mockados), o **Backend NestJS** com o primeiro módulo real (Agendamento: `POST /slots/:slotId/bookings` e `GET /slots/available`, Clean Architecture com TDD por camada) e o **PostgreSQL** (persistência do módulo, com índice único parcial anti-overbooking).
- **Planejado:** Keycloak + 2FA e os demais módulos do backend; o frontend ainda não consome a API (troca dos mocks — Épico 5).
- Nenhum outro contêiner existe ou está previsto no MVP (sem microserviços, sem app nativo).

> Este diagrama deve ser atualizado como parte do Verify de qualquer Change que altere sua camada.
