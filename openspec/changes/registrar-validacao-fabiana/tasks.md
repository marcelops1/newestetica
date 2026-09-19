## 1. Registrar validação nos UCs do Épico 1

- [x] 1.1 Atualizar as 7 cláusulas "pendente validação com a Fabiana" (linhas 24, 39, 54, 96, 140, 169, 184 do backlog) para "validado com a Fabiana em 2026-09-19", promovendo "Em andamento"→"Concluído" onde a validação era a única pendência (1.2.1, 1.3.1, 1.5.1, 1.7.1, 1.8.2, 1.9.1), sem tocar nos demais UCs (exceção docs/07 §4: backlog sem comportamento executável; verificação por grep antes/depois contando ocorrências: 7→0)

## 2. Tabela-resumo + 05-estado-atual

- [ ] 2.1 Atualizar a linha do Épico 1 na tabela-resumo (validação concluída, pendências restantes explícitas) e os 4 pontos do 05 (fase pós-validação com backend liberado; remover "aceite pendente" do §4; §6 com Épico 4 primeiro; tabela com validação concluída em 2026-09-19) (exceção docs/07 §4: sem comportamento executável; verificação por releitura + grep)

## 3. Verificação e registro

- [ ] 3.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança contra `docs/security/03-seguranca.md` (backlog/estado sem segredos nem dados: registrar não-aplicabilidade dos gatilhos §7 e checar que nenhum segredo ou dado real entrou nos textos) e verificar que tudo passa (exceção docs/07 §4: sem comportamento executável; verificação pelos próprios gates)
- [ ] 3.2 Registrar `verification.md` e confirmar escopo via `git diff --stat` (só backlog + 05; README/AGENTS.md/00/02 intactos, FYI registrado) (exceção docs/07 §4: sem comportamento executável; verificação por releitura)
