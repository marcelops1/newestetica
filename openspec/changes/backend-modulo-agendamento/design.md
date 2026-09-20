## Context

Ver `proposal.md` (Why). Ponto de partida verificado: `backend/` contém só `AGENTS.md` (greenfield total); `contracts/src/scheduling/` define `BookingInputSchema` (nome trim ≥2, telefone ≥10 dígitos, treatment/notes opcionais) e `SlotSchema` (id, start ISO com offset, durationMinutes inteiro positivo, available); `infra/docker/docker-compose.yml` sobe `postgres:16-alpine` em `127.0.0.1:5432` com healthcheck e deixa o serviço `backend` comentado (descomenta quando `backend/Dockerfile` existir — fora deste change); regras vigentes: regra de dependência 02 §7, Repository + Data Mapper em 04 §5 (Active Record vedado), ordem TDD por camada em 07 §15 (Domain → Application → Infrastructure → Presentation, banco por último), testes de integração contra PG real em container e contrato verificado nas duas pontas em 07 §13.

## Goals / Non-Goals

**Goals:**

- Primeiro módulo backend funcional (reservar sem overbooking, listar disponibilidade, notificar via porta) construído na ordem da seção 15, deixando o padrão copiável documentado pelo próprio código.

**Non-Goals:**

- Outros bounded contexts, autenticação/Keycloak, SMTP real, `backend/Dockerfile`, migração do frontend (Épico 5), versionamento de URL da API.

## Decisions

### 1. ORM: Prisma (com regra anticorrupção explícita)

Rationale: 04 §5 exige Repository + Data Mapper e veda Active Record — o que elimina o modo Active Record do TypeORM de saída e deixa Prisma vs TypeORM-DataMapper. Prisma vence por: migrations superiores em DX (`prisma migrate`, schema declarativo versionado), client type-safe gerado, e separação natural entre modelo de persistência (schema Prisma) e entidade de domínio (mapeamento manual no repositório = Data Mapper na prática). Alternativas consideradas: TypeORM no modo DataMapper (rejeitada — mais boilerplate, DX de migrations mais fraca, e o pacote carrega o modo Active Record como tentação permanente); Prisma Client usado direto em casos de uso (rejeitada — vaza persistência para a aplicação; regra anticorrupção: o client Prisma nunca sai de `infrastructure/`, todo acesso passa por classe de repositório que implementa a porta do Domain e mapeia para a entidade de domínio).

### 2. Estrutura exata de pastas

Rationale: espelha 02 §7 e `backend/AGENTS.md` §4 sem inventar níveis.

```text
backend/
├── package.json            → @nestjs/{common,core,platform-express}, reflect-metadata, rxjs,
│                             prisma + @prisma/client, pg (driver do Testcontainers), zod,
│                             @newestetica/contracts (workspace), vitest + @vitest/coverage-v8,
│                             typescript, eslint + typescript-eslint, prettier
├── tsconfig.json           → strict, decorators (experimentalDecorators, emitDecoratorMetadata),
│                             module commonjs (Node runtime), noEmit nos testes via vitest
├── tsconfig.build.json     → emit para dist/ (build por tsc, sem @nestjs/cli — YAGNI)
├── prisma/schema.prisma    → modelos Slot/Booking + índice único parcial (decisão 5)
├── src/
│   ├── main.ts             → bootstrap (ValidationPipe desligado: validação é Zod, não class-validator)
│   ├── app.module.ts       → registra SchedulingModule
│   └── scheduling/
│       ├── domain/
│       │   ├── entities/   → slot.entity.ts, booking.entity.ts (classes puras, sem decorators)
│       │   └── ports/      → slot.repository.ts, booking.repository.ts,
│       │                       notification.port.ts (interfaces + tipos de erro de domínio)
│       ├── application/
│       │   └── use-cases/  → create-booking.use-case.ts, list-availability.use-case.ts
│       ├── infrastructure/
│       │   ├── persistence/→ prisma.service.ts, slot.repository.impl.ts,
│       │   │                  booking.repository.impl.ts, mappers/ (prisma ↔ domínio)
│       │   └── notifications/ → fake (testes) + console (dev) adapters da NotificationPort
│       └── presentation/
│           └── controllers/→ scheduling.controller.ts (POST /bookings, GET /slots/available)
└── test/                   → helpers de integração (migrations + Testcontainers)
```

