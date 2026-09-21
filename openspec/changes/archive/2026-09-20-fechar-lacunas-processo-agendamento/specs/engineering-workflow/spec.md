## ADDED Requirements

### Requirement: Checklist obrigatório para módulo de backend novo

`docs/engineering/07-workflow-de-engenharia.md` SHALL conter a seção "16. Checklist obrigatório para módulo de backend novo" exigindo, antes do Archive de qualquer Change de módulo novo: (a) `api-and-interface-design` carregada e citada no design quando há contrato; (b) `security-and-hardening` carregada DURANTE o planejamento, não só no Verify; (c) mutation rodado ao menos uma vez com score em `verification.md`; (d) task explícita de teste adversarial com payload hostil real; (e) alimentação da seção 14 quando a sessão for complexa. A seção SHALL registrar que prompts futuros propondo módulo novo devem citá-la.

#### Scenario: Leitura da seção 16

- **WHEN** alguém abre a seção 16 do docs/07
- **THEN** encontra os 5 itens verificáveis com a evidência exigida em cada um, mais a nota de citação em prompts futuros

### Requirement: Template de PR com seção condicional para módulo de backend novo

`.github/pull_request_template.md` SHALL conter um bloco condicional, aplicável quando o PR for de módulo de backend novo, com os itens do checklist da seção 16 de docs/07 como caixas de marcar — sem alterar os itens do checklist geral existente.

#### Scenario: PR de módulo novo traz a seção

- **WHEN** alguém abre um PR de módulo de backend novo
- **THEN** o corpo já contém o bloco condicional preenchível, e o esquecimento de um item fica visível na revisão
