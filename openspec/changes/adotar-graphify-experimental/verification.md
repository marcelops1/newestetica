# Verificação — adotar-graphify-experimental

- **Change:** `openspec/changes/adotar-graphify-experimental` (branch `docs/adotar-graphify-experimental`)
- **Data:** 2026-09-24
- **Natureza:** documentação pura + 1 linha de `.gitignore`; `skip_specs: true` (nenhum comportamento de produto muda). Gatilhos de segurança de docs/07 §7: o change cria regra sobre dados de paciente → revisão registrada abaixo.

## 1. Escopo entregue (tasks)

- [x] 1.1 — §21 "graphify como ferramenta experimental de navegação de codebase" no 04 (Escolhido/Motivos/Alternativas/Implicações); Referências → §22; grep confirma nenhuma ref numérica quebrada (só o proposal arquivado do ai-memory cita §20/§21 como registro histórico próprio — não mexer; refs vivas a §20 intactas).
- [x] 2.1 — subseção "Navegação de codebase por ferramenta de IA (graphify)" no 03 §4 (ai-memory preservada); seção "Grafo de conhecimento do codebase (opcional)" no AGENTS §12, em português, com conteúdo operacional preservado e cláusula de prevalência; `graphify-out/` no `.gitignore` (verificado com `git check-ignore -v` → `.gitignore:68`).
- [x] 3.1 — gates + revisão de segurança (abaixo).
- [x] 3.2 — backlog avaliado por releitura: nada de tooling/UC afetado → sem atualização (mesmo critério do change do ai-memory).

## 2. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `pnpm lint` | ✅ limpo |
| `pnpm format` | ✅ limpo (cobre os `.md` editados) |
| `pnpm typecheck` | ✅ limpo |
| `pnpm test` | ✅ contracts 12/54, frontend 15/109, backend 23/89 |
| `pnpm build` | ✅ limpo |

## 3. Revisão de segurança (contra `docs/security/03-seguranca.md`)

- Nenhum segredo, token ou dado real entrou nos textos (só termos genéricos/fictícios já usados no repo).
- A regra nova não contradiz o 03: alinha-se às Regras obrigatórias do §4 e às proibições do §10 (itens 3 e 5); segue o mesmo molde da subseção do ai-memory.
- Referências cruzadas conferidas nos dois sentidos: 04 §21 ↔ 03 §4.
- FYI: a instalação real (CLI/skill/hooks) continua fora do repo versionado e fora deste change; o plugin local `.opencode/plugins/graphify.js` é gitignored (por-máquina).

## 4. Notas de execução

- Achado e corrigido em voo: a primeira edição do 03 §4 **substituiu** a subseção do ai-memory em vez de adicionar após — restaurada na edição seguinte e conferida por releitura (ai-memory intacta + graphify abaixo). Sem impacto (erro pego antes do commit).
- `05-estado-atual.md` **não** atualizado de propósito: pertence aos changes de revisão de estado (fora de escopo, registrado no proposal).
- `openspec validate --changes adotar-graphify-experimental`: 1 passed, 0 failed (`skip_specs` aceito).
