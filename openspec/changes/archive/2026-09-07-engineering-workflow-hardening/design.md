## Context

Ver `proposal.md` (Why) para a motivação. Ponto de partida: TDD tratado como preferência em `docs/02` e `docs/04`, skills mapeadas por intenção sem amarração às etapas, gates obrigatórios só no papel (scripts `echo` na raiz, sem CI, sem threshold) e contradição entre a seção 10 do `AGENTS.md` e `docs/05-estado-atual.md`. Restrição: nada de backend, telas, rotas ou troca de stack — só enforcement do fluxo.

## Goals / Non-Goals

**Goals:**

- Transformar recomendações em regras verificáveis automaticamente.
- Unificar OpenSpec + Agent Skills num fluxo só, sem duplicar autoridade.
- Deixar o Definition of Done e os gates auditáveis por máquina (CI), não só por leitura.

**Non-Goals:**

- Mudar o ciclo OpenSpec (as 8 etapas continuam as mesmas).
- Reescrever skills existentes ou criar skill nova.
- Definir contratos de API, backend ou qualquer comportamento de produto.

## Decisions

### 1. Skill define o COMO, OpenSpec define o ONDE e o gate

Rationale: a skill `spec-driven-development` ensina a pensar (assunções, critérios, limites) e as etapas Propose/Specs do OpenSpec definem onde o artefato mora (`proposal.md`, `specs/`) e o que libera a etapa seguinte; cada um governa sua camada sem sobreposição.
Alternativas consideradas: usar só um dos dois (rejeitado: só skill deixa artefatos sem lugar nem gate; só OpenSpec deixa o raciocínio sem método).

### 2. TDD regra absoluta com uma única exceção documentável

Rationale: a exceção (mudanças sem alteração de comportamento: documentação, configuração, renomeação pura) é objetiva e verificável na revisão, fechando a brecha do "preferencialmente" sem travar trabalho mecânico.
Alternativas consideradas: manter "preferencialmente" (rejeitado: é exatamente a brecha que permite implementar antes do teste sem consequência).

### 3. Threshold de cobertura no runner, não em checagem manual

Rationale: threshold configurado reprova o build sozinho, toda vez, sem depender de alguém olhar número; a regra vale igual em máquina local e CI.
Alternativas consideradas: confiar na revisão humana (rejeitado: revisão cansa, esquece e varia por revisor).

### 4. CI como executor dos gates, não instrução escrita

Rationale: gate que só existe em texto é violável por omissão; pipeline rodando lint, testes com cobertura, build, auditoria e varredura em cada push/PR torna a violação impossível de passar despercebida.
Alternativas consideradas: manter gates só no `AGENTS.md` (rejeitado: é o estado atual, já demonstrado insuficiente).

### 5. `docs/07` fonte única, `AGENTS.md` só aponta

Rationale: duas fontes sobre o mesmo assunto divergem — como já aconteceu entre a seção 10 do `AGENTS.md` e `docs/05`; uma fonte canônica com apontadores elimina a classe inteira do problema.
Alternativas consideradas: duplicar o fluxo no `AGENTS.md` (rejeitado: recria o risco de contradição a cada edição futura).

## Risks / Trade-offs

- [Risco] O rigor desacelera a fase de validação com a Fabiana → Mitigação: validação visual continua leve (checklists já existentes); o rigor novo mira código e gates, não o ritmo das conversas com ela.
- [Risco] A cobertura vira número artificial para bater 80% → Mitigação: `docs/04` já proíbe cobertura artificial; o gate de revisão (`code-review-and-quality`) verifica se os testes exercitam comportamento real, e o threshold é piso, não meta.
- [Trade-off] Curva de disciplina no início (test-first, skill por etapa) → Aceito: custo concentrado nas primeiras tasks, com retorno em menos retrabalho nas seguintes.
