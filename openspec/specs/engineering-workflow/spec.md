# engineering-workflow Specification
## Purpose

Define as regras de enforcement do fluxo de engenharia: TDD obrigatório, skill por etapa do OpenSpec, tasks test-first, Definition of Done única, gates executáveis com threshold de cobertura e CI com auditoria e varredura.

## Requirements

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

### Requirement: Template de PR com checklist

`.github/pull_request_template.md` SHALL conter um checklist com estes itens: gates locais; TDD (teste RED antes, ou exceção docs/07 §4 registrada); gatilho de segurança (docs/07 §7) avaliado e registrado em `verification.md`; `docs/product/08-backlog-produto.md` atualizado quando aplicável; pergunta C2/C3 (alterou containers ou componentes? então `docs/architecture/c2-container.md` e/ou `c3-component.md` atualizados); archive com specs sincronizadas.

#### Scenario: PR aberto já contém o checklist

- **WHEN** alguém abre um pull request no repositório
- **THEN** o corpo do PR já contém o checklist preenchível, sem precisar copiar de outro lugar

#### Scenario: Change que alterou camada não esquece o C4

- **WHEN** um change alterou containers ou componentes do frontend/backend
- **THEN** o item C2/C3 do checklist exige que `docs/architecture/c2-container.md` e/ou `c3-component.md` tenham sido atualizados antes do merge

### Requirement: DoD referencia o checklist do PR

A Definition of Done em `docs/engineering/07-workflow-de-engenharia.md` (seção 6) SHALL referenciar o checklist do PR como o mecanismo que a torna auto-verificável no momento da abertura do PR.

#### Scenario: Definition of Done aponta para o checklist

- **WHEN** alguém lê a Definition of Done (docs/07, seção 6)
- **THEN** encontra a referência ao checklist do PR como mecanismo auto-verificável na abertura do PR

### Requirement: Padrão de testes por prioridade

`docs/engineering/07-workflow-de-engenharia.md` SHALL conter a seção "13. Padrão de testes por prioridade" declarando: sempre exigir unitários completos, testes OWASP (entrada de usuário/dado sensível), contrato/schema em fronteiras de dados e integração de fluxos críticos; com frequência a critério do Verify (mutation, falha/resiliência, revisão de segurança de código IA); com parcimônia (E2E só em jornadas de alto valor, carga só com requisito real); cobertura mínima de 80% como dimensão não intercambiável com as demais.

#### Scenario: Leitura do padrão

- **WHEN** alguém abre a seção 13 do docs/07
- **THEN** encontra as três faixas de prioridade e a regra de não intercambialidade da cobertura
