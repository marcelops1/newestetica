## 1. Verificar números reais por comando

- [x] 1.1 Executar `find frontend/app -name page.tsx` (rotas), `pnpm test` (arquivos/testes/cobertura), `gh pr list --state merged` (PRs), `ls openspec/changes/archive/` (arquivados), `grep skip_specs` (sincronizados), `ls openspec/specs/` + contagem de requirements, e comparar a tabela de modelos com AGENTS.md §7 — registrando cada valor observado para uso nas tasks seguintes (exceção docs/07 §4: documentação sem comportamento executável; verificação por comando real executado, não por estimativa)

Valores observados em 2026-09-19 (branch `docs/atualizar-readme-numeros`, base `main` em `1ee738d`): 10 rotas (`/`, `/tratamentos`, `/tratamentos/[slug]`, `/sobre`, `/antes-depois`, `/depoimentos`, `/orcamento`, `/contato`, `/blog`, `/blog/[slug]`); `pnpm test`: 15 arquivos, 109 testes, 100% (172/172 stmts, 117/117 branches, 54/54 funcs, 158/158 lines); 23 PRs mergeados (#1–#23); 26 arquivados (3 com `skip_specs`: `sincronizar-estado-atual-e-readme`, `corrigir-404-tratamentos`, `decisao-tecnica-vercel-docker` → 23 com specs); 7 specs / 72 requirements (inalterados); modelos idênticos ao AGENTS.md §7 (GLM-5.3, DeepSeek V4 Flash, DeepSeek V4 Pro, Muse Spark). Números finais no head do branch, após arquivar este change: 27 arquivados (23 com specs; 4 com `skip_specs`, incluindo este) — confirmado por `ls openspec/changes/archive/ | wc -l` e `grep -rl "skip_specs: true"`.

## 2. Atualizar README.md e 05-estado-atual.md

- [x] 2.1 Atualizar a seção "O que existe hoje" (acesso de Blog/Contato/Orçamento pela navegação) e todos os números (testes, changes, PRs) usando somente os valores verificados na task 1.1, preservando o restante do arquivo (exceção docs/07 §4: sem comportamento executável; verificação por releitura comparando cada número ao registro da task 1.1)
- [x] 2.2 (retroativa) Sincronizar `docs/product/05-estado-atual.md` com os mesmos números, incluindo a contagem auto-referencial (27 arquivados; 4 com `skip_specs`, incluindo este) e o próprio change na lista do §5 — escopo ampliado durante o ciclo por decisão do usuário (o 05 estava defasado desde o sync anterior), com confirmação por `ls`/`grep` e grep final de resíduos (exceção docs/07 §4: sem comportamento executável; verificação por comando real + releitura)

## 3. Verificação e registro

- [x] 3.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança contra `docs/security/03-seguranca.md` (documentação pública sem segredos nem dados: registrar não-aplicabilidade dos gatilhos §7 e checar que nenhum segredo ou dado real entrou no texto) e verificar que tudo passa (exceção docs/07 §4: sem comportamento executável; verificação pelos próprios gates)
- [x] 3.2 Registrar `verification.md` e avaliar `docs/product/08-backlog-produto.md` (atualizar somente se algum status estiver incorreto) (exceção docs/07 §4: sem comportamento executável; verificação por releitura)
