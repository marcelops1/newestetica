# Change: template-pr-checklist-c4

## Why

Nenhum Change lembra automaticamente de atualizar C2/C3 quando altera containers ou componentes do frontend/backend — já aconteceu de esquecer (changes `catalogo-procedimentos`, `pagina-sobre` e `corrigir-navegacao-header` não atualizaram o C4, corrigido depois à parte no `sincronizar-c4-frontend`). Um checklist no template de PR torna a Definition of Done auto-verificável exatamente no momento da abertura do PR.

## What Changes

- Criar `.github/pull_request_template.md` com checklist objetivo, incluindo pelo menos:
  - Gates locais passaram (lint, format, typecheck, test, build)
  - Task de teste (RED) precedeu a de implementação (TDD), ou exceção docs/07 §4 registrada
  - Gatilho de segurança (docs/07 §7) avaliado e registrado em `verification.md`
  - `docs/product/08-backlog-produto.md` atualizado, se aplicável
  - Pergunta C2/C3: este change alterou containers ou componentes (frontend/backend)? Se sim, `docs/architecture/c2-container.md` e/ou `c3-component.md` foram atualizados
  - Change arquivado via `openspec-archive-change` com specs sincronizadas
- Acrescentar em `docs/engineering/07-workflow-de-engenharia.md`, na Definition of Done (seção 6), referência ao checklist do PR como o mecanismo que a torna auto-verificável no momento da abertura do PR.
- Explicitamente fora: mudar política de merge, CI, gates ou o conteúdo de C2/C3.

## Capabilities

### New Capabilities

- Nenhuma (mecanismo de verificação de capability existente).

### Modified Capabilities

- `engineering-workflow`: MODIFIED — Definition of Done ganha mecanismo auto-verificável na abertura do PR (template com checklist, incluindo o lembrete C2/C3).

## Impact

- Arquivos novos/alterados: `.github/pull_request_template.md` (novo), `docs/engineering/07-workflow-de-engenharia.md` §6 (uma linha/parágrafo de referência).
- Nenhum código de produto, backend ou contrato é tocado.
- A partir deste change, todo PR aberto no GitHub já nasce com o checklist preenchível.
