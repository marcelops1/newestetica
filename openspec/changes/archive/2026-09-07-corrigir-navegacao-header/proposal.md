# Change: corrigir-navegacao-header

## Why

O menu do Header só tem âncoras nuas (`#tratamentos`, `#sobre` etc.): a partir de `/tratamentos` ou `/sobre`, os links de seção quebram (resolvem na página errada) e as rotas reais não têm link nenhum — só acessíveis digitando a URL. A navegação precisa funcionar de qualquer página.

## What Changes

- "Tratamentos" vira link real para `/tratamentos` e "A Clínica" para `/sobre` (rotas Next via `next/link`, desktop e mobile).
- Diferenciais, Resultados e Depoimentos viram `/#diferenciais` etc. (prefixo de rota), funcionando de qualquer página.
- Logo aponta para `/` (topo da home) em vez de `#topo`.
- Explicitamente fora: backend, novas páginas, mudança visual do Header, alteração de escopo.

## Capabilities

### New Capabilities

- Nenhuma (correção de comportamento de navegação existente).

### Modified Capabilities

- `public-site-structure`: MODIFIED — requirement de navegação do Header (conteúdo completo atualizado com rotas reais e âncoras com prefixo).
