# Change: sincronizar-c4-frontend

## Why

Os diagramas C2 e C3 foram escritos antes de `/tratamentos`, `/tratamentos/[slug]`, `/sobre` e das features `catalog/` e `about/` existirem — o mapa está defasado do território. Sincronizar agora mantém a regra de manutenção dos próprios diagramas (atualizar no Verify de quem altera a camada).

## What Changes

- `c2-container.md`: Frontend detalhado com as rotas reais (`/`, `/tratamentos`, `/tratamentos/[slug]`, `/sobre`); planejado intacto.
- `c3-component.md`: features reais (`home`, `catalog`, `about`, `booking`) e rotas mapeadas às features; placeholder do backend intacto.
- `c1-context.md` intocado (contexto não muda).
- Explicitamente fora: código, backend, novas rotas, mudança de decisões.

## Capabilities

### New Capabilities

- Nenhuma (atualização documental de capability existente).

### Modified Capabilities

- `architecture-docs`: MODIFIED — C2 e C3 refletem rotas e features reais (conteúdo completo atualizado dos trechos).
