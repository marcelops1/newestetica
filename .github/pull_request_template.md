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
- [ ] Este change criou/alterou endpoint HTTP? Se sim, os decorators do Swagger foram atualizados na mesma task (docs/07 §17; cobertura e fidelidade verificadas por `openapi.int.spec.ts`)
- [ ] Change arquivado via `openspec-archive-change` com specs sincronizadas

## Checklist de módulo de backend novo (só se este PR cria um módulo de backend)

> Itens da seção 16 do `docs/engineering/07-workflow-de-engenharia.md`. Se o PR não cria um módulo de backend novo, apague este bloco.

- [ ] Skill `api-and-interface-design` carregada e citada no `design.md` (quando o módulo define ou consome contrato)
- [ ] Skill `security-and-hardening` carregada durante o planejamento (`design.md`/`tasks.md`), não só no Verify
- [ ] Mutation testing rodado ao menos uma vez contra o módulo, com score real e triagem em `verification.md`
- [ ] Task explícita de teste adversarial com payload hostil real contra a fronteira
- [ ] Seção 14 alimentada quando a sessão foi complexa (múltiplas emendas ou grupos)
