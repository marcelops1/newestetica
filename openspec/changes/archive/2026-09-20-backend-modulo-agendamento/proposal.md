# Change: backend-modulo-agendamento

## Why

O Épico 4 foi liberado e os contratos de Agendamento já existem (`contracts/src/scheduling/`), mas `backend/` segue só com `AGENTS.md` — nenhum comportamento real existe. O módulo de Agendamento é o primeiro backend real e, como tal, fixa o padrão que todos os módulos seguintes (Catálogo, Pacientes etc.) vão copiar: se ele nascer torto (regra no ORM, teste sem RED, banco antes do domínio), o erro se multiplica por todo o Épico 4.

## What Changes

- Novo módulo NestJS `scheduling` em `backend/src/scheduling/` com as quatro camadas (`domain/`, `application/`, `infrastructure/`, `presentation/`), construído nesta ordem com TDD estrito (07 §15).
- Setup mínimo do backend antes das camadas (task 0): `package.json`, tsconfig, `main.ts`, módulo raiz e configuração de conexão — sem regra de negócio nessa task.
- Domain: entidades `Slot` e `Booking` + regra central sem overbooking (um slot não tem duas bookings confirmadas simultâneas); zero NestJS, zero ORM.
- Application: casos de uso (ex.: `CreateBookingUseCase`) contra interfaces de repositório do Domain (portas), testados com fake em memória — mais `NotificationPort` (confirmação por e-mail) com adapter fake/console; SMTP real fica para change futuro (decisão registrada no design).
- Infrastructure: implementação real dos repositórios contra PostgreSQL (ORM decidido no design: Prisma ou TypeORM, com Repository + Data Mapper, nunca Active Record), com testes de integração contra banco em container.
- Presentation: controllers mínimos com validação de entrada e saída pelos schemas Zod de `contracts/src/scheduling/`.
- Explicitamente fora: módulos dos outros bounded contexts; autenticação/Keycloak no backend; SMTP real; migração do frontend para a API (Épico 5); `backend/Dockerfile` e descomentar o serviço no compose (só quando o módulo existir e passar nos gates).

## Capabilities

### New Capabilities

- `backend-scheduling`: módulo de Agendamento do backend (entidades e regra sem overbooking, casos de uso contra portas, persistência PostgreSQL real, HTTP mínimo validado pelos contratos) — ver `specs/backend-scheduling/spec.md`.

### Modified Capabilities

- Nenhuma (nenhum requirement existente muda).

## Impact

- Novos: `backend/package.json` (+ deps NestJS, driver PG, `zod`, `@newestetica/contracts` via workspace), `backend/tsconfig*.json`, `backend/src/main.ts`, `backend/src/app.module.ts`, `backend/src/scheduling/{domain,application,infrastructure,presentation}/**`, `specs/backend-scheduling/spec.md`.
- Nova dependência de ORM (Prisma ou TypeORM — decisão no design) + Testcontainers ou equivalente para integração (decisão no design).
- Editados: `docs/product/08-backlog-produto.md` (UC 4.2.3 → Em andamento) no apply.
- Sem impacto em frontend, contratos, mocks ou dados; nenhum import do frontend é trocado nesta change.
