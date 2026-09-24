# C3 — Diagrama de Componentes — Frontend (real)

Componentes existentes do frontend (`frontend/`). O backend será detalhado por módulo quando implementado.

```mermaid
flowchart LR
    subgraph Rotas
        R1[/]
        R2[/tratamentos/]
        R3[/tratamentos/[slug]/]
        R4[/sobre/]
        R5[/antes-depois/]
        R6[/depoimentos/]
        R7[/orcamento/]
        R8[/contato/]
        R9[/blog/]
        R10[/blog/[slug]/]
        APP[app/<br/>rotas e páginas]
    end
    subgraph UI
        COMP[components/<br/>reutilizáveis]
        HOME[features/home/]
        CAT[features/catalog/]
        ABOUT[features/about/]
        RES[features/results/<br/>página antes-depois/]
        TEST[features/testimonials/<br/>página depoimentos/]
        QUO[features/quote/<br/>página orçamento/]
        CONT[features/contact/<br/>página contato/]
        BLOG[features/blog/<br/>páginas blog/]
        BOOK[features/booking/<br/>modal/]
    end
    subgraph Dados
        LIB[lib/<br/>interfaces + mocks + acesso]
    end
    subgraph Estilo
        STY[styles/<br/>tokens]
    end
    R1 --> HOME
    R2 --> CAT
    R3 --> CAT
    R4 --> ABOUT
    R5 --> RES
    R6 --> TEST
    R7 --> QUO
    R8 --> CONT
    R9 --> BLOG
    R10 --> BLOG
    APP --> HOME
    APP --> CAT
    APP --> ABOUT
    APP --> RES
    APP --> TEST
    APP --> QUO
    APP --> CONT
    APP --> BLOG
    APP --> COMP
    HOME --> COMP
    CAT --> COMP
    ABOUT --> COMP
    RES --> COMP
    TEST --> COMP
    QUO --> BOOK
    CONT --> BOOK
    BLOG --> BOOK
    BOOK --> LIB
    HOME --> LIB
    CAT --> LIB
    ABOUT --> LIB
    RES --> LIB
    TEST --> LIB
    QUO --> LIB
    CONT --> LIB
    BLOG --> LIB
    COMP --> STY
    HOME --> STY
    CAT --> STY
    ABOUT --> STY
    RES --> STY
    TEST --> STY
    QUO --> STY
    CONT --> STY
    BLOG --> STY
```

- Pastas verificadas no repositório: `app/` (com `/`, `/tratamentos`, `/tratamentos/[slug]`, `/sobre`, `/antes-depois`, `/depoimentos`, `/orcamento`, `/contato`, `/blog`, `/blog/[slug]`), `components/` (incluindo o comparador antes/depois e o filtro de categoria compartilhados), `features/` (`home`, `catalog`, `about`, `booking`, `results`, `testimonials`, `quote`, `contact`, `blog`), `lib/` (interfaces + mocks + acesso + helpers de domínio, ex. iniciais, contratos e submissões de orçamento e contato, busca e data do blog), `styles/`.
- Regra: componentes consomem `lib/` via interfaces; trocar mocks pela API altera só `lib/`.

## Backend (real — módulo Agendamento)

Primeiro módulo do backend, em Clean Architecture com TDD por camada (`docs/engineering/07-workflow-de-engenharia.md` §15). Regra de dependência verificada: `domain/` não importa nada de fora; `application/` só depende de `domain/`; `infrastructure/` implementa as portas do `domain/`; `presentation/` depende de `application/`.

```mermaid
flowchart LR
    subgraph Presentation
        CTRL[scheduling.controller.ts<br/>POST /slots/:slotId/bookings<br/>GET /slots/available]
        PIPE[ZodValidationPipe<br/>422 estruturado]
        FILTER[DomainExceptionFilter<br/>404 / 409]
    end
    subgraph Application
        UC1[CreateBookingUseCase]
        UC2[ListAvailabilityUseCase]
    end
    subgraph Domain
        E1[Slot]
        E2[Booking]
        P1[SlotRepository]
        P2[BookingRepository]
        P3[NotificationPort]
        P4[UnitOfWork]
    end
    subgraph Infrastructure
        R1[PrismaSlotRepository]
        R2[PrismaBookingRepository]
        UOW[PrismaUnitOfWork]
        CTX[PrismaTransactionContext<br/>AsyncLocalStorage]
        NOTIF[ConsoleNotificationAdapter]
        MAP[mappers + Prisma Client<br/>PostgreSQL]
    end
    CONTRACTS[contracts/<br/>schemas Zod]
    CTRL --> PIPE
    CTRL --> FILTER
    CTRL --> UC1
    CTRL --> UC2
    PIPE -.->|valida entrada| CONTRACTS
    UC1 --> P1
    UC1 --> P2
    UC1 --> P3
    UC1 --> P4
    UC2 --> P1
    R1 -.->|implementa| P1
    R2 -.->|implementa| P2
    UOW -.->|implementa| P4
    NOTIF -.->|implementa| P3
    R1 --> CTX
    R2 --> CTX
    UOW --> CTX
    R1 --> MAP
    R2 --> MAP
```

