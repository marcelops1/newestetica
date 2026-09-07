## 1. Movimentação (exceção docs/07 §4 registrada aqui)

> Exceção aplicável: mover arquivos e atualizar caminhos não altera comportamento executável; a verificação de cada task é `git mv` + `grep` + gates verdes, sem ciclo RED.

- [x] 1.1 Criar pastas, READMEs mapa e `adr/.gitkeep`, mover os docs com `git mv` (protótipos para `product/prototypes/`) e verificar com `git status` que foram renomeações
- [x] 1.2 Atualizar referências em `AGENTS.md`, `frontend/AGENTS.md`, `backend/AGENTS.md` e referências internas, e verificar que `grep -r "docs/0"` retorna vazio
- [x] 1.3 Reescrever a seção 7 do `AGENTS.md` com os papéis reais dos modelos (escolha livre mantida) e verificar que nenhum outro trecho do arquivo mudou

## 2. Verificação e archive

- [x] 2.1 Rodar quality gates e `openspec validate` e verificar que tudo passa sem tocar em código
- [x] 2.2 Registrar verificação de segurança (`verification.md`: não aplicável, sem gatilho docs/07 §7) e arquivar com specs sincronizadas
