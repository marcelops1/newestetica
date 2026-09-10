## Context

Ver `proposal.md` (Why). Ponto de partida: docs/07 §13 exige mutation/contrato sem ferramenta nem skill, e nada diz sobre KISS/YAGNI/SOLID; `frontend/` usa Vitest 5 + TS, sem Stryker; `.agents/skills/` existe vazio; `.opencode/skills/` tem 14 skills (nenhuma de API/contrato ou simplificação). Duas pesquisas (fora deste change) concluíram: (1) testes — `api-and-interface-design` cobre contrato-primeiro/testes de contrato/Hyrum/idempotência/resiliência a falhas parciais, Stryker + `@stryker-mutator/vitest-runner` casa com o stack; (2) princípios — `code-simplification` cobre KISS/YAGNI (redução preservando comportamento exato, Cerca de Chesterton), SOLID já parcial no eixo Arquitetura de `code-review-and-quality` (fronteiras de módulo, direção de dependências, acoplamento — verificado por grep no SKILL.md). Restrição: não integrar ao CI ainda; não criar skill nova.

## Goals / Non-Goals

**Goals:**

- Duas skills instaladas fiéis (byte a byte) nos dois diretórios.
- Stryker executável manualmente com config mínima coerente com os 80% do projeto.
- DoD e mapeamento atualizados, sem tocar gates.

**Non-Goals:**

- Mutation no CI, mutation score como bloqueante, checklist SOLID dedicado, skill nova de mutation.

## Decisions

### 1. Cópia fiel das skills, sem adaptar conteúdo

Rationale: skills de terceiros versionadas upstream; adaptar criaria fork silencioso que diverge sem aviso.
Alternativas consideradas: reescrever resumidas (rejeitado: perde fidelidade).

### 2. Dois diretórios de skills (`.opencode/skills/` + `.agents/skills/`)

Rationale: `.agents/skills/` existe no repo e está vazio; instalar nos dois evita que parte do ferramental não enxergue as skills.
Alternativas consideradas: só `.opencode/skills/` (rejeitado: `.agents/` ficaria inconsistente).

### 3. Stryker restrito a `frontend/lib/**/*.ts`, fora testes, sem CI

Rationale: `lib/` concentra a lógica testável; `break 50` baixo porque é primeira adoção — informacional, não bloqueante; meta 80% espelha o threshold do projeto como aspiração.
Alternativas consideradas: mutar tudo incluindo `app/` e `features/` (rejeitado: ruído); integrar ao CI já (rejeitado: fora do escopo).

### 4. Script `mutation` isolado, sem tocar `test` ou CI

Rationale: separa adoção manual de enforcement automático; evita quebrar o pipeline.
Alternativas consideradas: `test` rodando Stryker junto (rejeitado: lento, fora do escopo).

### 5. SOLID sem checklist dedicado (decisão consciente)

Rationale: eixo Arquitetura de `code-review-and-quality` já pergunta por fronteiras de módulo, direção de dependências, acoplamento e nível de abstração — checklist item-a-item (SRP/OCP/LSP/ISP/DIP) adicionaria burocracia sem lacuna demonstrada.
Alternativas consideradas: checklist SOLID próprio (rejeitado: sem evidência de necessidade; reavaliar se revisões futuras mostrarem falta).

## Risks / Trade-offs

- [Risco] Versão do Stryker incompatível com Vitest 5 na instalação → Mitigação: `pnpm install` na apply prova compatibilidade; se quebrar, pinar versão e registrar.
- [Risco] Skills upstream desatualizarem → Mitigação: cópia pontual documentada; atualização futura via change próprio.
- [Risco] Mutation score inicial baixo desmotivar uso → Mitigação: `break 50` não bloqueia; meta 80% é aspiração, não gate.
- [Trade-off] Duplicação das skills em 2 pastas → aceito: custo de cópias, benefício de visibilidade total.
