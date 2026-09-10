## 1. Contrato da rota e helper de iniciais (TDD estrito — RED comprovado antes de cada GREEN; docs/07 §13: unitários com edge cases + contrato/schema)

- [x] 1.1 RED: escrever `frontend/lib/__tests__/testimonials.test.ts` testando `getTestimonialsPageCases` (lista não-vazia com ao menos 5 itens, todo campo string não-vazia) e `initialsOf` (nome único `"Ana"` → `"A"`; espaço duplo `"Maria  Silva"` → `"MS"` — bug real atual produz `"Mundefined"`; 3 partes `"Maria Silva Santos"` → `"MS"`) e verificar que a suite falha (módulo ainda inexistente)
- [x] 1.2 GREEN: implementar `frontend/lib/testimonials.ts` (`initialsOf` filtrando partes vazias + `getTestimonialsPageCases()` delegando a `getTestimonials()`) e estender `testimonialsMock` com 2 depoimentos fictícios (mesmos campos, padrão "Primeiro nome + inicial", sem dado real), e verificar que o teste da task 1.1 passa, os testes de contrato existentes (`data.test.ts`) seguem passando e a cobertura fica acima de 80%

## 2. Página /depoimentos e link na home (lógica testada na seção 1; montagem de UI por gates — sem testing-library no projeto, lacuna registrada no design)

- [x] 2.1 Implementar `features/testimonials/TestimonialsPage.tsx` (client component padrão `AboutPage`: lista via `getTestimonialsPageCases`, estrelas 5/5, iniciais via helper, citação, contexto, Header/Footer/BookingModal — refinamento de design registrado) e `app/depoimentos/page.tsx` com metadata, e verificar que lint, typecheck, testes e build passam com `/depoimentos` prerenderizada
- [x] 2.2 Fazer `Testimonials.tsx` usar `initialsOf` de `lib/testimonials.ts` (sem duplicação — comportamento idêntico para os autores atuais) e adicionar link "Ver todos os depoimentos" para `/depoimentos`, e verificar com `grep` que não existe `innerHTML`/`dangerouslySetInnerHTML` no frontend (OWASP: auto-escape) e que o build passa

## 3. Backlog, C4, verificação e archive (docs/07 §13: integração de navegação coberta pelo build+grep; OWASP registrado em verification.md; mutation/falha-resiliência dispensados com registro)

- [ ] 3.1 Atualizar `docs/product/08-backlog-produto.md` (UC 1.5.1) e `docs/architecture/c2-container.md` (rota `/depoimentos`) + `c3-component.md` (`features/testimonials/`, helper em `lib/`), e verificar que cada rota/pasta citada existe no repositório
- [ ] 3.2 Rodar quality gates e `openspec validate`, registrar em `verification.md` o OWASP (texto livre renderizado como texto, sem HTML cru) e as dispensas (mutation, falha/resiliência, E2E, carga) com justificativa, e arquivar via `openspec-archive-change` com specs sincronizadas
