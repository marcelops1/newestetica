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
    FE --- R5
    FE --- R6
    FE --- R7
    FE --- R8
    FE --- R9
    FE --- R10
    FE -->|API REST futura| BE
    BE -->|Repository + Data Mapper| DB
    BE -->|OIDC| K
    F -->|login| K
```

- **Real:** o Frontend com mocks e a camada de dados isolada pronta para a troca — rotas `/`, `/tratamentos`, `/tratamentos/[slug]`, `/sobre`, `/antes-depois`, `/depoimentos`, `/orcamento`, `/contato`, `/blog` e `/blog/[slug]` — e os contratos de API em `contracts/` (schemas dos contextos já mockados: Catálogo, Agendamento e Conteúdo Público), com testes de contrato contra os mocks.
- **Planejado:** Backend, PostgreSQL e Keycloak entram no Épico 4 implementando os contratos de `contracts/`.
- Nenhum outro contêiner existe ou está previsto no MVP (sem microserviços, sem app nativo).

> Este diagrama deve ser atualizado como parte do Verify de qualquer Change que altere sua camada.
