# Change: pagina-antes-depois

## Why

O Use Case 1.4.1 (Antes/Depois, Épico 1) existe hoje só como um caso em destaque na home; a paciente não tem uma página para ver múltiplos casos com calma antes de decidir — e prova real com consentimento é um dos antídotos centrais aos medos do público 40–60 (artificialidade, resultados exagerados, privacidade).

## What Changes

- Nova rota pública `/antes-depois` (`frontend/app/antes-depois/page.tsx` + `frontend/features/results/ResultsPage.tsx`) listando todos os casos com consentimento, cada um com comparador antes/depois reutilizado, badge de consentimento visível, painel do caso (sessões, recuperação, objetivo) e CTA de agendamento com pré-seleção.
- Extração do `Comparator` hoje privado em `Results.tsx` para `components/BeforeAfterComparator.tsx` reutilizável (home passa a usá-lo, sem mudança visual).
- Link "Ver todos os casos" na seção Resultados da home apontando para a nova página (header intocado nesta versão).
- Fonte de dados da página: somente casos com consentimento via camada `lib/` — regra inegociável docs/03 §5: nenhum caso sem `hasConsent` aparece.
- Sem filtro por procedimento na v1: os mocks de resultados não têm vínculo a procedimento (só `BeforeAfter` + `hasConsent`), então não há critério fiel para filtrar.
- Sem backend, sem fotos reais (blocos locais, padrão atual); mobile-first, tom acolhedor.
- Atualiza `docs/product/08-backlog-produto.md` (UC 1.4.1) e C2/C3 (nova rota + nova feature) neste mesmo change.

## Capabilities

### New Capabilities

- Nenhuma (página nova dentro de capabilities existentes).

### Modified Capabilities

- `public-site-structure`: ADDED — página `/antes-depois`; MODIFIED — seção Resultados ganha link para a página.
- `architecture-docs`: MODIFIED — C2 lista a rota `/antes-depois`; C3 registra `features/results/` e o comparador compartilhado.

## Impact

- Arquivos novos: `app/antes-depois/page.tsx`, `features/results/ResultsPage.tsx`, `lib/before-after.ts` (+ teste), `components/BeforeAfterComparator.tsx`.
- Arquivos alterados: `features/home/sections/Results.tsx` (usa comparador extraído + link), `docs/08`, C2, C3.
- Nenhum contrato, backend ou mock alterado; `getVisibleResults()` continua a única fonte.
