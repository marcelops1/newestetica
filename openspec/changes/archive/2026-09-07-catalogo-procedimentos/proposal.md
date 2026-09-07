# Change: catalogo-procedimentos

## Why

A home apresenta tratamentos só como seção-resumo; o MVP (`docs/product/00`, §6.1) exige Catálogo próprio com descrição clara de cada procedimento. Sem página dedicada, a paciente não aprofunda o que esperar — barreira direta aos medos de dor, preço e artificialidade (persona `docs/product/01`).

## What Changes

- Nova rota pública `/tratamentos`: lista completa dos procedimentos reaproveitando os mocks existentes, com filtro por categoria e busca por nome.
- Rota de detalhe `/tratamentos/[slug]`: o que é, o que esperar (conforto, tempo, cuidados), duração e CTA de agendar.
- CTA de agendar abre o `BookingModal` existente com pré-seleção via `resolveTreatment`; envio via `submitBookingRequest` — zero código novo de agendamento.
- Componentes de card/filtro extraídos para reutilização entre home e catálogo, sem mudar o visual da home.
- Mobile-first, tom acolhedor, tokens existentes; mocks apenas, sem backend nem contratos novos.
- Explicitamente fora: backend, contratos, painel admin, orçamento, outras páginas.

## Capabilities

### New Capabilities

- Nenhuma (reuso das existentes).

### Modified Capabilities

- `public-site-structure`: ADDED — página de Catálogo (`/tratamentos`), detalhe por slug, busca por nome; reuso de `BookingModal` no catálogo.
- `mock-data`: ADDED — busca de procedimento por slug/id para a página de detalhe (novo acessor sobre os mesmos mocks).
