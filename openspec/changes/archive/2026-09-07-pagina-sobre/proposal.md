# Change: pagina-sobre

## Why

O MVP (`docs/product/00`, §6.1) exige a página Sobre com história, formação e valores, e o backlog (UC 1.2.1) está Não iniciado. Sem ela, a paciente não conhece quem cuida dela — elo fraco na confiança que a persona (`docs/product/01`) exige antes de agendar.

## What Changes

- Nova rota pública `/sobre`: hero institucional, história da clínica (mock fictício), formação/valores da Fabiana (fictício), diferenciais resumidos e CTA para agendamento via `BookingModal` existente.
- Segue tokens, `SectionHeader`, `CTAButton`, Header/Footer e tom já usados na home e no catálogo; conteúdo 100% fictício, sem dado real de pessoa.
- Mobile-first, legível, sem backend nem dado novo de mock além de textos da página.
- Explicitamente fora: backend, contratos, outras páginas, fotos reais, mudança de escopo.

## Capabilities

### New Capabilities

- Nenhuma (reuso das existentes).

### Modified Capabilities

- `public-site-structure`: ADDED — página Sobre (`/sobre`) com seções institucionais e CTA via modal existente.
