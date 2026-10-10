# Change: estender-lint-staged-backend

## Why

O hook de pre-commit (husky + lint-staged) hoje só cobre `frontend/**/*.{ts,tsx}` — commits que tocam apenas `backend/` ou `contracts/` passam sem nenhuma barreira local. As revisões dos changes `backend-modulo-financeiro` (R4) e `backend-modulo-identidade` registraram isso explicitamente: o hook "não barrou nenhum commit" e o drift só foi pego depois, pelos gates manuais/CI. Com o backend agora em construção ativa (4+ módulos), cada commit sem barreira é uma chance de feedback tardio. Estender o hook para as duas pastas fecha a lacuna com custo mínimo (mesmo padrão já validado, zero dependência nova).

## What Changes

- `lint-staged.config.mjs` ganha duas chaves de glob — `backend/**/*.ts` e `contracts/**/*.ts` — cada uma com função própria no padrão v17 já vigente (binário real `pnpm`, `pnpm -C <pasta> exec ...`, caminhos normalizados para relativos à pasta). Cada pasta usa seu próprio config de eslint/prettier via CWD.
- `backend/src/generated/**` (Prisma gerado) é excluído no filtro da função (defesa em profundidade além do `ignores` do eslint do backend): o hook nunca linta nem formata código gerado.
- Sem `.tsx` no backend/contracts hoje (verificado: 0 arquivos) — os globs cobrem só `.ts`. Se um `.tsx` aparecer um dia, o CI (gates da raiz) continua pegando; o hook pode ser estendido então (YAGNI agora).
- Docs: `docs/engineering/07-workflow-de-engenharia.md` (nota das camadas de defesa passa a listar as três pastas cobertas) e `docs/product/05-estado-atual.md` (remover qualquer ressalva "só cobre frontend", se ainda existir redação nesse sentido).
- Prova executável test-first no fluxo git real (mesmo ritual do change do husky): RED = arquivo sujo em `backend/` e em `contracts/` comita sem barreira (hook não dispara); GREEN = após a mudança, erro corrigível é corrigido e incluído no commit, erro não-corrigível barra o commit (exit 1). Scratch limpo ao final via reset.
- Verificação registrada: o hook roda em commits feitos por sessões de agente (não interativas)? Se não rodar, documentar causa e gate manual que compensa.
- Branch do change: `chore/estender-lint-staged-backend` (docs/07 §9: `chore/` para decisão técnica/infra).

## Capabilities

### New Capabilities

- Nenhuma (extensão de camada existente dentro de capability existente).

### Modified Capabilities

- `engineering-workflow`: MODIFIED — requirement "Hook pre-commit local com lint-staged" passa a cobrir `backend/**/*.ts` e `contracts/**/*.ts` (com exclusão de `backend/src/generated/**`); ADDED — nenhum requirement novo (extensão de escopo, não comportamento novo).

## Impact

- Arquivos alterados: `lint-staged.config.mjs` (duas chaves novas), `docs/engineering/07-workflow-de-engenharia.md` (nota das camadas), `docs/product/05-estado-atual.md` (remover ressalva, se aplicável).
- Nenhum código de produto, nenhum mock, nenhum contrato, nenhuma dependência nova (lockfile intocado); `docs/product/08-backlog-produto.md` NÃO muda (tooling sem UC, como nos changes de origem); C4 intocado; CI intocado (já roda os scripts da raiz).
- Rollback = reverter os três arquivos.
