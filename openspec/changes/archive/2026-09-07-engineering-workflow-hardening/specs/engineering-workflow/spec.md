## ADDED Requirements

### Requirement: Ciclo TDD obrigatório

Toda mudança de comportamento SHALL começar por um teste que falha, seguido da implementação mínima e do refactor.

#### Scenario: Implementação antes do teste não conclui a task

- **WHEN** alguém implementa antes do teste
- **THEN** a task não é considerada concluída

### Requirement: Formato test-first das tasks

Toda task de implementação em `openspec/changes/` SHALL declarar o teste que falha antes da task de implementação correspondente.

#### Scenario: Change sem task de teste é rejeitado

- **WHEN** um change novo é proposto sem task de teste anterior
- **THEN** a proposta é rejeitada na revisão

### Requirement: Skill obrigatória por etapa

Cada etapa do ciclo OpenSpec (Explore, Propose, Specs, Design, Tasks, Apply, Verify, Archive) SHALL ter ao menos uma skill obrigatória declarada em `docs/07-workflow-de-engenharia.md`, carregada antes da etapa começar.

#### Scenario: Etapa sem skill é interrompida

- **WHEN** uma etapa começa sem a skill carregada
- **THEN** o trabalho é interrompido e refeito a partir da skill

### Requirement: Gate de segurança na etapa Verify

Nenhuma change SHALL ser arquivada sem revisão com a skill `security-and-hardening` contra `docs/03-seguranca.md`, registrada no change.

#### Scenario: Archive sem registro de segurança é bloqueado

- **WHEN** um change com entrada de usuário chega ao Archive sem o registro
- **THEN** o archive é bloqueado

### Requirement: Quality gates executáveis

Os comandos de lint, formatação, typecheck, testes com cobertura e build SHALL ser executáveis a partir da raiz do monorepo e SHALL falhar com código de saída diferente de zero quando qualquer gate falhar.

#### Scenario: Cobertura abaixo de 80% reprova

- **WHEN** a cobertura cai abaixo de 80%
- **THEN** o comando de testes falha e o build não passa

### Requirement: Verificação automática em cada mudança

Os quality gates, a auditoria de dependências e a varredura de segredos SHALL rodar automaticamente em cada push e pull request.

#### Scenario: Dependência vulnerável quebra o pipeline

- **WHEN** um push introduz dependência com vulnerabilidade alta
- **THEN** o pipeline falha

### Requirement: Definition of Done única

Uma task SHALL ser considerada concluída somente quando atender à Definition of Done registrada em `docs/07-workflow-de-engenharia.md`.

#### Scenario: Task incompleta volta atrás

- **WHEN** uma task é marcada como concluída sem um dos itens
- **THEN** ela volta para não concluída
