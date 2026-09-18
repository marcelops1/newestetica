## Context

Ver `proposal.md` (Why). Ponto de partida: `frontend/app/tratamentos/[slug]/page.tsx:27` já faz `if (!item) notFound()`; falta só o arquivo escopado `app/tratamentos/not-found.tsx`, então slug inválido resolve na 404 default do Next em inglês. Referência: `app/blog/not-found.tsx` (24 linhas — badge `primary-soft`, h1 display, parágrafo 16px, CTA primário via `next/link` com 44px). Restrições: conformidade com spec já aprovada (não feature); testes em ambiente `node` sem jsdom/testing-library; `pnpm build` prerenderiza as rotas e a not-found escopada passa a servir os 404s do segmento.

## Goals / Non-Goals

**Goals:**

- Slug inválido do catálogo renderiza 404 acolhedora em PT com volta ao catálogo, provada em runtime; teste de contrato trava a existência do módulo no CI.

**Non-Goals:**

- Mexer em `page.tsx`, no blog, em outras rotas ou na 404 global; adicionar dependências de teste.

## Decisions

### 1. Espelhar `app/blog/not-found.tsx`, trocando copy e destino do CTA

Rationale: padrão aprovado e verificado em runtime nas duas direções; consistência entre as duas rotas com slug. Alternativa considerada: componente compartilhado parametrizado (rejeitada — YAGNI; 2 usos com copy distinta, ~20 linhas estáticas não justificam abstração; precedente do projeto: páginas com arquivos próprios por rota).

### 2. Teste-first em 2 níveis: contrato (import + export default função) com RED por `Cannot find module`, e prova real de comportamento em runtime

Rationale: viabilidade do contrato provada por probe nesta proposta (import de `not-found` com `next/link` passa no vitest `node`); precedente `pagina-blog` task 2.1 para o RED por módulo inexistente. A prova real de comportamento é o runtime (`next start` + `curl`), item explícito de DoD deste change. Alternativas consideradas: jsdom/testing-library (rejeitadas — não instaladas, YAGNI para página estática); regex sobre o fonte (rejeitado — frágil, precedente registrado); só runtime sem teste (rejeitado — docs/07 §4 exige teste para comportamento real; o contrato garante a trava de regressão no CI).

### 3. `skip_specs: true`, sem delta

Rationale: requirement "Detalhe por procedimento" + cenário "Slug inválido" já aprovados exigem exatamente isto; delta idêntico seria vazio e inventar texto violaria "não inventar requirement". Alternativa considerada: delta MODIFIED repetindo o requirement (rejeitada — merge no-op sem valor, só ruído no histórico).

### 4. Copy em PT espelhando a estrutura do blog, sem prometer conteúdo inexistente

Rationale: badge neutro ("Página não encontrada"), título e parágrafo acolhedores sem culpa nem jargão (docs 01/06), CTA único para `/tratamentos`. Alternativa considerada: reutilizar a copy do blog trocando "blog" por "catálogo" mecanicamente (rejeitada em favor de texto próprio para o contexto de tratamento, mantendo o tom).

## Risks / Trade-offs

- [Risco] `generateStaticParams` cobre só slugs válidos; slug inválido em produção cai no `notFound()` → Mitigação: é exatamente o caminho coberto pela página escopada e provado no runtime da task 2.1.
- [Trade-off] ~20 linhas espelhadas do blog → aceito (ver decisão 1); consistência entre rotas vale mais que a dedup aqui.
