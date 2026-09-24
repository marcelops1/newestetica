# Change: backend-modulo-catalogo

## Why

O catálogo de procedimentos hoje só existe como mock no frontend; sem fonte real, a integração do Épico 5 não tem o que consumir. É também o segundo módulo de backend — o primeiro a exercitar o checklist da seção 16 do docs/07 (este change foi proposto já sob a seção, citando-a no escopo).

## What Changes

- Novo módulo NestJS `catalog` em `backend/src/catalog/` com as quatro camadas (`domain/`, `application/`, `infrastructure/`, `presentation/`), construído nesta ordem com TDD estrito (docs/07 §15).
- **Só leitura pública nesta fatia**: listar procedimentos ativos, filtrar por categoria, buscar por slug. Escrita restrita a admin (CRUD) fica fora — YAGNI, sem necessidade imediata.
- Regra central: leitura pública nunca retorna item desativado. O flag `isActive` vive no backend (entidade de domínio + coluna); **o contrato não muda** — `ProcedureSchema` descreve a forma pública, que por definição nunca carrega item inativo, então nada a adicionar nele.
- Seed Prisma com o catálogo inicial (dados fictícios alinhados aos mocks) + `prisma db seed` configurado; testes inserem direto via repositório.
- Sem `UnitOfWork` (leituras de entidade única, sem operação multi-entidade), sem autenticação nas rotas públicas, sem `backend/Dockerfile` novo.
- Explicitamente fora: CRUD administrativo (Feature 2.4/Épico 2), autenticação/Keycloak, outros bounded contexts, migração do frontend (Épico 5).

## Capabilities

### New Capabilities

- `backend-catalog`: módulo de Catálogo do backend (listagem pública só de ativos com filtro e busca, persistência PostgreSQL, HTTP mínimo validado pelos contratos) — ver `specs/backend-catalog/spec.md`.

### Modified Capabilities

- Nenhuma (nenhum requirement existente muda).

## Impact

- Novos: `backend/src/catalog/{domain,application,infrastructure,presentation}/**`, modelo `Procedure` no `prisma/schema.prisma` + migration, seed do catálogo.
- Editados: `docs/product/08-backlog-produto.md` (UC 4.2.2 → Em andamento) no apply.
- Sem impacto no módulo `scheduling`, nos contratos, nos mocks ou nos specs existentes; nenhum import do frontend é trocado nesta change.
