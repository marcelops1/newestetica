## ADDED Requirements

### Requirement: Padrão de testes por prioridade

`docs/engineering/07-workflow-de-engenharia.md` SHALL conter a seção "13. Padrão de testes por prioridade" declarando: sempre exigir unitários completos, testes OWASP (entrada de usuário/dado sensível), contrato/schema em fronteiras de dados e integração de fluxos críticos; com frequência a critério do Verify (mutation, falha/resiliência, revisão de segurança de código IA); com parcimônia (E2E só em jornadas de alto valor, carga só com requisito real); cobertura mínima de 80% como dimensão não intercambiável com as demais.

#### Scenario: Leitura do padrão

- **WHEN** alguém abre a seção 13 do docs/07
- **THEN** encontra as três faixas de prioridade e a regra de não intercambialidade da cobertura
