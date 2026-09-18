## Context

Ver `proposal.md` (Why). Ponto de partida: `NAV_ITEMS` com 5 entradas em `frontend/features/home/sections/Header.tsx` (linhas 8–14) — constante privada que alimenta tanto a navegação desktop quanto o drawer mobile, então uma edição cobre os dois. Rotas `/antes-depois` e `/depoimentos` existem (`frontend/app/antes-depois/page.tsx`, `frontend/app/depoimentos/page.tsx`). Restrições: só trocar destinos; visual, ordem, drawer e ids das seções da home intactos; testes rodam em ambiente `node` (sem jsdom/testing-library) no padrão `vitest run --coverage` com threshold de 80%.

## Goals / Non-Goals

**Goals:**

- Todo item do menu leva ao destino certo a partir de qualquer rota, via `next/link`, com os destinos cobertos por teste unitário node-compatível.

**Non-Goals:**

- Mudar visual, ordem dos itens ou ids das seções da home; mexer no footer ou em outros links; adicionar dependências de teste (jsdom/testing-library).

## Decisions

### 1. Troca mecânica de dois destinos em `NAV_ITEMS`, `Diferenciais` intacto

Rationale: mesma mecânica do change `corrigir-navegacao-header`; `key={item.href}` continua único. Alternativa considerada: manter âncoras e confiar nas seções da home (rejeitada — páginas completas ficariam inalcançáveis pelo menu).

### 2. Extrair `NAV_ITEMS` para módulo puro co-localizado, testado por import direto

Rationale: a constante hoje é privada dentro de um Client Component que importa `next/link` — importá-la num teste `node` puxaria a avaliação do módulo JSX. Extrair o array (tipado) para um módulo sem dependências de UI, importado pelo Header, torna os destinos testáveis no ambiente atual sem novas dependências. Alternativas consideradas: exportar `NAV_ITEMS` do próprio `Header.tsx` (rejeitada — o teste importaria `next/link` e o componente no ambiente `node`); teste por leitura textual do fonte com regex (rejeitado — frágil, quebra com qualquer formatação); adicionar jsdom + testing-library para teste de renderização (rejeitado — YAGNI para troca de dois `href`, viola Non-Goals).

### 3. Teste afirma o mapa completo de destinos, não só os dois alterados

Rationale: trava regressão nos três destinos já corretos (Tratamentos, A Clínica, Diferenciais) junto com os dois novos. Alternativa considerada: testar só Resultados/Depoimentos (rejeitada — deixaria os demais sem trava e o custo de afirmar os 5 é o mesmo).

## Risks / Trade-offs

- [Risco] Visitante que esperava rolar até a seção da home cai numa página nova → Mitigação: comportamento intencional da spec (páginas completas existem para isso); seções da home e seus ids permanecem para scroll direto e links internos.
- [Trade-off] Um módulo novo só para o array de navegação → aceito: ~10 linhas, co-localizado ao Header, pago pela testabilidade no ambiente `node`.
