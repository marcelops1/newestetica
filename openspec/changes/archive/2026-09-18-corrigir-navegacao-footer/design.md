## Context

Ver `proposal.md` (Why). Ponto de partida: `Footer.tsx:21-26` com array inline de 4 pares `[href, label]` em âncoras cruas, renderizado com `<a>` simples (`Footer.tsx:27-34`); sem item Sobre e sem links externos na coluna (confirmado por leitura). `nav-items.ts` (PR #18, já em `main`) é a fonte única do Header com os 5 destinos corretos. Testes rodam em ambiente `node` (sem jsdom/testing-library) no padrão `vitest run --coverage` com threshold de 80%.

## Goals / Non-Goals

**Goals:**

- Todo link da coluna Navegação do rodapé leva ao destino certo a partir de qualquer rota, via `next/link`, com os destinos cobertos por teste unitário node-compatível e sem duplicar o conhecimento dos destinos.

**Non-Goals:**

- Mudar visual ou ordem do rodapé; adicionar itens (ex.: Sobre); mexer no Header, nas seções da home ou em outros links; adicionar dependências de teste (jsdom/testing-library).

## Decisions

### 1. Mesmos 4 destinos canônicos, sem item novo

Rationale: Tratamentos/Resultados/Depoimentos/Diferenciais espelham o menu; Sobre não existe no rodapé e adicioná-lo seria feature nova, fora do escopo de correção. Alternativa considerada: incluir Sobre no rodapé (rejeitada — amplia escopo; pode ser proposta à parte se a Fabiana quiser).

### 2. Constantes canônicas compartilhadas em `nav-items.ts`; rodapé declara ordem/labels próprios

Rationale: a causa-raiz desta saga é conhecimento de destino espalhado — o Header foi corrigido duas vezes e o rodapé ficou para trás. Extrair os literais para constantes referenciadas por `NAV_ITEMS` e pelo array do rodapé (módulo puro co-localizado, paralelo a `nav-items.ts`) elimina a deriva sem acoplamento frágil. Alternativas consideradas: duplicar as 4 strings no módulo do rodapé (rejeitada — recria exatamente a deriva que gerou este bug); lookup por label em `NAV_ITEMS` com `find` (rejeitada — retorna `NavItem | undefined`, exigiria non-null assertion ou cast, que a revisão rejeita); mover as constantes para `lib/` ou `shared/` (rejeitado — YAGNI; os únicos consumidores estão na mesma pasta).

### 3. `<a>` vira `next/link` nos 4 links internos

Rationale: mesmo padrão do Header e da spec ("links internos SHALL usar `next/link"`); a regra `no-html-link-for-pages` passa a cobrir a coluna — o lint acusando um eventual `<a href="/x">` restante é enforcement esperado, não bug. Alternativas consideradas: manter `<a>` com hrefs absolutos (rejeitada — viola o padrão do projeto e a regra de lint); migrar só os destinos novos para `Link` (rejeitada — inconsistência; `/#diferenciais` também é interno e o precedente do Header usa `Link` em todos).

### 4. Teste afirma os 4 destinos do rodapé (mapa próprio)

Rationale: trava regressão e o invariante Diferenciais-âncora na superfície do rodapé, independente do teste do Header. Alternativa considerada: confiar no teste do Header via constantes compartilhadas (rejeitada — provaria as constantes, não o que o rodapé declara).

## Risks / Trade-offs

- [Risco] Footer e Header divergirem em labels no futuro → Mitigação: fora de escopo; labels próprios por consumidor são intencionais, destinos seguem únicos.
- [Risco] `key={href}` no rodapé: hrefs continuam únicos → sem warning do React.
- [Trade-off] `nav-items.ts` cresce com as constantes e passa a servir dois consumidores → aceito: segue com ~20 linhas, na mesma pasta, e elimina a classe de bug.
