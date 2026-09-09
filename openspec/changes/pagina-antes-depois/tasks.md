## 1. Contrato de consentimento da rota (TDD estrito — RED comprovado antes de cada GREEN)

- [x] 1.1 RED: escrever `frontend/lib/__tests__/before-after.test.ts` importando `getBeforeAfterPageCases` de `../before-after` e asserindo que `resultado-3` (sem consentimento) nunca aparece e que todo caso listado tem `hasConsent` e painel completo, e verificar que a suite falha (módulo ainda inexistente)
- [x] 1.2 GREEN: implementar `frontend/lib/before-after.ts` com `getBeforeAfterPageCases()` delegando a `getVisibleResults()` e verificar que o teste da task 1.1 agora passa e a cobertura segue acima de 80%

## 2. Comparador compartilhado (refatoração sem comportamento — exceção docs/07 §4 registrada aqui)

> Exceção aplicável: mover código literal sem alterar classes nem comportamento; verificação por gates + build + revisão do diff, sem ciclo RED.

- [x] 2.1 Extrair `Comparator` de `Results.tsx` para `components/BeforeAfterComparator.tsx`, fazer a home usá-lo, e verificar que lint, typecheck, testes e build passam sem mudança visual

## 3. Página /antes-depois (consome o contrato testado na seção 1)

> Lógica testável (consentimento + conteúdo) coberta pelo teste 1.1; montagem de UI verificada por gates (sem testing-library no projeto — adicionar a dependência está fora do escopo).

- [x] 3.1 Implementar `features/results/ResultsPage.tsx` (lista via `getBeforeAfterPageCases`, comparador + badge de consentimento por caso, painel, CTA com `BookingModal`) e `app/antes-depois/page.tsx` com metadata, e verificar que lint, typecheck, testes e build passam
- [x] 3.2 Adicionar link "Ver todos os casos" na seção Resultados da home para `/antes-depois` e verificar que o link existe e o build passa

## 4. Backlog, C4, verificação e archive

- [x] 4.1 Atualizar `docs/product/08-backlog-produto.md` (UC 1.4.1) e `docs/architecture/c2-container.md` + `c3-component.md` (rota `/antes-depois`, `features/results/`, comparador compartilhado) e verificar que cada rota/pasta citada existe no repositório
- [ ] 4.2 Rodar quality gates e `openspec validate`, registrar revisão `security-and-hardening` (gatilho docs/07 §7: consentimento de imagem) em `verification.md`, e arquivar via `openspec-archive-change` com specs sincronizadas
