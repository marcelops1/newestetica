# Change: pagina-depoimentos

## Why

O Use Case 1.5.1 (Depoimentos, Épico 1) existe só como seção na home com 3 cards; prova social é um dos antídotos centrais aos medos do público 40–60 (artificialidade, pressão comercial), e a paciente não tem onde ler mais relatos com calma. Padrão espelhado no já validado `/antes-depois`.

## What Changes

- Nova rota pública `/depoimentos` (`frontend/app/depoimentos/page.tsx` + `frontend/features/testimonials/TestimonialsPage.tsx`) listando todos os depoimentos com avaliação em estrelas (5/5 padrão), citação, avatar de iniciais fictícias e contexto — mobile-first, tom acolhedor, sem dado real.
- Extensão de `testimonialsMock` com 2 depoimentos fictícios adicionais (total 5), mesmos campos e padrão "Primeiro nome + inicial" — sem mudança de contrato.
- Extração de `initialsOf` de `Testimonials.tsx` para `lib/testimonials.ts` junto de `getTestimonialsPageCases()`, com correção de edge case real: hoje `initialsOf("Maria  Silva")` (espaço duplo) produz `"Mundefined"`.
- `Testimonials.tsx` passa a consumir o helper extraído (sem duplicação); link "Ver todos os depoimentos" na seção da home apontando para a nova página (header intocado).
- Testes por prioridade (docs/07 §13): unitários com edge cases (helper de iniciais: nome único, múltiplos espaços, 3+ partes), contrato/schema (seletor como fronteira mock ↔ UI), OWASP (texto livre do mock renderizado como texto — auto-escape, sem HTML cru) e integração da navegação home → `/depoimentos`.
- Sem backend, sem foto real, sem nome completo real.
- Atualiza `docs/product/08-backlog-produto.md` (UC 1.5.1) e C2/C3 (nova rota + `features/testimonials/`) no mesmo change.

## Capabilities

### New Capabilities

- Nenhuma (página nova dentro de capabilities existentes).

### Modified Capabilities

- `public-site-structure`: ADDED — página `/depoimentos`; MODIFIED — seção de depoimentos da home ganha link "Ver todos os depoimentos".
- `architecture-docs`: MODIFIED — C2 lista a rota `/depoimentos`; C3 registra `features/testimonials/` e o helper de iniciais em `lib/`.
- `mock-data`: sem delta — extensão só adiciona itens fictícios com os mesmos campos; nenhum requirement muda.

## Impact

- Arquivos novos: `app/depoimentos/page.tsx`, `features/testimonials/TestimonialsPage.tsx`, `lib/testimonials.ts` (+ teste).
- Arquivos alterados: `lib/mocks/testimonials.ts` (+2 itens), `features/home/sections/Testimonials.tsx` (helper extraído + link), `docs/08`, C2, C3.
- Nenhum contrato, backend ou tipo alterado; `getTestimonials()` continua a fonte.
