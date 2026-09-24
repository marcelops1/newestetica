## Purpose

Garante que os testes do módulo de referência realmente matam mutantes — cobertura alta sem mutation testing pode esconder testes fracos — estendendo a adoção manual do Stryker do frontend para `contracts/` e `backend/`.

## ADDED Requirements

### Requirement: Configuração Stryker executável por workspace

Cada workspace com testes (`backend/`, `contracts/`) SHALL ter configuração Stryker executável via script `mutation`, replicando o padrão do frontend (mesmo runner, mesmos thresholds, exclusões equivalentes para arquivos de teste), sem integração ao CI.

#### Scenario: Execução manual por workspace

- **WHEN** alguém roda o script `mutation` dentro de `backend/` ou `contracts/`
- **THEN** o Stryker executa contra a suíte daquele workspace e sai com código zero quando o score atinge os thresholds

#### Scenario: Sem CI

- **WHEN** o pipeline de CI executa
- **THEN** nenhum gate depende do mutation score (adoção manual, como no frontend)

### Requirement: Score medido no módulo de referência

O módulo de Agendamento (`backend/src/scheduling/`) e os schemas de `contracts/src/scheduling/` SHALL ter mutation score medido pelo menos uma vez, com o resultado registrado em `verification.md` do change que o mediu.

#### Scenario: Primeira medição registrada

- **WHEN** a suíte completa do workspace passa com cobertura acima de 80%
- **THEN** existe um mutation score registrado para o escopo do módulo de referência, incluindo mutantes sobreviventes relevantes ou a ausência deles

### Requirement: Meta de mutation score

O mutation score medido SHALL perseguir a meta de 80% já registrada em docs/07 §13; mutantes sobreviventes SHALL ser triados (teste ausente a escrever, mutante equivalente a documentar, ou falso-positivo do operador a justificar) em vez de ignorados em silêncio.

#### Scenario: Triagem de sobreviventes

- **WHEN** a execução termina com mutantes sobreviventes
- **THEN** cada sobrevivente relevante tem teste novo cobrindo o comportamento ou justificativa registrada de equivalência
