## Context

Ver `proposal.md` (Why). Ponto de partida verificado: o frontend tem Stryker funcional (`@stryker-mutator/core` + `vitest-runner` ^10.0.0, `mutate: ["lib/**/*.ts"]` com exclusões de teste, thresholds high 80 / low 60 / break 50, script `pnpm --filter frontend mutation`, fora do CI por decisão registrada em docs/07 §13); `backend/` e `contracts/` não têm nenhuma dependência nem config do Stryker; o backend usa vitest **projects** (`unit` + `integration` com globalSetup que exige Postgres em container); a seção 14 de docs/07 pede registro curto (2–3 exemplos) de padrões que funcionaram, agnóstico de modelo.

## Goals / Non-Goals

**Goals:**

- Stryker rodando de verdade nos dois workspaces, com score real do módulo de referência registrado, sem tocar CI/gates.

**Non-Goals:**

- Enforcement em CI, mudança de thresholds do frontend, reescrita da seção 14, mutation de outros módulos.

## Decisions

### 1. Replicar o padrão do frontend, sem reinventar (mesmas versões, mesmos thresholds)

Rationale: um runner e uma régua por monorepo — `@stryker-mutator/core` + `vitest-runner` ^10.0.0 e thresholds high 80 / low 60 / break 50 nos três workspaces; divergir criaria "qual teste é mais exigente?" sem motivo. Alternativas consideradas: versões mais novas do Stryker (rejeitada — divergência de toolchain sem ganho); thresholds próprios por workspace (rejeitada — mesma régua do §13).

### 2. Escopo do mutate: Agendamento no backend, schemas de scheduling no contracts

Rationale: a capability mira o módulo de referência, não o monorepo inteiro — `backend`: `src/scheduling/**/*.ts` (excluindo specs, gerado e wiring sem regra); `contracts`: `src/scheduling/**/*.ts` (excluindo testes). Escopo maior (todo o backend) multiplicaria tempo de execução sem decisão que o justifique; escopo menor (só domain) deixaria a infra sem prova. Alternativa considerada: mutar `src/` inteiro do backend (rejeitada — custo sem ganho nesta fase).

### 3. Testes de integração participam do mutation do backend

Rationale: mutantes em `infrastructure/` (mapeamento, constraint, transação) só morrem com teste real contra Postgres — rodar só unitários faria sobreviventes falsos. Logo a execução exige o banco de teste no ar (mesmo pré-requisito da suíte de integração) e inclui os dois projects. Alternativa considerada: só unit (rejeitada — prova fraca justamente onde o módulo é mais crítico).

### 4. Vitest projects: tentar direto, com fallback registrado

Rationale: o plugin `vitest-runner` recebe a config do vitest do workspace, que usa `projects`; se o plugin não suportar projects na versão pinada, o fallback é um override de config só para o mutation (ex.: variável de ambiente selecionando o project, ou config Stryker apontando para um vitest de escopo reduzido) — sem mudar a config de teste do repo. Alternativa considerada: reestruturar os testes do backend para caber no plugin (rejeitada — o tail wagging the dog; a suíte manda, o mutation se adapta).

### 5. Registro na seção 14: aditivo, 4 padrões observados, agnóstico de modelo

Rationale: a seção pede 2–3 exemplos curtos de padrões que funcionaram; esta sessão rendeu quatro, todos verificáveis nos artefatos do change arquivado: (a) dividir o Apply em grupos por camada com revisão entre eles (tasks 0–4 executadas em sessões separadas, cada grupo verde antes do próximo); (b) provas negativas reais em vez de confiar no teste passar (DROP INDEX → 5 vencedoras; UoW ingênua → escrita persistiu; wiring quebrado → canário vermelho); (c) revisão de segurança formal mesmo quando a cobertura "parecia" suficiente (gatilho docs/07 §7 acionado gerou R1–R10 e duas correções test-first); (d) emenda de design em voo quando achado de revisão exige mudança antes de continuar (UnitOfWork virou porta antes do grupo 3, registrada em design+tasks). Nenhum nome de modelo, versão ou fornecedor no texto — a regra de forma da seção 14. Alternativa considerada: reescrever a seção (rejeitada — a seção manda registro curto, não tratado).

### 6. Checklist em nova seção 16 do docs/07 (não em outro doc)

Rationale: a trava precisa morar na fonte única do fluxo de engenharia — é lá que Verify e Archive buscam critérios, e é lá que a seção 15 (ordem TDD por camada) já normatiza construção de módulo. Os 5 itens espelham 1:1 as lacunas auditadas (contrato, security no planejamento, mutation, adversarial, §14), cada um apontando para evidência (design.md, verification.md), não para intenção — checklist sem evidência vira tique-taque. A própria seção registra que prompts futuros de módulo novo devem citá-la, fechando o loop sem automação. Alternativas consideradas: colocar em `backend/AGENTS.md` (rejeitada — AGENTS é porta de entrada, o 07 é a fonte do fluxo); lint automatizado de artefatos (rejeitada — mesmo motivo da §14: volume não justifica).

### 7. Seção condicional no template de PR (só para módulo de backend novo)

Rationale: tornar o esquecimento visível no PR em vez de dependente de lembrança — quem abre o PR de módulo novo encontra as caixas e preenche ou apaga a seção com justificativa. Condicional (não no checklist geral) para não taxar changes pequenos com itens inaplicáveis. Alternativa considerada: fundir os itens no checklist geral (rejeitada — ruído para todo PR; o template atual já é enxuto de propósito).

## Risks / Trade-offs

- [Risco] Plugin vitest-runner incompatível com `projects` → Mitigação: fallback da decisão 4, verificado na primeira execução real (task cobre).
- [Risco] Tempo de execução alto (integração × mutantes) → Mitigação: escopo restrito (decisão 2); execução manual, fora do CI; documentar o tempo real observado em `verification.md`.
- [Risco] Mutantes equivalentes gerando ruído → Mitigação: triagem conforme a spec (teste novo, equivalência documentada ou justificativa), sem baixar threshold para "passar".
- [Trade-off] Duas dependências novas por workspace (`core` + `vitest-runner`) só para uso manual → aceito: mesmo custo já pago no frontend; auditoria continua verde (verificar no apply).
- [Risco] Checklist virando tique-taque sem leitura → Mitigação: cada item da seção 16 exige evidência nomeada (`verification.md`, score, task), e o Verify continua podendo reprovar item marcado sem lastro.
- [Risco] Seção condicional do template ignorada/apagada sem justificativa → Mitigação: bloco curto e condicional (só aparece para módulo novo); revisão de PR cobra o preenchimento como os demais itens.
