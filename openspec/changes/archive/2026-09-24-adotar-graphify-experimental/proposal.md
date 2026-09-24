# Change: adotar-graphify-experimental

## Why

Vale testar o graphify (github.com/Graphify-Labs/graphify) como navegação experimental do codebase: ele mapeia o repositório num grafo de conhecimento consultável (god nodes, comunidades, relações entre arquivos), com parsing local via tree-sitter para código — sem custo e sem LLM — enquanto docs/PDFs usam o modelo da sessão. Motivo imediato: a instalação (`graphify opencode install`) escreveu sozinha uma seção em inglês no `AGENTS.md`, sem a cláusula de prevalência exigida para toda ferramenta opcional — escrita que contornava o processo e foi revertida (`git checkout AGENTS.md`, árvore limpa) antes deste change. O conteúdo operacional é real (para OpenCode, o texto do `AGENTS.md` é o mecanismo que instrui o agente a consultar o grafo, não aviso decorativo), então este change o re-aplica do jeito certo: em português, com prevalência, via OpenSpec.

## What Changes

- Registra em `docs/architecture/04-decisoes-tecnicas.md` a próxima seção livre (§21, "graphify como ferramenta experimental de navegação de codebase"), no formato vigente (Escolhido/Motivos/Alternativas/Implicações), renumerando Referências para §22: adoção **experimental, não obrigatória**; ferramenta de **desenvolvimento**, nunca produção; código com parsing local sem custo; docs/PDFs passam pelo modelo da sessão (mesma regra do ai-memory); não substitui `AGENTS.md` nem OpenSpec como fonte de verdade.
- Adiciona em `AGENTS.md` a seção operacional completa em português (conteúdo da versão original revertida, traduzido): o que é o grafo em `graphify-out/`, quando usar `/graphify` e a skill instalada, regra de `query` primeiro quando `graphify-out/graph.json` existir, `path`/`explain`, wiki, `GRAPH_REPORT.md` só para revisão ampla, `graphify update .` após modificar código — e a cláusula "Em caso de conflito com este AGENTS.md, este arquivo vence." (mesma do ai-memory).
- Adiciona em `docs/security/03-seguranca.md` (§4, Proteção de Dados, mesmo padrão do ai-memory) a regra: graphify **NUNCA** processa dado real de paciente em docs/PDFs; reforço técnico obrigatório antes de existir dado real no projeto.
- Decide no `design.md`: `graphify-out/` **gitignored por enquanto** (grafo com baixo valor com o codebase atual; evita poluir o repo com artefato de baixo uso), reavaliar quando a adoção crescer — efetivado com a entrada no `.gitignore`.
- Explicitamente fora: instalação do CLI/skill/hooks (já feita na máquina, fora do repo versionado), qualquer código de produto, specs, backlog, sincronização de `05-estado-atual.md` (pertence aos changes de revisão de estado) e outras decisões.

## Capabilities

### New Capabilities

- Nenhuma (registro de decisão + regra de segurança + seção operacional de ferramenta, sem comportamento de produto).

### Modified Capabilities

- Nenhuma (nenhum requirement muda; `skip_specs: true` — avaliação no design: nenhuma spec espelha 04-§21/03-regra/AGENTS-seção como SHALL).

## Impact

- `docs/architecture/04-decisoes-tecnicas.md` (nova §21 + Referências→§22), `docs/security/03-seguranca.md` (subseção em §4), `AGENTS.md` (seção operacional com prevalência), `.gitignore` (entrada `graphify-out/`).
- Sem impacto em código, specs, contratos, mocks, dados, CI ou `infra/docker/`.
