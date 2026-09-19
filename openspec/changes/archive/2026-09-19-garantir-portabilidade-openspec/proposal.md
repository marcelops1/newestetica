# Change: garantir-portabilidade-openspec

## Why

O CLI do OpenSpec (`@fission-ai/openspec@1.12.0`) existe só como instalação **global** nesta máquina — o repositório não o declara em nenhum `package.json` (`node_modules/.bin/openspec` inexistente, confirmado). Pior: o nome `openspec` no registry npm é **outro pacote** (`0.0.0`, confirmado via `npm view` sem executar nada), então `npx openspec` em máquina limpa baixa o pacote errado e quebra todo o workflow OpenSpec. O projeto se diz multi-IA por design, mas hoje só funciona onde alguém já instalou o CLI globalmente.

## What Changes

- Fixa `@fission-ai/openspec@1.12.0` (versão exata em uso) como `devDependency` da raiz (`--save-exact`) + script `"openspec": "openspec"`; forma canônica documentada: `pnpm exec openspec`.
- Prova real em ambiente limpo: `rm -rf node_modules`, `pnpm install` do zero (lockfile), `pnpm exec openspec --version` → 1.12.0 com o binário resolvido dentro do workspace (sem tocar na instalação global).
- Regra em `AGENTS.md` ("openspec sempre via `pnpm exec openspec`", coberta pela cláusula de prevalência sobre skills), correção das 2 menções bare em `docs/engineering/07-workflow-de-engenharia.md`, nota de que skills vendored (`.opencode/skills`, `.agents/skills`) ficam intactas; seção multi-IA curta no `README.md`.
- Explicitamente fora: qualquer código de produto, specs, backlog, reescrita das skills vendored.

## Capabilities

### New Capabilities

- Nenhuma (tooling, sem comportamento de produto).

### Modified Capabilities

- Nenhuma (nenhum requirement muda; `skip_specs: true`).

## Impact

- `package.json` + `pnpm-lock.yaml` (raiz), `AGENTS.md`, `docs/engineering/07-workflow-de-engenharia.md`, `README.md`.
- Sem impacto em código de produto, specs, contratos, mocks, dados ou CI (gates rodam como regressão).
