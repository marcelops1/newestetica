## 1. Dependência portátil (test-first, sem exceção §4)

- [x] 1.1 Provar o problema sem executar código estranho: `npm view openspec version` retorna o pacote errado (`0.0.0`), `node_modules/.bin/openspec` não existe no repo e `pnpm exec openspec --version` falha hoje — RED real. Execução em 2026-09-19: `npm view openspec version` → `0.0.0` (o que `npx` baixaria); `node_modules/.bin/openspec` → ausente; `pnpm exec which openspec` → `/home/marcelo/.nvm/.../bin/openspec` (o **global** — `pnpm exec` cai no PATH quando não há binário local, então na ausência de global o comando falha; a dependência da máquina está provada pelo caminho de resolução)
- [x] 1.2 Executar `pnpm add -D --save-exact @fission-ai/openspec@1.12.0` (+ script `"openspec": "openspec"`), revisar o diff do lockfile e checar install scripts executados, e verificar `pnpm exec openspec --version` → `1.12.0` com o binário resolvido dentro do workspace — GREEN. Execução: `pnpm add -D -w --save-exact` (pnpm exige `-w` para a raiz do workspace — nota honesta de execução); lockfile +167 linhas, 17 pacotes transitivos, **nenhum `requiresBuild`** (sem install scripts) e nenhum aviso de build no install; `node_modules/.bin/openspec --version` → 1.12.0 direto, `pnpm exec which openspec` → `./node_modules/.bin/openspec` (local), `pnpm exec` e `pnpm openspec` → 1.12.0

## 2. Instalação limpa (GREEN em ambiente limpo)

- [ ] 2.1 Remover `node_modules` (raiz + `frontend/`), rodar `pnpm install` do zero e re-verificar `pnpm exec openspec --version` → `1.12.0` com resolução local (sem tocar na instalação global — prova por caminho resolvido, conforme design)

## 3. Documentação portátil (exceção docs/07 §4)

- [ ] 3.1 Adicionar a regra em `AGENTS.md` ("openspec sempre via `pnpm exec openspec`"), corrigir as 2 menções bare na tabela de `docs/engineering/07-workflow-de-engenharia.md` e registrar a nota sobre skills vendored intactas (exceção docs/07 §4: documentação sem comportamento executável; verificação por releitura + grep)
- [ ] 3.2 Adicionar a seção multi-IA curta no `README.md` (qualquer IA agentic com terminal + `AGENTS.md` continua o trabalho; por quê: OpenSpec como dependência do projeto, specs em Markdown, skills como texto) (exceção docs/07 §4: sem comportamento executável; verificação por releitura)

## 4. Verificação e registro

- [ ] 4.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança supply-chain contra `security-and-hardening` (mesmo código já executado globalmente; pin exato; lockfile revisado; checar que nenhum segredo entrou nos textos) e registrar em `verification.md`, e verificar que tudo passa
- [ ] 4.2 Avaliar `docs/product/08-backlog-produto.md` (atualizar somente se algum status estiver incorreto — tooling sem Use Case correspondente, precedente do change do husky) (exceção docs/07 §4: sem comportamento executável; verificação por releitura)
