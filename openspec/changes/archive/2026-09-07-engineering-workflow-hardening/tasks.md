## 1. Governança (AGENTS.md e docs)

- [x] 1.1 Promover TDD e gate de segurança a regras absolutas na seção 8 do `AGENTS.md` e verificar que o texto proíbe qualquer exceção além da documentável
- [x] 1.2 Apontar a seção 12 do `AGENTS.md` para `docs/07-workflow-de-engenharia.md` como fonte única e verificar que não resta duplicação do fluxo no `AGENTS.md`

## 2. Documento do fluxo unificado (docs/07-workflow-de-engenharia.md)

- [x] 2.1 Escrever `docs/07-workflow-de-engenharia.md` (etapas, skill obrigatória por etapa, formato test-first, Definition of Done) e verificar que cada uma das 8 etapas tem skill declarada

## 3. Gates executáveis (scripts da raiz e threshold de cobertura)

- [x] 3.1 Escrever a verificação que falha: executar os scripts atuais da raiz e registrar que são placeholders `echo` (saída zero sem executar gate algum) e que não há threshold de cobertura
- [x] 3.2 Implementar scripts reais na raiz (lint, format, typecheck, test com cobertura, build) delegando aos pacotes e verificar que cada script executa o gate correspondente
- [x] 3.3 Configurar threshold de 80% que reprova o build e verificar que a verificação da task 3.1 agora falha de verdade (saída diferente de zero) quando a cobertura cai abaixo de 80%

## 4. Automação (CI, auditoria de dependências, varredura de segredos)

- [x] 4.1 Escrever a verificação que falha: constatar a ausência de workflows em `.github/` e demonstrar que um push atual não executa gate algum
- [x] 4.2 Criar o pipeline de CI (gates, auditoria de dependências, varredura de segredos em push e PR) e verificar que a sintaxe é válida e que cada job executa o comando correspondente

## 5. Sincronização de estado (AGENTS.md seção 10 e docs/05-estado-atual.md)

- [x] 5.1 Corrigir a seção 10 do `AGENTS.md` para a fase real do projeto e verificar que ela não contradiz `docs/05-estado-atual.md`
- [x] 5.2 Atualizar `docs/05-estado-atual.md` com o novo fluxo e verificar consistência cruzada com `AGENTS.md` e specs

## 6. Verificação e archive

- [x] 6.1 Rodar todos os gates e `openspec validate` em modo estrito e verificar que tudo passa
- [x] 6.2 Registrar a revisão com `security-and-hardening` no change e verificar que o archive só ocorre com o registro presente
