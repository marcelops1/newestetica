## Context

Ver `proposal.md` (Why). Ponto de partida: 05 com números de uma fase antiga (4 specs, 2 arquivados, 1 ativo, 8 testes, "só home") e README em "fase de documentação de fundação / sem código". Números reais levantados por comando nesta proposta: 7 specs / 72 requirements, 22 changes arquivados, 0 ativos, 14 arquivos / 104 testes / 100% de cobertura, 10 rotas (`/`, `/tratamentos`, `/tratamentos/[slug]`, `/sobre`, `/antes-depois`, `/depoimentos`, `/orcamento`, `/contato`, `/blog`, `/blog/[slug]`), Épico 1 com 9 features (1.1 Home Concluída; 1.2–1.9 Em andamento, exceto 1.6.2 Não iniciado), PRs #18 e #19 mergeados em `main`, 3 camadas de defesa ativas (pre-commit husky+lint-staged, CI `quality.yml` com check "quality gates", branch protection com enforce_admins).

## Goals / Non-Goals

**Goals:**

- 05 e README voltam a ser fotografia fiel e auditável do projeto, com cada número rastreável a um comando executado.

**Non-Goals:**

- Mudar decisões, status de Use Cases no backlog, specs ou qualquer código; reestruturar a documentação além dos dois arquivos.

## Decisions

### 1. Reescrever os dois arquivos em vez de patch pontual

Rationale: a defasagem é sistêmica (fase, números, caminhos, modelos), não pontual; patch preservaria um framing escrito para outra fase ("pré-validação só-home", "sem código"). Alternativa considerada: ajustes pontuais (rejeitada — manteria o enquadramento errado).

### 2. Cada número com fonte de verificação registrada

Rationale: doc de estado só vale se for auditável; a task 1.1 registra comando→valor observado. Alternativa considerada: estimar a partir de memória da sessão (rejeitada — foi assim que a deriva nasceu).

### 3. `skip_specs: true`, sem delta de spec

Rationale: nenhum requirement muda; inventar delta só para satisfazer a validação é proibido pelas instruções do workflow. Alternativa considerada: delta vazio (rejeitada — `openspec validate` rejeita change sem deltas e sem o marcador).

### 4. README espelha AGENTS.md §7 nos modelos e usa caminhos reais de docs

Rationale: o README lista modelos divergentes ("DeepSeek V4 ou GLM-5.3 Flash", "Kimi K3") e caminhos inexistentes (`docs/00-visao-do-produto.md` etc.); a fonte correta é AGENTS.md §7 (GLM-5.3, DeepSeek V4 Flash, DeepSeek V4 Pro, Muse Spark) e a árvore real (`docs/product/`, `docs/architecture/`, `docs/security/`, `docs/engineering/`). Alternativa considerada: remover a seção de modelos (rejeitada — útil para recém-chegados; basta sincronizar).

## Risks / Trade-offs

- [Risco] Doc de estado apodrecer de novo → Mitigação: números triviais de re-verificar (comandos registrados na task 1.1); registrar em `verification.md` a sugestão de revisitar o 05 a cada marco, sem automatizar agora (YAGNI).
- [Trade-off] Nenhum relevante: só texto, sem comportamento.
