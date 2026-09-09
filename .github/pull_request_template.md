# Pull Request — Newestetica

> Checklist auto-verificável da Definition of Done (`docs/engineering/07-workflow-de-engenharia.md`, seção 6). Marque cada item antes de pedir revisão.

## Contexto do change

- Change OpenSpec:
- Specs afetadas:

## Checklist

- [ ] Gates locais passaram (lint, format, typecheck, test, build)
- [ ] Task de teste (RED) precedeu a de implementação (TDD), ou exceção docs/07 §4 registrada na task
- [ ] Gatilho de segurança (docs/07 §7) avaliado e registrado em `verification.md`
- [ ] `docs/product/08-backlog-produto.md` atualizado, se aplicável
- [ ] Este change alterou containers ou componentes (frontend/backend)? Se sim, `docs/architecture/c2-container.md` e/ou `c3-component.md` foram atualizados
- [ ] Change arquivado via `openspec-archive-change` com specs sincronizadas
