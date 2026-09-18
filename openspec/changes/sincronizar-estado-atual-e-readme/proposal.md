# Change: sincronizar-estado-atual-e-readme

## Why

`docs/product/05-estado-atual.md` e `README.md` descrevem um projeto de meses atrás: o 05 fala em 4 specs, 2 changes arquivados e 1 change ativo (real, verificado por comando: 7 specs com 72 requirements, 22 changes arquivados, 0 ativos), e o README afirma que "ainda não há código de produto implementado" (real: site público do Épico 1 completo com mocks, 14 arquivos e 104 testes a 100% de cobertura). Estado desatualizado faz qualquer IA — e qualquer pessoa nova — trabalhar com premissas erradas, violando o propósito do próprio 05 como fonte oficial do estado.

## What Changes

- Reescreve `docs/product/05-estado-atual.md` com números verificados por comando real: 7 specs (72 requirements), 22 changes arquivados, 0 ativos; Épico 1 com 9 features implementadas (10 rotas); 14 arquivos e 104 testes a 100% de cobertura; 3 camadas de defesa de qualidade ativas; pipeline multi-modelo vigente (AGENTS.md §7).
- Reescreve `README.md` para descrever o projeto como ele é hoje: o que existe, stack, documentação com caminhos corretos, estado atual e modelos de IA vigentes.
- Explicitamente fora: qualquer código de produto, specs (`openspec/specs/` intocadas), backlog, decisões de produto/arquitetura/tecnologia, design system.

## Capabilities

### New Capabilities

- Nenhuma (documentação de estado, sem comportamento).

### Modified Capabilities

- Nenhuma (nenhum requirement muda; `skip_specs: true` em `.openspec.yaml`).

## Impact

- `docs/product/05-estado-atual.md` e `README.md` apenas.
- Sem impacto em código, specs, contratos, mocks, dados ou CI.
