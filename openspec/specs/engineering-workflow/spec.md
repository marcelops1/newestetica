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

### Requirement: Ferramenta concreta de mutation testing

A seção 13 do docs/07 SHALL referenciar Stryker Mutator como ferramenta concreta de mutation testing (`npx stryker run` no workspace frontend, meta de mutation score 80%), com a decisão registrada de que mutation NÃO integra o CI nem os gates ainda.

#### Scenario: Leitura do padrão de mutation

- **WHEN** alguém lê o item de mutation testing na seção 13
- **THEN** encontra ferramenta, comando, meta e a decisão de não integração ao CI

### Requirement: Cobertura de contrato/schema e princípios via skills instaladas

A seção 13 do docs/07 SHALL anotar testes de contrato/schema como cobertos via skill `api-and-interface-design` (a aplicar quando `contracts/` nascer) e SHALL conter nota curta formalizando KISS/YAGNI via `code-simplification` e registrando SOLID como coberto pelo eixo Arquitetura de `code-review-and-quality` (decisão consciente, sem checklist dedicado); o mapeamento em `AGENTS.md` (seção 12) SHALL incluir as duas linhas correspondentes.

#### Scenario: Contrato futuro

- **WHEN** `contracts/` for desenhado
- **THEN** o mapeamento indica `api-and-interface-design` como skill obrigatória

#### Scenario: Diff maior que o necessário

- **WHEN** um diff parece maior que o necessário antes da revisão
- **THEN** o mapeamento indica `code-simplification` antes de `code-review-and-quality`

### Requirement: Hook pre-commit local com lint-staged

O repositório SHALL ter hook pre-commit (husky) que roda lint-staged sobre arquivos `.ts`/`.tsx` staged dentro de `frontend/`: erros de lint/formatação corrigíveis automaticamente SHALL ser corrigidos e incluídos no commit; erro que o `--fix` não resolve sozinho SHALL falhar o hook e barrar o commit (código de saída diferente de zero, nada commitado). O pre-commit SHALL NOT substituir o CI nem o branch protection — as três camadas (pre-commit local, CI, branch protection) SHALL estar descritas em `docs/engineering/07-workflow-de-engenharia.md` como defesas independentes, com o CI como gate autoritativo.

#### Scenario: Arquivo sujo corrigível é corrigido no commit

- **WHEN** um arquivo staged contém apenas erro de lint/formatação corrigível automaticamente
- **THEN** o hook corrige o arquivo, o commit é criado com o conteúdo corrigido e o comando sai com zero

#### Scenario: Erro não-corrigível barra o commit

- **WHEN** um arquivo staged contém erro que o `--fix` não resolve sozinho
- **THEN** o hook falha, o commit é barrado e nada é commitado

#### Scenario: Bypass local não dispensa o CI

- **WHEN** um commit é criado com `--no-verify`
- **THEN** o commit local é criado, e o CI continua exigindo gates verdes no push/PR como condição de merge

### Requirement: Hook pre-commit tolerante a deleções no stage

Quando o stage contiver deleção de arquivo `.ts`/`.tsx` de `frontend/`, o hook SHALL passar o commit de deleção sem erro espúrio — paths que não existem mais em disco SHALL NOT ser enviados ao eslint/prettier — e arquivos existentes staged SHALL continuar passando por `eslint --fix` + `prettier --write` normalmente, de modo que um commit que só deleta arquivos (ou deleta entre outros) bata no hook apenas sobre o que existe.

#### Scenario: Commit só de deleção passa pelo hook

- **WHEN** um arquivo `.ts` de `frontend/` é deletado, stageado e commitado
- **THEN** o hook não tenta lintar o caminho inexistente e o commit é criado com sucesso

#### Scenario: Deleção mista com arquivo sujo continua barrando

- **WHEN** o stage contém uma deleção e, ao mesmo tempo, um arquivo existente com erro não-corrigível
- **THEN** o hook ignora o caminho deletado, reprova no arquivo existente e barra o commit

### Requirement: Gates da raiz cobrem arquivos de tooling da raiz

Os scripts `lint` e `format` da raiz SHALL cobrir `lint-staged.config.mjs`: `lint` SHALL validar a sintaxe do arquivo (falha se o arquivo não parses como módulo JS) e `format` SHALL exigir o estilo Prettier nele (falha se fora do estilo) — sem nova dependência e sem config nova, reaproveitando stdlib (`node --check`) e o binário do prettier do workspace frontend; o CI passa a exigir isso automaticamente por rodar os scripts da raiz.

#### Scenario: Config com erro de sintaxe reprova o gate

- **WHEN** `lint-staged.config.mjs` contém erro de sintaxe
- **THEN** `pnpm lint` (raiz) falha com código diferente de zero

#### Scenario: Config fora do estilo reprova o gate

- **WHEN** `lint-staged.config.mjs` está fora do estilo Prettier
- **THEN** `pnpm format` (raiz) falha com código diferente de zero

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