- Pastas verificadas: `backend/src/scheduling/` com `domain/` (entidades `Slot`/`Booking`, erros e portas), `application/use-cases/` (dois casos de uso), `infrastructure/` (repos Prisma, mappers, `PrismaUnitOfWork`, `PrismaTransactionContext`, adapter de notificação) e `presentation/` (controller, pipe Zod, filtro de domínio).
- **Wiring:** `SchedulingModule` registra o `PrismaTransactionContext` como provider **singleton** compartilhado entre a `UnitOfWork` e os repositórios — a propagação do client transacional via `AsyncLocalStorage` depende dessa instância única (há teste-canário de write-then-throw contra os providers reais do módulo).
- **Sem Keycloak ainda:** o módulo não tem autenticação (Feature 4.2 de Identidade e Acesso).

## Backend (real — módulo Catálogo)

Segundo módulo do backend, mesma Clean Architecture com TDD por camada (`docs/engineering/07-workflow-de-engenharia.md` §15). Recorte desta entrega: **leitura pública** (o CRUD administrativo do UC 4.2.2 nasce com Identidade e Acesso). Regra de dependência verificada: `domain/` não importa nada de fora; `application/` só depende de `domain/`; `infrastructure/` implementa as portas do `domain/`; `presentation/` depende de `application/`.

```mermaid
flowchart LR
    subgraph Presentation
        CTRL[catalog.controller.ts<br/>GET /procedures<br/>GET /procedures/:slug]
        PIPE[ZodValidationPipe<br/>422 estruturado]
        FILTER[DomainExceptionFilter<br/>404]
    end
    subgraph Application
        UC1[ListProceduresUseCase]
        UC2[GetProcedureBySlugUseCase]
    end
    subgraph Domain
        E1[Procedure<br/>isActive interno]
        P1[ProcedureRepository<br/>findActive / findActiveByCategory / findActiveBySlug]
    end
    subgraph Infrastructure
        R1[PrismaProcedureRepository<br/>ordenação name asc]
        MAP[procedure.mapper + Prisma Client<br/>PostgreSQL]
    end
    CONTRACTS[contracts/<br/>ProcedureSchema]
    CTRL --> PIPE
    CTRL --> FILTER
    CTRL --> UC1
    CTRL --> UC2
    PIPE -.->|valida entrada| CONTRACTS
    CTRL -.->|saída = Procedure do contrato<br/>isActive fora do wire| CONTRACTS
    UC1 --> P1
    UC2 --> P1
    R1 -.->|implementa| P1
    R1 --> MAP
```

- Pastas verificadas: `backend/src/catalog/` com `domain/` (entidade `Procedure`, erros locais, porta de leitura), `application/use-cases/` (dois casos de uso), `infrastructure/persistence/` (repositório Prisma + mapper) e `presentation/` (controller, pipe Zod e filtro de domínio **locais do módulo** — bounded contexts não compartilham apresentação).
- **Wiring:** `CatalogModule` cria o próprio `PrismaClient` (trade-off dos dois pools registrado no módulo; candidato a provider compartilhado quando o 3º módulo chegar). Sem `UnitOfWork`: leitura de entidade única não precisa de transação.
- **Sem Keycloak ainda:** leitura pública por desenho (UC 4.2.2); a escrita nasce com Identidade e Acesso.

## Backend (placeholder normatizado)

Quando cada módulo for implementado, detalhar aqui suas camadas — Domain, Application, Infrastructure, Presentation (`docs/02-arquitetura.md` §7) — módulo a módulo, não antes.

> Este diagrama deve ser atualizado como parte do Verify de qualquer Change que altere sua camada.
