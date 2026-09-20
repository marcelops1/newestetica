## 1. Pacote contracts (test-first)

- [x] 1.1 Escrever o teste de fumaça do pacote (importa `@newestetica/contracts` e valida um procedimento fictício) e verificar que ele falha porque `contracts/` não tem código — RED. Verificação: `pnpm --filter contracts test` falha com módulo inexistente. Execução 2026-09-20: `pnpm --filter contracts test` → `No projects matched the filters` (pacote inexistente); após o scaffold sem `index.ts` → `Failed to resolve entry for package "@newestetica/contracts"` (RED real do import). Reconciliação: a validação do procedimento fictício migrou para a task 2.1 (o schema só nasce na 2.2); aqui o teste de fumaça prova a resolução do pacote no workspace
- [x] 1.2 Criar `contracts/package.json` (nome `@newestetica/contracts`, dep `zod`, scripts `test`/`lint`/`typecheck`), tsconfig seguindo o padrão do monorepo e `src/index.ts` raiz, e verificar que o teste da task 1.1 agora passa — GREEN. Verificação: `pnpm --filter contracts test` verde + `pnpm install` sem erro. Execução: `pnpm install` ok (zod 4.6.5, vitest 5, eslint 9, typescript-eslint 8.70, prettier 3.9.6); `pnpm --filter contracts test` → 1 arquivo/1 teste verde; `pnpm --filter contracts` resolve o pacote scoped (verificado com `exec pwd`). Adições necessárias além do design: `vitest.config.ts` (coverage thresholds 80%), `eslint.config.mjs` mínimo (typescript-eslint), `.prettierignore` — o design citava apenas package/tsconfig/scripts

## 2. Catálogo (test-first)

- [x] 2.1 Escrever o teste de contrato de `Procedure` (cada item de `proceduresMock` aprovado; categoria inválida reprovada) e verificar que falha porque o schema não existe — RED. Verificação: teste falha com `Cannot find module` ou schema ausente. Execução: `vitest run src/catalog/procedure.test.ts` → `Cannot find module './procedure'` (RED real)
- [x] 2.2 Criar `src/catalog/procedure.ts` (`ProcedureSchema` + `type Procedure = z.infer`) e `src/catalog/index.ts`, e verificar que o teste da task 2.1 passa — GREEN. Verificação: `pnpm --filter contracts test` verde para o catálogo. Execução: 5/5 testes verdes no arquivo (6 mocks compatíveis + aceite com 2 categorias + categoria inválida + lista vazia/campos ausentes + id vazio); `TREATMENT_CATEGORIES` espelha `frontend/lib/types.ts`

## 3. Agendamento (test-first)

- [ ] 3.1 Escrever o teste de contrato de `Slot` (cada item de `slotsMock` aprovado; `durationMinutes` zero/negativo reprovado) e verificar que falha porque o schema não existe — RED. Verificação: teste falha com schema ausente
- [ ] 3.2 Criar `src/scheduling/slot.ts` e exportar no índice do contexto, e verificar que o teste da task 3.1 passa — GREEN. Verificação: teste de slot verde
- [ ] 3.3 Escrever o teste de contrato de `BookingInput` (nome/telefone válidos aprovados; nome curto/telefone curto reprovados; exemplos aceitos/rejeitados de `booking.ts`/`quote.ts` espelhados) e verificar que falha porque o schema não existe — RED. Verificação: teste falha com schema ausente
- [ ] 3.4 Criar `src/scheduling/booking.ts` (inclui o formato de orçamento `QuoteInput` com procedimento restrito às opções vigentes) e verificar que o teste da task 3.3 passa — GREEN. Verificação: testes de booking/quote verdes

## 4. Conteúdo público (test-first)

- [ ] 4.1 Escrever os testes de contrato de `Testimonial` e `BeforeAfter` (itens com consentimento aprovados; listagem pública exclui o item sem consentimento de `resultsMock`) e verificar que falham porque os schemas não existem — RED. Verificação: testes falham com schemas ausentes
- [ ] 4.2 Criar `src/content/testimonial.ts` e `src/content/before-after.ts` (com `hasConsent` obrigatório e helper/tipo de listagem pública só-com-consentimento) e verificar que os testes da task 4.1 passam — GREEN. Verificação: testes verdes
- [ ] 4.3 Escrever os testes de contrato de `Post`, `ContactInput`, `ContactInfo` e quiz (`postsMock`, exemplos aceitos/rejeitados de `contact.ts`, `contactMock`, `quizGoalsMock`, `quizRecommendationsMock`, `treatmentOptionsMock`) e verificar que falham porque os schemas não existem — RED. Verificação: testes falham com schemas ausentes
- [ ] 4.4 Criar `src/content/post.ts`, `contact.ts`, `quote.ts` (se separado de booking — seguir o design), `quiz.ts` e `contact-info.ts` com índices do contexto, e verificar que os testes da task 4.3 passam — GREEN. Verificação: `pnpm --filter contracts test` 100% verde

## 5. Erro consistente, gates e registros

- [ ] 5.1 Escrever o teste do formato único de erro (payload malformado → `{ code, message, fields? }`, sem vazamento de internals do Zod) e verificar que falha antes do normalizador existir — RED. Verificação: teste falha com normalizador ausente
- [ ] 5.2 Criar o normalizador de erros de validação no pacote e verificar que o teste da task 5.1 passa — GREEN. Verificação: teste de erro verde
- [ ] 5.3 Rodar os gates do pacote (`lint`, `format`, `typecheck`, `test`, `build` se aplicável), revisar segurança contra `docs/security/03-seguranca.md` (sem dado real de paciente nos testes/fixtures; só mocks fictícios vigentes) e registrar em `verification.md` — exceção docs/07 §4 só para a escrita dos registros; gates são executáveis. Verificação: gates verdes + `verification.md` com revisão registrada
- [ ] 5.4 Atualizar `docs/product/08-backlog-produto.md` (Use Case 4.1.1 → status refletindo os contratos entregues) — exceção docs/07 §4 (documentação sem comportamento; verificação por releitura). Verificação: releitura confirma o status atualizado
