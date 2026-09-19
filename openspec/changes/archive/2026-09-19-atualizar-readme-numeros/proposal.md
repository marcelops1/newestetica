# Change: atualizar-readme-numeros

## Why

O `README.md` está defasado nos números: diz "19 PRs mergeados" (real, verificado por comando: 23, #1–#23) e "24 changes arquivados" (real: 26, sendo 23 com specs sincronizadas), além de "106 testes" (real: 109 a 100%) e de não mencionar que Blog, Contato e Orçamento ganharam acesso pela navegação (rodapé + CTA do Header, change `adicionar-paginas-faltantes-ao-menu` mergeado). README desatualizado engana quem chega ao projeto — e a correção anterior de números (PR #20) mostra que a deriva volta a cada marco.

## What Changes

- Atualiza `README.md` com números verificados por comando real: 15 arquivos e 109 testes a 100% (172/172 stmts, 117/117 branches, 54/54 funcs, 158/158 lines); 7 specs (72 requirements, inalterado); 26 changes arquivados (23 com specs sincronizadas); 23 PRs mergeados; 10 rotas (inalterado).
- Atualiza a linha "O que existe hoje" para registrar que Blog e Contato têm acesso no rodapé e Orçamento como CTA "Pedir Orçamento" no Header (desktop + drawer).
- Tabela "Modelos de IA recomendados": verificada idêntica ao AGENTS.md §7 (GLM-5.3, DeepSeek V4 Flash, DeepSeek V4 Pro, Muse Spark) — sem alteração.
- Explicitamente fora: qualquer código, specs, backlog, `05-estado-atual.md` (escopo restrito ao README; a defasagem de contagens de testes no 05 fica registrada como follow-up) e outras decisões.

## Capabilities

### New Capabilities

- Nenhuma (documentação, sem comportamento).

### Modified Capabilities

- Nenhuma (nenhum requirement muda; `skip_specs: true`).

## Impact

- `README.md` apenas.
- Sem impacto em código, specs, contratos, mocks, dados ou CI.
