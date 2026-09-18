## 1. Levantar e fixar números verificados

- [x] 1.1 Executar os comandos de verificação (`ls openspec/specs`, contagem de requirements por spec, `ls openspec/changes/archive`, `openspec list`, `pnpm test`, rotas em `frontend/app`, `gh pr list`, branch protection) e registrar cada valor observado para uso nas tasks seguintes (exceção docs/07 §4: documentação sem comportamento executável; verificação por comando real executado, não por estimativa)

Valores observados em 2026-09-18 (branch `docs/sincronizar-estado-atual-e-readme`, base `main` em `fd3e647`): 7 specs (`architecture-docs` 4, `design-tokens` 7, `docs-organization` 3, `engineering-workflow` 15, `frontend-foundation` 4, `mock-data` 12, `public-site-structure` 27 = 72 requirements); 22 changes arquivados; 0 outros ativos; `pnpm test`: 14 arquivos, 104 testes, 100% (170/170 stmts, 117/117 branches, 53/53 funcs, 156/156 lines); 10 rotas (`/`, `/tratamentos`, `/tratamentos/[slug]`, `/sobre`, `/antes-depois`, `/depoimentos`, `/orcamento`, `/contato`, `/blog`, `/blog/[slug]`); PRs #1–#19 todos mergeados; branch protection exige check "quality gates" (enforce_admins).

## 2. Reescrever documentos

- [x] 2.1 Reescrever `docs/product/05-estado-atual.md` usando somente os valores verificados na task 1.1, preservando a estrutura de seções e as referências cruzadas (exceção docs/07 §4: sem comportamento executável; verificação por releitura comparando cada número ao registro da task 1.1)
- [x] 2.2 Reescrever `README.md` (estado real, caminhos de docs corretos, tabela de modelos igual à do AGENTS.md §7) usando somente valores verificados (exceção docs/07 §4: sem comportamento executável; verificação por releitura + checagem de cada caminho citado com `ls`)

## 3. Verificação e registro

- [ ] 3.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança contra `docs/security/03-seguranca.md` (documentação pública sem segredos nem dados: registrar não-aplicabilidade dos gatilhos §7 e checar que nenhum segredo ou dado real entrou nos textos) e verificar que tudo passa (exceção docs/07 §4: sem comportamento executável; verificação pelos próprios gates)
- [ ] 3.2 Registrar `verification.md` e avaliar `docs/product/08-backlog-produto.md` (atualizar somente se algum status estiver incorreto) (exceção docs/07 §4: sem comportamento executável; verificação por releitura)
