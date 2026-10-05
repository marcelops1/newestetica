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
        BE[Backend NestJS<br/>módulos Agendamento, Catálogo,<br/>Conteúdo Público, Pacientes,<br/>Atendimento, Financeiro<br/>e Identidade e Acesso<br/>Clean Architecture]
        DB[(PostgreSQL)]
        K[Keycloak + 2FA<br/>realm versionado no compose]
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
    BE -->|valida JWT via JWKS<br/>RBAC por papel| K
    F -.->|login do painel — Épico 5| K
```

- **Real:** o Frontend com mocks e a camada de dados isolada pronta para a troca — rotas `/`, `/tratamentos`, `/tratamentos/[slug]`, `/sobre`, `/antes-depois`, `/depoimentos`, `/orcamento`, `/contato`, `/blog` e `/blog/[slug]` —, os contratos de API em `contracts/` (schemas Zod dos contextos já mockados) e o **Backend NestJS** com os módulos reais, todos em Clean Architecture com TDD por camada: **(1) Agendamento** (`POST /slots/:slotId/bookings` e `GET /slots/available`), **(2) Catálogo** (`GET /procedures` e `GET /procedures/:slug`, leitura só de itens ativos, com `isActive` interno e fora do contrato de saída), **(3) Conteúdo Público** (`GET /testimonials`, `GET /posts`, `GET /posts/:slug` e `GET /before-after`, leitura pública com antes/depois somente com consentimento explícito — invariante em três camadas: default `false` no banco, filtro na query e validação de saída contra o contrato público), **(4) Pacientes** (`POST /patients`, `GET /patients`, `GET /patients/:id`, `PATCH /patients/:id` e `DELETE /patients/:id` — CRUD administrativo com PII mínima, anonimização via delete e **autenticação real** — JWT do Keycloak e RBAC: leitura para `admin`/`reception`, escrita/anonimização só `admin`), **(5) Atendimento/Histórico** (`POST /patients/:patientId/attendances`, `GET /patients/:patientId/attendances` e `GET /patients/:patientId/attendances/:id` — histórico **imutável** com visibilidade herdada do paciente, provada por write-then-throw em duas camadas — porta `PatientDirectory` + filtro de relação na query — e autenticação real com RBAC operacional `admin`/`reception`), **(6) Financeiro Básico** (`GET /finance/summary?from=&to=` — resumo agregado por janela (teto de 366 dias) com `currency: "BRL"`, `totalCents` e `count`, **sem PII/breakdown por construção**, agregação pura no domínio e leitura pela porta própria com **visibilidade herdada na query**; autenticação real, RBAC **`admin`-only**), **(7) Identidade e Acesso** (validação do JWT do Keycloak por JWKS — assinatura, emissor, audiência, expiração e allowlist `RS256` — com **RBAC por papel e negação por padrão**; guard no kernel substituiu o `IdentityPendingGuard` nos três módulos administrativos; **2FA exigido no realm versionado e provado** contra o Keycloak real) e o **PostgreSQL** (persistência dos módulos, índice único parcial anti-overbooking, FK de Atendimento para Pacientes e coluna `amountCents` no Atendimento).
- **Real (infra local):** **Keycloak + 2FA** sobe no compose (`infra/docker/keycloak/realm-newestetica.json`) com papéis `admin`/`reception`, client público e fluxo de autenticação com OTP obrigatório; o backend valida os tokens reais — o login do painel no frontend é o que falta (Épico 5).
- **Planejado:** login do painel no frontend (Épico 5), troca dos mocks pela API e demais módulos do backend.
- Nenhum outro contêiner existe ou está previsto no MVP (sem microserviços, sem app nativo).

> Este diagrama deve ser atualizado como parte do Verify de qualquer Change que altere sua camada.
