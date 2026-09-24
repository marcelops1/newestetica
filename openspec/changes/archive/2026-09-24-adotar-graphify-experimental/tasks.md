## 1. Registrar decisão em 04 (§21)

- [x] 1.1 Adicionar a §21 ("graphify como ferramenta experimental de navegação de codebase", Escolhido/Motivos/Alternativas/Implicações conforme escopo aprovado — experimental, dev-only, código local sem custo, docs/PDFs pelo modelo da sessão, sem substituir AGENTS/OpenSpec) antes das Referências, renumerando Referências para §22, e checar por grep que nenhuma referência a números de seção quebrou (exceção docs/07 §4: documentação de decisão sem comportamento executável; verificação por releitura + grep)

## 2. Regra de segurança + seção AGENTS + ignore

- [x] 2.1 Adicionar a subseção do graphify em 03 §4 (NUNCA dado real de paciente em docs/PDFs; reforço técnico obrigatório antes de existir dado real no projeto) + seção operacional completa em português no AGENTS (conteúdo preservado: grafo em `graphify-out/`, gatilho `/graphify` + skill, `query` primeiro com `graph.json`, `path`/`explain`, wiki, `GRAPH_REPORT.md` só para revisão ampla, `update .` após modificar código, cláusula de prevalência) + entrada `graphify-out/` no `.gitignore` (exceção docs/07 §4: sem comportamento executável; verificação por releitura das três edições + `git check-ignore graphify-out`)

## 3. Verificação e registro

- [x] 3.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança contra `docs/security/03-seguranca.md` (checar que nenhum segredo ou dado real entrou nos textos e que a regra nova não contradiz o restante do 03) e registrar em `verification.md`, e verificar que tudo passa (exceção docs/07 §4: sem comportamento executável; verificação pelos próprios gates)
- [x] 3.2 Avaliar `docs/product/08-backlog-produto.md` (atualizar somente se algum status estiver incorreto — registro de decisão e ferramenta, sem UC) (exceção docs/07 §4: sem comportamento executável; verificação por releitura)

## Execução (notas das tasks 1.1 e 2.1)

- 1.1: §21 criada; Referências → §22; grep por refs a "§21" fora do archive → só o proposal arquivado do ai-memory (registro histórico próprio, não mexer); refs a §20 intactas.
- 2.1: subseção "Navegação de codebase por ferramenta de IA (graphify)" no 03 §4 (ai-memory preservada acima); seção "Grafo de conhecimento do codebase (opcional)" no AGENTS §12 em português com prevalência; `graphify-out/` no `.gitignore` (verificado com `git check-ignore -v`).

## Execução (notas das tasks 3.1 e 3.2)

- 3.1: gates verdes (lint/format/typecheck/test/build; testes 54+109+89); revisão de segurança no verification §3 (sem segredos/dados reais; sem contradição com o 03; refs 04 §21 ↔ 03 §4 conferidas).
- 3.2: backlog sem menção a tooling → sem atualização.
