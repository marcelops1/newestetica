# Change: registrar-validacao-fabiana

## Why

A Fabiana Rosa validou visualmente o site público em produção em 2026-09-19. Isso libera formalmente o início do Épico 4 (Backend), conforme a estratégia de entrega (`00-visao`: frontend → validação → backend) e a regra 8 do AGENTS.md. Sem o registro, backlog e estado oficial continuam dizendo "pendente validação", bloqueando na prática o backend por premissa desatualizada.

## What Changes

- Backlog (Épico 1): os 7 UCs cuja única pendência era a validação passam a "Concluído (validado com a Fabiana em 2026-09-19)" — 1.1.1 já estava "Concluído"; 1.2.1, 1.3.1, 1.5.1, 1.7.1, 1.8.2 e 1.9.1 são promovidos de "Em andamento" (a validação era o único item após "implementada..."). UCs com outras pendências reais (1.3.2 sem cláusula; 1.4.1 fotos reais; 1.6.1 e-mail de backend; 1.6.2 Não iniciado; 1.8.1 número real) ficam intactos, assim como a tabela-resumo salvo a linha do Épico 1.
- `docs/product/05-estado-atual.md`: nova fase (validado em 2026-09-19, backend liberado); remove "aceite pendente" de "O que ainda NÃO existe"; próximos passos reordenados (Épico 4 primeiro); tabela com validação concluída.
- Explicitamente fora: qualquer código, specs, README/AGENTS.md/00/02 (menções de processo ou de "pendente" nesses arquivos ficam como FYI para follow-up) e decisões de produto.

## Capabilities

### New Capabilities

- Nenhuma (registro de estado, sem comportamento).

### Modified Capabilities

- Nenhuma (nenhum requirement muda; `skip_specs: true`).

## Impact

- `docs/product/08-backlog-produto.md` (7 status + tabela do Épico 1) e `docs/product/05-estado-atual.md` (fase, §4, §6, tabela).
- Sem impacto em código, specs, contratos, mocks, dados ou CI.
