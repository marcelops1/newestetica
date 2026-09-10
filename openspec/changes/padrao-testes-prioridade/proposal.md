# Change: padrao-testes-prioridade

## Why

A Definition of Done exige testes e 80% de cobertura, mas não diz *que tipos* de teste exigir em cada situação — cobertura alta não pega injeção, contrato quebrado nem fluxo crítico sem teste. A seção 13 fixa o padrão por prioridade (sempre / com frequência / com parcimônia) e declara que cobertura não substitui as outras dimensões. Formaliza via OpenSpec a seção já redigida, que havia entrado direto no working tree sem change.

## What Changes

- Acrescenta a seção "13. Padrão de testes por prioridade" em `docs/engineering/07-workflow-de-engenharia.md` (após a 12, sem renumerar): sempre exigir (unitários completos, OWASP, contrato/schema, integração de fluxos críticos); com frequência a critério do Verify (mutation, falha/resiliência, revisão de segurança de código IA); com parcimônia (E2E só em jornadas de alto valor, carga só com requisito real); cobertura 80% como dimensão não intercambiável.
- Explicitamente fora: criar skills novas, mudar gates/thresholds, mudar qualquer outro doc ou código.

## Capabilities

### New Capabilities

- Nenhuma (padrão novo dentro de capability existente).

### Modified Capabilities

- `engineering-workflow`: MODIFIED — DoD passa a referenciar o padrão de testes por prioridade (seção 13 do docs/07).

## Impact

- Arquivo alterado: `docs/engineering/07-workflow-de-engenharia.md` (adição, +24 linhas).
- Nenhum código, gate, threshold ou outro doc é tocado.
