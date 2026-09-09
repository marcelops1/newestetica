## Context

Ver `proposal.md` (Why). Ponto de partida: `Results.tsx` tem `Comparator` privado + filtro `hasConsent` inline e exibe só o primeiro caso; `resultsMock` tem 2 casos com consentimento e 1 sem (`resultado-3`, nunca exibido); `getVisibleResults()` já é a fonte segura; páginas seguem o padrão `app/<rota>/page.tsx` + `features/<domínio>/<Page>.tsx` + Header/Footer/BookingModal (ver `CatalogPage`). Sem `@testing-library`: testes no nível `lib/` (vitest, node). Restrição: docs/03 §5 (sem consentimento, não aparece) e C2/C3 atualizados no mesmo change.

## Goals / Non-Goals

**Goals:**

- Página `/antes-depois` listando N casos com o mesmo comparador e padrão visual da home.
- Contrato de consentimento da rota pinado num seletor nomeado e testado (`getBeforeAfterPageCases`).
- Home inalterada visualmente após a extração; C2/C3 e backlog atualizados.

**Non-Goals:**

- Filtro por procedimento (mocks não suportam — sem critério fiel).
- Item novo no header, fotos reais, backend, mudança nos mocks.

## Decisions

### 1. Extrair `Comparator` para `components/BeforeAfterComparator.tsx`

Rationale: reuso sem duplicar lógica acessível (slider, teclado, pointer); home e página consomem o mesmo componente.
Alternativas consideradas: duplicar o código na página (rejeitado: divergência futura); importar da section da home (rejeitado: inverte a direção components ← features).

### 2. Seletor `getBeforeAfterPageCases()` em `lib/before-after.ts` como fonte única da página

Rationale: dá nome e teste ao contrato da rota ("página pública = só com consentimento"); delega a `getVisibleResults()`, então a troca pela API continua restrita à camada `lib/`. Permite RED honesto (módulo inexistente → suite falha) antes do GREEN.
Alternativas consideradas: página usar `getVisibleResults()` direto (rejeitado: o teste dedicado exigido não teria RED genuíno, pois o acessor já existe e passa).

### 3. Sem filtro na v1

Rationale: `BeforeAfter` não tem vínculo a procedimento; qualquer filtro seria inventado e infiel aos mocks.
Alternativas consideradas: estender mocks com campo de procedimento (rejeitado: muda tipo + spec mock-data por um filtro não pedido no MVP).

### 4. Descoberta via link na seção Resultados, header intocado

Rationale: link contextual no fluxo de prova social basta; header já tem 5 itens e mudança no menu exigiria alterar spec do header.
Alternativas consideradas: item "Antes e Depois" no header (rejeitado: escopo e poluição do menu mobile).

## Risks / Trade-offs

- [Risco] Extração quebrar a home visualmente → Mitigação: mover código literal, sem alterar classes; gates + build + revisão do diff.
- [Risco] Caso sem consentimento vazar na listagem → Mitigação: teste dedicado RED-first + revisão security-and-hardening com foco em consentimento (gatilho docs/07 §7).
- [Trade-off] Seletor fino extra em `lib/` → aceito: custo de uma função, benefício de contrato testado da rota.
