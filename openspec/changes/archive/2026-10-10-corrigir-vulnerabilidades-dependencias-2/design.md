# Design: corrigir-vulnerabilidades-dependencias-2

## Contexto

Segunda rodada do mesmo padrão: o gate de auditoria reprova por advisories publicados **depois** do merge da rodada anterior (2026-10-04). As correções exigem subir direct deps (`next`) e forçar transitória (`source-map-js`), via mecanismo já estabelecido no repo: versão fixa sem `^` para direct deps do frontend, `overrides` na raiz para transitórias.

## Decisões

1. **`next` + `eslint-config-next` 16.3.6 → 16.3.8, fixos (sem `^`)**: mesmo tratamento da rodada anterior (frontende versiona `next` fixo). Corrige GHSA-cjq9-62q9-8jv4 (SSRF no Image) e deve trazer `sharp >=0.35.5` por resolução.
2. **Override condicional de `sharp`**: a regra é determinada pela evidência — após `pnpm install`, rodar `pnpm why sharp`. Se a árvore resolver `>=0.35.5`, nada a fazer (não duplicar override que o next já resolve). Se sobrar `<0.35.5`, adicionar `"sharp@<0.35.5": "^0.35.5"` na raiz, no estilo dos existentes. Evita override desnecessário.
3. **Override incondicional de `source-map-js@<1.2.2` → `^1.2.2`**: a transitória aparece em 32+ paths (postcss no frontend, prisma no backend); deixar cada árvore resolver sozinha não é confiável. Override disjunto (só casa `<1.2.2`) preserva versões já corrigidas.
4. **`braces` intocado**: aceite formal em `docs/security/03-seguranca.md` §12 continua válido (sem versão corrigida publicada; justificativa e gatilho de revisão registrados lá).
5. **Moderate não bloqueiam**: o gate usa `--audit-level high`; os 8 moderate ficam listados como pendência no verification.md sem ação neste change (fora do escopo — corrigir moderates exigiria mexer em deps sem necessidade do gate).

## Alternativas consideradas

- **Renomear para `^16.3.8`**: descartado — o repo versiona next fixo (evita surpresa em rebuild); manter a convenção.
- **`pnpm.auditConfig.ignoreGhsas` para os 3 novos**: descartado — os 3 têm versão corrigida publicada; ignorar seria esconder problema resolvível (ignored só se justifica sem fix, como o braces).
- **Atualizar frontend deps relacionadas (react etc.)**: descartado — fora do escopo; só o que o gate exige.

## Riscos

- **`sharp` nativo**: binário pré-compilado via npm para linux-x64 — `pnpm build` do frontend (que não usa next/image) exercita a resolução; risco baixo, coberto pelo gate de build.
- **next 16.3.8 trazer quebra de comportamento**: patch release dentro da mesma minor (16.3.x); coberto pelos 109 testes + build do frontend.
- **Override de source-map-js conflitar com resolução do postcss**: override disjunto só casa `<1.2.2`; `pnpm why` prova o resultado.
