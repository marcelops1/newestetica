## 1. Criar template e amarrar na DoD (mudança sem comportamento executável — exceção docs/07 §4 registrada aqui)

> Exceção aplicável: criação/edição só de Markdown de processo (`.github/pull_request_template.md`, docs/07 §6); verificação por leitura + `grep` + `openspec validate`, sem ciclo RED.

- [x] 1.1 Criar `.github/pull_request_template.md` com os 6 itens (gates, TDD/exceção §4, segurança §7 em verification.md, backlog, pergunta C2/C3, archive com specs) e verificar com `grep` que cada item existe no arquivo
- [x] 1.2 Acrescentar na Definition of Done (docs/07, seção 6) a referência ao checklist do PR como mecanismo auto-verificável e verificar que a seção 6 menciona o template

## 2. Verificação e archive

- [ ] 2.1 Rodar quality gates e `openspec validate` e verificar que tudo passa sem tocar em código de produto
- [ ] 2.2 Registrar verificação de segurança (templates/docs puros: sem gatilho docs/07 §7) em `verification.md` e arquivar via `openspec-archive-change` com specs sincronizadas
