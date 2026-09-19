## 1. Nomear Clean Architecture (02 §7 + backend/AGENTS.md)

- [x] 1.1 Adicionar o nome "Clean Architecture" e a regra de dependência exata (`domain/` isolado; `application/` só de `domain/`; `infrastructure/` implementa interfaces do `domain/`; `presentation/` de `application/`) nos dois arquivos, sem alterar o restante (exceção docs/07 §4: documentação de padrão sem comportamento executável; verificação por releitura comparando com o texto aprovado no design)

## 2. Detalhar testes em 07 §13 + criar §14

- [ ] 2.1 Estender §13 (integração/contrato com o *como* do backend via Docker/Testcontainers; subcategoria adversarial explícita em segurança), preservando faixas e itens existentes (exceção docs/07 §4: sem comportamento executável; verificação por releitura + checar que nada do texto vigente foi removido)
- [ ] 2.2 Criar a §14 ("Regressão de prompts de desenvolvimento") ao final do arquivo com a formalização agnóstica de modelo, seed de padrões observados e sinais de degradação — sem SHALL de enforcement e sem citar nomes de modelos como regra (exceção docs/07 §4: sem comportamento executável; verificação por releitura + grep de nomes de modelos na seção nova)

## 3. Backlog Feature 4.2

- [ ] 3.1 Estender a linha de intro da Feature 4.2 com a regra de dependência de Clean Architecture (cobrindo os 7 UCs sem editá-los) (exceção docs/07 §4: sem comportamento executável; verificação por releitura)

## 4. Verificação e registro

- [ ] 4.1 Rodar quality gates (`lint`, `format`, `typecheck`, `test`, `build`), revisar segurança contra `docs/security/03-seguranca.md` (documentação pública sem segredos nem dados: registrar não-aplicabilidade dos gatilhos §7 e checar que nenhum segredo ou dado real entrou nos textos) e verificar que tudo passa (exceção docs/07 §4: sem comportamento executável; verificação pelos próprios gates)
- [ ] 4.2 Registrar `verification.md` e confirmar que nenhum outro backlog/UC foi tocado além da linha da Feature 4.2 (exceção docs/07 §4: sem comportamento executável; verificação por `git diff --stat` + releitura)
