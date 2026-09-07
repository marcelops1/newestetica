# Change: align-home-to-nano-banana-prototype

## Why

A home atual do Next ficou minimalista e genérica (hero centralizado de coluna única, botões pretos), divergindo da referência visual aprovada em `docs/prototypes/home-nano-banana.html`. Este change aproxima a home do protótipo para que a validação com a Fabiana aconteça sobre o visual correto.

## What Changes

- Hero recomposto em duas colunas: badge pulsante, título com acento itálico em primary, subtítulo, grupo de CTAs, linha de métricas e card visual com card flutuante.
- CTAs primários passam a usar `primary`/`primary-hover` (fim dos botões pretos onde o protótipo usa taupe); secundários seguem o estilo fantasma com borda do protótipo.
- Header alinhado ao protótipo: logo com tagline, navegação desktop, ação WhatsApp + CTA primário, menu mobile com drawer.
- Seções recompostas no padrão do protótipo: quiz com 4 objetivos + caixa de recomendação, tratamentos com filtros por categoria, resultados com badge de consentimento + comparador antes/depois + painel do caso, diferenciais numerados (4), depoimentos com avaliação e iniciais, painel final em `primary-soft`, rodapé em 4 colunas.
- Modal de agendamento do protótipo (formulário + estado de sucesso), com envio 100% mockado (sem rede, sem backend).
- Interações do protótipo recriadas no React de forma acessível: menu mobile, seleção do quiz, filtros de tratamento, comparador antes/depois.
- Imagens externas do protótipo (Unsplash) NÃO são copiadas: visuais usam blocos locais nos tokens `primary-soft`/`primary` até a Fabiana aprovar fotos reais (com consentimento).
- Explicitamente fora: qualquer backend, Keycloak, integrações reais, novas páginas, alteração da arquitetura de mocks, mudança de escopo do MVP.

## Capabilities

### New Capabilities

Deltas em camadas sobre as specs ainda não arquivadas do change `frontend-foundation-mocks` (mesmos paths; arquivar a fundação primeiro):

- `design-tokens`: regras de uso das cores nos CTAs e componentes conforme o protótipo (primário taupe, fantasma com borda, fundos `primary-soft`), incluindo a exceção documentada ao AA para texto branco sobre `primary` em botões.
- `public-site-structure`: composição visual de cada seção da home conforme o protótipo (hero 2 colunas, header com drawer, quiz, filtros, comparador, modal) e comportamentos acessíveis no React.
- `mock-data`: dados que sustentam os novos elementos (objetivos e recomendações do quiz, categorias dos tratamentos, campos do caso clínico, opções do modal) — todos fictícios.

### Modified Capabilities

- Nenhuma (ainda não existem specs em `openspec/specs/`; os deltas acima estendem o change de fundação e serão arquivados depois dele).

## Impact

- Afeta somente `frontend/` (seções em `features/home/`, `components/`, `lib/`); nada de backend, contratos ou infra.
- Não altera escopo de produto: mesmos conteúdos do MVP, só a apresentação muda.
- Requer ordem de archive: `frontend-foundation-mocks` primeiro, este change depois.
- Tensão registrada e assumida: botões `primary` com texto branco seguem o protótipo aprovado (autoridade visual), com mitigação no hover (`primary-hover`) — ver `design-tokens/spec.md` e `design.md`.
