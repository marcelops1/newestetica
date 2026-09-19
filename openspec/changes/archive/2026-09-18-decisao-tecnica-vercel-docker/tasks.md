## 1. Registrar decisões em 04-decisoes-tecnicas.md

- [x] 1.1 Adicionar as linhas de Vercel e Docker na tabela de Stack (§2) e as duas seções de decisão (Escolhido/Motivos/Implicações + alternativas rejeitadas, conforme escopo aprovado) antes das Referências, renumerando Referências para §20, e checar por grep que nenhuma referência a números de seção quebrou (exceção docs/07 §4: documentação de decisão sem comportamento executável; verificação por releitura + grep)

## 2. Registrar no estado atual

- [x] 2.1 Adicionar os 2 bullets em "Decisões técnicas já tomadas" de `docs/product/05-estado-atual.md` e confirmar por grep que não resta menção das decisões como pendentes (exceção docs/07 §4: sem comportamento executável; verificação por releitura + grep)

## 3. Verificação e registro

- [x] 3.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança contra `docs/security/03-seguranca.md` (documentação pública sem segredos nem dados: registrar não-aplicabilidade dos gatilhos §7 e checar que nenhum segredo entrou nos textos) e verificar que tudo passa (exceção docs/07 §4: sem comportamento executável; verificação pelos próprios gates)
- [x] 3.2 Registrar `verification.md` e avaliar `docs/product/08-backlog-produto.md` (atualizar somente se algum status estiver incorreto) (exceção docs/07 §4: sem comportamento executável; verificação por releitura)
