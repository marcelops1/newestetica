## Context

Ver `proposal.md` (Why). Estado verificado no disco: a escrita automática do `graphify opencode install` no `AGENTS.md` foi revertida (árvore limpa); a skill está instalada user-global em `~/.config/opencode/skills/graphify/` (`SKILL.md` + `references/`); o plugin `.opencode/plugins/graphify.js` existe mas é gitignored (por-máquina, não versionado); `graphify-out/` não existe e não está ignorado; o CLI não está no PATH desta máquina (instalação via `uv tool install graphifyy`, README upstream). README upstream (github.com/Graphify-Labs/graphify, v8) confirma: parsing de código local via tree-sitter sem custo/LLM; docs/PDFs passam pelo modelo da sessão; comandos `query`/`path`/`explain`; saídas `graph.json` + `GRAPH_REPORT.md` (+ wiki com `--wiki`); `graphify update .` após mudanças; e — ponto de decisão abaixo — recomenda commitar `graphify-out/`.

## Goals / Non-Goals

**Goals:**

- Registrar a decisão de adoção experimental no formato vigente do 04 (mesmo padrão do §20 do ai-memory).
- Republicar o conteúdo operacional em português com cláusula de prevalência, preservando o mecanismo (para OpenCode, o texto do `AGENTS.md` instrui o agente — README upstream: "instruction-file platforms provide the same query-first guidance").
- Blindar docs/PDFs com dado real de paciente antes que ele exista (mesmo padrão do ai-memory no 03 §4).

**Non-Goals:**

- Instalar/configurar CLI, skill, hooks ou plugin (já feitos na máquina, fora do repo versionado).
- Versionar `graphify-out/` agora; mudar fluxo OpenSpec; tocar produto, specs ou backlog.

## Decisions

### 1. Seção operacional completa no `AGENTS.md` (não só um parágrafo)

Rationale: diferente do ai-memory (cujo roteamento vive no MCP e o `AGENTS.md` tem só um parágrafo), para OpenCode o texto do `AGENTS.md` **é** o mecanismo — sem ele, o agente não consulta o grafo. Por isso a seção preserva o conteúdo operacional da versão revertida, traduzido: o que há em `graphify-out/`, gatilho `/graphify` + skill, regra de `query` primeiro com `graph.json` existente, `path`/`explain`, wiki, `GRAPH_REPORT.md` só para revisão ampla, `update .` após modificar código, e a cláusula de prevalência idêntica à do ai-memory. Alternativa considerada: parágrafo curto como o do ai-memory (rejeitada — esvaziaria o mecanismo no OpenCode).

### 2. `graphify-out/` gitignored por enquanto (+ entrada no `.gitignore`)

Rationale: com o codebase atual, o grafo tem baixo valor e alto churn — versioná-lo poluiria o repo com artefato regenerável de baixo uso. A decisão é efetivada na mesma task (a entrada no `.gitignore` é a execução da decisão, não escopo extra). Gatilho de reavaliação: quando a adoção crescer (grafo consultado com frequência ou time maior), propor commitar `graphify-out/` (menos `cost.json`/cache) em change próprio. Alternativa considerada: commitar desde já (recomendação upstream — "meant to be committed"; rejeitada por enquanto pelo motivo acima).

### 3. Decisão §21 no 04 seguindo o molde do §20

Rationale: consistência com o precedente (ferramenta experimental de desenvolvimento): Escolhido/Motivos/Alternativas/Implicações, experimental e não obrigatória, dev-only, sem substituir `AGENTS.md`/OpenSpec. Referências do 04 renumeradas para §22 (grep de refs numéricas após a edição, mesmo cuidado do change do ai-memory).

### 4. Regra no 03 §4 seguindo o molde da captura de sessão

Rationale: o risco é o mesmo do ai-memory (conteúdo de sessão/docs alcançando a ferramenta), agravado porque docs/PDFs passam pelo modelo da sessão — se um dia houver dado real de paciente em doc/PDF indexado, ele circula. Regra desde já (NUNCA dado real) + reforço técnico obrigatório antes de existir dado real no projeto.

## Risks / Trade-offs

- [Risco] Reinstalações futuras (`graphify opencode install` em clone novo) reescreverem a seção em inglês sem prevalência → Mitigação: a versão aprovada neste change é a canônica; qualquer escrita automática deve ser revertida e, se preciso, retraduzida — registrar o episódio no `proposal.md` como precedente já deixa o padrão claro.
- [Risco] Grafo desatualizado induzir resposta errada → Mitigação: a própria seção instrui que `graphify-out/` "sujo" pós-hooks é esperado (não motivo para pular) e quando pular (tarefa sobre grafo incorreto ou ordem explícita do usuário); `update .` após modificar código mantém o grafo atual.
- [Trade-off] Skill user-global (não versionada): máquina nova precisa de `graphify install` — aceito; a seção menciona o pré-requisito em uma linha sem virar manual de instalação.
- [Trade-off] Plugin local gitignored lembra do grafo no bash, mas só nesta máquina — aceito; o mecanismo versionado e portável é a seção do `AGENTS.md`.

## Migration Plan

Sem migração: só Markdown e uma linha de `.gitignore`; rollback = reverter o merge. Nenhum dado existente é tocado; `graphify-out/` não existe, então nada muda no working tree além dos docs.

## Open Questions

Nenhuma bloqueante. A reavaliação de versionar `graphify-out/` e eventual `strict mode` ficam para changes próprios quando a adoção justificar.
