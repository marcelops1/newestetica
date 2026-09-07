## Context

Ver `proposal.md` (Why). Ponto de partida: seção `Treatments` na home (filtro por categoria, CTA via `onBook`), `lib/data.ts` com `getProcedures()`/`getProceduresByCategory()`, `lib/booking.ts` com `submitBookingRequest()`/`resolveTreatment()` e `BookingModal` com 4 estados. Restrição: reaproveitar tudo; nada de backend.

## Goals / Non-Goals

**Goals:**

- Página e detalhe consistentes com a home, sem duplicar lógica de filtro, card ou agendamento.

**Non-Goals:**

- Novos mocks de conteúdo; novo fluxo de agendamento; contratos; SEO avançado além de metadados básicos.

## Decisions

### 1. Extrair `TreatmentCard` + `CategoryFilter` para `components/` e reusar na home

Rationale: uma fonte única de card/filtro evita divergência visual e de comportamento entre home e catálogo.
Alternativas consideradas: duplicar na página (rejeitado: divergência futura) e generalizar demais (rejeitado: over-engineering).

### 2. Busca client-side sobre os mocks carregados

Rationale: catálogo pequeno e local; filtro em memória é instantâneo e sem rede, coerente com a fase de mocks.
Alternativas consideradas: query param server-side (rejeitado: complexidade sem benefício com mocks).

### 3. Slug = `id` do mock, detalhe via novo acessor `getProcedureBySlug()`

Rationale: ids já são kebab-case estáveis; acessor isolado em `lib/` mantém a troca futura pela API num ponto só.
Alternativas consideradas: slug separado do id (rejeitado: campo redundante nesta fase).

### 4. Zero código novo de agendamento

Rationale: `BookingModal` + `submitBookingRequest()` já cobrem os 4 estados, validação, trap e pré-seleção; o catálogo só chama com o nome do procedimento.
Alternativas consideradas: modal próprio do catálogo (rejeitado: duplicação).

## Risks / Trade-offs

- [Risco] Refator da home quebrar o visual validável → Mitigação: extração preservando classes e comportamento; paridade conferida no `dev`.
- [Risco] Busca sem normalização falhar com acentos → Mitigação: normalizar (lowercase + sem diacríticos) nos testes desde o início.
- [Trade-off] Detalhe sem fotos reais → Aceito: blocos locais como na home, até fotos com consentimento.
