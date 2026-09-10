## 1. Formalizar a seção 13 (mudança sem comportamento executável — exceção docs/07 §4 registrada aqui)

> Exceção aplicável: adição só de Markdown de processo em docs/07; verificação por leitura + `grep` + `openspec validate`, sem ciclo RED.

- [x] 1.1 Reaplicar/confirmar a seção "13. Padrão de testes por prioridade" em `docs/engineering/07-workflow-de-engenharia.md` com o conteúdo aprovado e verificar com `grep` que as três faixas e a regra de cobertura existem no arquivo
- [x] 1.2 Rodar quality gates e `openspec validate` e verificar que tudo passa sem tocar em código

## 2. Verificação e archive

- [x] 2.1 Registrar em `verification.md` a avaliação de segurança (doc puro: sem gatilho docs/07 §7; lacunas de skills da Fase 1 que tocam segurança) e arquivar via `openspec-archive-change` com specs sincronizadas
