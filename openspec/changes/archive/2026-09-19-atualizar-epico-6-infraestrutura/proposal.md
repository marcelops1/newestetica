# Change: atualizar-epico-6-infraestrutura

## Why

O Épico 6 (`docs/product/08-backlog-produto.md`) está desatualizado em 3 pontos: o UC 6.3.1 diz "Não iniciado", mas o frontend está em produção na Vercel (site vivo, verificado por fetch nesta proposta) via deploy manual por CLI — o critério de aceite atual ("Deploy reproduzível") descreve um futuro, não o presente; o pre-commit hook (Husky + lint-staged, terceira camada de qualidade, com prova executável RED→GREEN no change arquivado) não tem entrada no backlog; e as decisões Vercel/Docker precisam de avaliação explícita sobre pertencer ou não ao backlog.

## What Changes

- Reescreve o UC 6.3.1 (status "Em andamento"): fluxo de deploy manual do frontend (Vercel CLI, site em produção; backend não implantado), aceite honesto (produção acessível a partir de build verde, sem segredos; automático/reproduzível por push como evolução futura), mantendo o gatilho de segurança.
- Adiciona o UC 6.1.2 ("Barrar erro de lint/format antes do commit local", ator desenvolvedor/IA, status Concluído, referenciando o change `instalar-husky-lint-staged` arquivado) dentro da Feature 6.1 (CI/CD) e atualiza a tabela-resumo (Épico 6: 4 UCs; total 38 UCs; status geral refletindo frontend em produção manual).
- Decide (registrado no design): Vercel/Docker **não** ganham Use Case — registro de decisão não é capability executável; casa autoritativa é `docs/architecture/04` §§18–19 (com menção no 05).
- Explicitamente fora: qualquer código, specs, deploy automático, outras Features do backlog.

## Capabilities

### New Capabilities

- Nenhuma (backlog, sem comportamento de produto).

### Modified Capabilities

- Nenhuma (nenhum requirement muda; `skip_specs: true` — backlog não é `openspec/specs/`).

## Impact

- `docs/product/08-backlog-produto.md` apenas (UC 6.3.1 reescrito, UC 6.1.2 adicionado, tabela-resumo atualizada).
- Sem impacto em código, specs, contratos, mocks, dados ou CI.
