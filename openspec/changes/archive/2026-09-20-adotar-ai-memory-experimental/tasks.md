## 1. Registrar decisão em 04 (§20)

- [x] 1.1 Adicionar a §20 ("ai-memory como ferramenta experimental de continuidade entre agentes", Escolhido/Motivos/Alternativas/Implicações conforme escopo aprovado — experimental, dev-only, separada do compose, sem substituir AGENTS/OpenSpec) antes das Referências, renumerando Referências para §21, e checar por grep que nenhuma referência a números de seção quebrou (exceção docs/07 §4: documentação de decisão sem comportamento executável; verificação por releitura + grep). Execução: §20 criada; Referências → §21; grep de refs a números de seção do 04 → vazio (nenhuma quebrada)

## 2. Regra de segurança + nota AGENTS

- [x] 2.1 Adicionar a subseção de captura de sessão em 03 §4 (NUNCA dado real de paciente; reforço via path-exclusion/allowlist antes de dado real existir no backend) + nota opcional/experimental em AGENTS §12 com cláusula de prevalência (exceção docs/07 §4: sem comportamento executável; verificação por releitura). Execução: subseção "Captura de sessão por ferramentas de IA (ai-memory)" no 03 §4 e "Ferramentas de memória de sessão (opcional)" no AGENTS §12, ambas com a regra e a prevalência

## 3. Verificação e registro

- [x] 3.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança contra `docs/security/03-seguranca.md` (a regra nova é sobre dados futuros; checar que nenhum segredo ou dado real entrou nos textos e que a regra não contradiz o restante do 03) e registrar em `verification.md`, e verificar que tudo passa (exceção docs/07 §4: sem comportamento executável; verificação pelos próprios gates)
- [x] 3.2 Avaliar `docs/product/08-backlog-produto.md` (atualizar somente se algum status estiver incorreto — registro de decisão, sem UC) (exceção docs/07 §4: sem comportamento executável; verificação por releitura)