Alternativas consideradas: `nest-cli.json` + build pelo CLI (rejeitada — dependência e camada a mais sem necessidade; tsc basta); testes e2e em pasta separada por padrão Nest (rejeitada — este change usa vitest com `*.spec.ts` colocado e `*.int.spec.ts` para integração, um toolchain só, consistente com o repo).

### 3. Runner: Vitest em todo o backend (unit + integração)

Rationale: o repo inteiro já roda vitest com thresholds 80% e gates únicos; introduzir Jest seria segundo toolchain (contra YAGNI). `@nestjs/testing` (TestingModule) funciona sob vitest e é permitido fora do Domain. Alternativa considerada: Jest por convenção NestJS (rejeitada — duplica runner, config e cobertura sem ganho).

### 4. Concorrência: constraint única parcial no banco + pré-checagem amigável

Rationale: a pré-checagem na aplicação ("slot livre?") sozinha tem TOCTOU — duas reservas concorrentes passam juntas. A aplicação do padrão é: caso de uso checa disponibilidade (erro amigável 409 quando ocupado) E o banco impõe índice único parcial (uma booking confirmada por slot) como executor final; violação do constraint vira o mesmo erro de domínio. Alternativas consideradas: só pré-checagem (rejeitada — overbooking sob corrida); `SELECT FOR UPDATE` pessimista (rejeitada — serializa throughput sem necessidade para este volume; o constraint é mais simples e igualmente correto); coluna de versão otimista (rejeitada — mecanismo equivalente com mais peças móveis).

### 5. Tipos do Domain independentes dos contratos

Rationale: 02 §7 proíbe `domain/` de importar qualquer coisa fora dele — inclusive `@newestetica/contracts`. O Domain define seus próprios tipos; o mapeamento contrato↔domínio vive na Presentation (entrada) e na saída dos casos de uso. Alternativa considerada: importar tipos do contracts no Domain (rejeitada — viola a regra de dependência e acopla o núcleo ao pacote compartilhado).

### 6. Notificação: porta no Domain, fake + console agora, SMTP depois

Rationale: decisão do usuário na proposta — UC 4.2.3 exige confirmação por e-mail, mas SMTP real (provedor, segredos, retries) é integração própria. `NotificationPort` (interface no Domain) + fake (testes) + console (dev) cumprem o fluxo agora; o adapter SMTP nasce em change futuro sem tocar Domain/Application. Alternativa considerada: SMTP real neste change (rejeitada pelo usuário — escopo); nenhuma porta (rejeitada — o caso de uso perderia o gancho e o UC ficaria sem o disparo testável).

### 7. Superfície HTTP mínima e mapeamento de erros

Rationale: só o que o UC exige — `POST /bookings` (cria reserva) e `GET /slots/available` (lista disponibilidade); sem prefixo de versão (mesma regra dos contratos: sem tráfego real versionado, sem `/v1`). Mapeamento: payload inválido (Zod) → 422 estruturado; slot inexistente → 404; slot ocupado/conflito de concorrência → 409; erro inesperado → 500 genérico sem internals. Alternativa considerada: expor CRUD de slots para a admin (rejeitada — Feature 2.3, outro change).

## Risks / Trade-offs

- [Risco] Teste de concorrência flaky → Mitigação: N tentativas paralelas reais contra o banco de teste com constraint única; assert determinístico (exatamente 1 vencedora); banco de teste isolado por execução com migrations aplicadas.
- [Risco] Testcontainers indisponível no executor → Mitigação: 07 §13 já prevê fallback para o compose (`infra/docker/`); a task de setup detecta e registra qual veículo foi usado.
- [Risco] Prisma engines offline no CI → Mitigação: `prisma generate` no postinstall com lockfile congelado; runners GH têm rede; divergência vira erro visível, não silencioso.
- [Trade-off] Prisma Client gerado é código fora do repo → aceito: `prisma generate` versionado via schema + lockfile; o client nunca cruza `infrastructure/`.
- [Trade-off] UC 4.2.3 segue "Em andamento" (sem SMTP real, sem consumo pelo frontend) → aceito e registrado: este change entrega reserva/notificação-via-porta, não a jornada ponta a ponta.

## Migration Plan

Sem migração: código novo, sem consumidores. O frontend continua nos mocks; `backend/Dockerfile` e o serviço no compose ficam para change futuro. Rollback = reverter o merge.

## Open Questions

Nenhuma bloqueante. Questões deliberadamente adiadas (não mudam estes artefatos): provedor SMTP (change futuro), criação de slots pela admin via API (Feature 2.3), autenticação do backend (Feature 4.2 de Identidade).
