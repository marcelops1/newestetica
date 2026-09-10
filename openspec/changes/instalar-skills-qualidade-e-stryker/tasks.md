## 1. Skills + Stryker + docs (instalação de tooling/docs — exceção docs/07 §4 registrada aqui)

> Exceção aplicável: sem comportamento executável de produto (skills de terceiros copiadas fiéis, devDeps, config e docs); verificação por leitura + `diff` + `pnpm install` + `openspec validate`, sem ciclo RED.

- [x] 1.1 Baixar `SKILL.md` de `skills/api-and-interface-design/` e `skills/code-simplification/` do repositório addyosmani/agent-skills e instalá-los fiéis (byte a byte) em `.opencode/skills/<nome>/` e `.agents/skills/<nome>/`, e verificar com `diff` que as quatro cópias são idênticas à origem
- [x] 1.2 Adicionar `@stryker-mutator/core` e `@stryker-mutator/vitest-runner` como devDependencies em `frontend/package.json`, criar `frontend/stryker.config.mjs` (vitest, perTest, mutate `lib/**/*.ts` sem testes, thresholds 80/60/50, reporters html+clear-text+progress) e o script `"mutation": "stryker run"`, e verificar que `pnpm install` conclui e `pnpm --filter frontend exec stryker --version` responde
- [ ] 1.3 Atualizar `AGENTS.md` §12 (+2 linhas de mapeamento) e docs/07 §13 (Stryker + contrato via skill + nota KISS/YAGNI/SOLID), e verificar com `grep` que os trechos existem e que CI/gates seguem intocados (`grep -r stryker .github/` vazio)

## 2. Verificação e archive

- [ ] 2.1 Rodar quality gates e `openspec validate` e verificar que tudo passa sem tocar em código de produto
- [ ] 2.2 Registrar em `verification.md` a avaliação (tooling/docs: sem gatilho docs/07 §7; fidelidade das skills; decisão de não integrar ao CI; SOLID sem checklist como decisão consciente) e arquivar via `openspec-archive-change` com specs sincronizadas
