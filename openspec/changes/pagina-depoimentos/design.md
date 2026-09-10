## Context

Ver `proposal.md` (Why). Ponto de partida: `Testimonials.tsx` é server component (sem estado, sem modal — a página pode ser 100% estática), com estrelas fixas 5/5 e helper privado `initialsOf`; `testimonialsMock` tem 3 itens fictícios com padrão "Primeiro nome + inicial"; `getTestimonials()` já expõe os mocks via `lib/data.ts`; padrão de página validado em `/antes-depois` (`app/<rota>/page.tsx` + `features/<domínio>/<Page>.tsx`). Sem `@testing-library` — testes no nível `lib/` (vitest, node). Restrições: docs/03 (sem dado real), docs/07 §13 (tipos de teste por prioridade).

Achado da investigação: `initialsOf` tem bug real de edge case — `initialsOf("Maria  Silva")` retorna `"Mundefined"` (split de espaço duplo gera string vazia e `part[0]` é `undefined`). A extração para `lib/` com teste RED corrige.

## Goals / Non-Goals

**Goals:**

- Página `/depoimentos` com todos os depoimentos, mesmo padrão visual da seção da home.
- Helper de iniciais extraído, testado (edge cases) e corrigido.
- Mapeamento explícito dos tipos de teste da seção 13.

**Non-Goals:**

- Campo de rating variável (estrelas continuam 5/5 padrão do protótipo — sem inventar contrato).
- Item no header, backend, fotos, depoimentos reais.

## Aplicação da seção 13 (tipos de teste que se aplicam)

| Tipo (docs/07 §13) | Aplica? | Como |
|---|---|---|
| Unitários com edge cases | **Sim (sempre)** | RED-first em `initialsOf` (nome único, espaço duplo — o bug real, 3+ partes) e no seletor da página (não-vazio, campos string não-vazias) |
| OWASP | **Sim (sempre — há renderização de texto livre do mock)** | Citação/autor são texto renderizado via auto-escape do React; verificação: sem `innerHTML`/`dangerouslySetInnerHTML` (grep) + spec scenario "Texto de marcação nunca vira HTML"; registro em verification.md |
| Contrato/schema | **Sim (sempre — fronteira mock ↔ UI)** | `getTestimonialsPageCases()` como contrato nomeado da rota, testado RED-first |
| Integração de fluxo crítico | **Sim (navegação home → /depoimentos)** | Link na seção + rota existente; verificado por build (rota prerenderizada) + typecheck + grep; limitação registrada: sem testing-library no projeto, clique não é simulável |
| Mutation | Não — dispensado | Lógica trivial (split/join/slice), sem negócio sensível; registro em verification.md |
| Falha e resiliência | Não — dispensado | Sem dependência externa nem dado malformado possível (mock estático tipado); registro em verification.md |
| E2E | Não (parcimônia) | Página estática de leitura; jornada de alto valor é agendamento |
| Carga | Não (parcimônia) | Sem requisito de performance |

## Decisions

### 1. Página 100% server component (sem "use client")

Rationale: depoimentos não têm interação nem modal — página estática renderiza mais barato e segue sendo SSG como `/antes-depois`.
Alternativas consideradas: copiar o padrão client de `ResultsPage` (rejeitado: estado desnecessário).

### 2. `initialsOf` + `getTestimonialsPageCases()` em `lib/testimonials.ts`

Rationale: dá nome ao contrato da rota (padrão `before-after.ts`) e torna o helper testável com edge cases — o RED pega o bug do espaço duplo.
Alternativas consideradas: duplicar o helper na página (rejeitado: bug em dois lugares); manter helper na section e não testar (rejeitado: perde o edge case).

### 3. Estrelas fixas 5/5, sem campo rating

Rationale: o padrão aprovado na home é 5/5; criar rating variável muda contrato de mock sem necessidade de produto.
Alternativas consideradas: campo `rating` no mock (rejeitado: escopo desnecessário).

### 4. +2 mocks fictícios (total 5), mesmos campos

Rationale: página de listagem com 3 itens fica magra; 5 dá densidade sem tocar contrato. Padrão de autor mantido ("Primeiro nome + inicial", contexto "Paciente ilustrativa").
Alternativas consideradas: listar só os 3 atuais (rejeitado: página vazia de prova social).

### 5. Descoberta via link na seção da home; header intocado

Mesma decisão validada no `pagina-antes-depois`.

## Risks / Trade-offs

- [Risco] Bug do `initialsOf` corrigido mudar iniciais exibidas hoje → Mitigação: para os autores atuais ("Mariana S.", etc.) o comportamento é idêntico; o fix só afeta espaços múltiplos (inexistentes nos mocks).
- [Risco] OWASP com "sempre exigir" mas sem testing-library para testar renderização → Mitigação: auto-escape do React + grep de `innerHTML`/`dangerouslySetInnerHTML` + scenario na spec; lacuna de renderer conhecida e registrada.
- [Trade-off] 2 mocks novos a mais para revisar na validação com a Fabiana — aceitável, são fictícios e reversíveis.
