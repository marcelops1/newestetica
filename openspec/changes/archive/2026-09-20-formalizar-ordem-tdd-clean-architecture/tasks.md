## 1. Seção 15 no 07 (test-first, exceção docs/07 §4)

- [x] 1.1 Constatar a ausência: `grep` por "Ordem de construção TDD por camada" em `docs/engineering/07-workflow-de-engenharia.md` retorna vazio e a seção 6 não referencia ordem por camada — RED. Verificação: saída vazia do `grep` colada na task. Execução 2026-09-20: `grep -c` → 0 (RED real)
- [x] 1.2 Escrever a seção 15 ("Ordem de construção TDD por camada (Clean Architecture)") após a seção 14, com princípio, ordem Domain → Application → Infrastructure → Presentation com o veículo de teste de cada camada, regra de bloqueio verificável e vínculo com a DoD — GREEN. Verificação: releitura da seção confirma princípio, ordem, bloqueio e vínculo — exceção docs/07 §4 (documentação sem comportamento). Execução: seção 15 criada (linhas 210+, `grep ^## ` lista 15 após 14)

## 2. Referências cruzadas e verificação

- [x] 2.1 Adicionar a referência cruzada na seção 6 (Definition of Done) e ajustar a seção de Referências do 07 se necessário — exceção docs/07 §4 (documentação sem comportamento; verificação por releitura). Verificação: releitura confirma as referências. Execução: vínculo adicionado como nota em prosa na §6 (sem novo item de checklist — evita exigir mudança no template de PR); §12 Referências lista só docs externos, sem ajuste necessário
- [x] 2.2 Registrar `verification.md` (sem gatilho de segurança — docs/07 §7: sem entrada de usuário, auth, dados de paciente, integração ou segredo; com registro obrigatório mesmo fora dos gatilhos) — exceção docs/07 §4 só para a escrita do registro. Verificação: `verification.md` existe com o registro
