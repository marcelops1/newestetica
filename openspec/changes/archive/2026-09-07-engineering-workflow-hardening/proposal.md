# Change: engineering-workflow-hardening

## Why

As regras de engenharia do projeto são hoje recomendações sem enforcement. `docs/02-arquitetura.md` e `docs/04-decisoes-tecnicas.md` tratam TDD como preferência ("preferencialmente", "preferir"), não como regra, e TDD não aparece nas regras absolutas da seção 8 do `AGENTS.md`. O formato das tasks dos changes arquivados é "implementar X e verificar Y", que descreve verificação depois da implementação, e não o ciclo RED → GREEN → REFACTOR. O `AGENTS.md` mapeia intenção para skill na seção 12, mas não amarra cada skill a uma etapa do ciclo OpenSpec, então skills críticas (`security-and-hardening`, `code-review-and-quality`) dependem de alguém lembrar. Os scripts lint, test e build do `package.json` da raiz são placeholders `echo`, e `docs/05-estado-atual.md` registra que não existe pipeline de CI: os quality gates são obrigatórios no papel mas nada os impede de serem violados. A meta de cobertura acima de 80% não tem threshold configurado que reprove o build. A seção 10 do `AGENTS.md` diz que nenhum código de produto foi implementado, contradizendo `docs/05-estado-atual.md`.

## What Changes

- TDD e gate de segurança promovidos a regras absolutas no `AGENTS.md`.
- Novo documento `docs/07-workflow-de-engenharia.md` definindo o fluxo unificado OpenSpec + Agent Skills, com a skill obrigatória de cada etapa.
- Formato obrigatório de task test-first em todos os changes futuros.
- Definition of Done única, referenciada por `AGENTS.md` e pelos docs.
- Scripts reais na raiz do monorepo e threshold de cobertura que reprova o build abaixo de 80%.
- Pipeline de CI executando todos os gates, auditoria de dependências e varredura de segredos.
- Correção da seção 10 do `AGENTS.md` e atualização de `docs/05-estado-atual.md`.
- Explicitamente fora: backend, novas telas ou rotas, mudança de escopo do MVP, troca de stack, alteração do Design System.

## Capabilities

### New Capabilities

- `engineering-workflow`: regras de enforcement do fluxo de engenharia — TDD obrigatório, skill por etapa do ciclo OpenSpec, formato test-first de tasks, Definition of Done única, scripts reais e threshold de cobertura na raiz, pipeline de CI com gates, auditoria e varredura de segredos.

### Modified Capabilities

- `frontend-foundation`: precisa de delta — o requirement "Quality gates obrigatórios" não menciona threshold de cobertura que reprove o build, e o novo threshold muda o critério de conclusão das tasks; o delta atualiza esse requirement com o threshold de 80%.

## Impact

- Pastas afetadas: raiz do monorepo (`package.json`, `.github/` para o pipeline), `docs/` (novo `07-workflow-de-engenharia.md`, ajustes em `05-estado-atual.md`), `openspec/` (nova spec + `AGENTS.md` corrigido na seção 10).
- Nenhum código de produto muda de comportamento: só tooling, documentação, specs e CI.
