# Verificação — formalizar-ordem-tdd-clean-architecture

Change de documentação de processo: seção 15 no 07 (ordem de construção TDD por camada) + vínculo na seção 6. Data: 2026-09-20.

## Gatilhos de segurança (docs/07 §7)

- **Nenhum gatilho acionado:** sem entrada de usuário, autenticação/autorização, dados de paciente, integrações externas ou segredos — change 100% documentação de processo, sem código.
- Registro obrigatório mesmo fora dos gatilhos: este arquivo.

## Revisão de conteúdo (contra 02 §7, 04 §5, 07 §§4–6, 07 §13)

- [x] A seção 15 não contradiz a regra de dependência (02 §7 intacto) — ela define a ordem temporal, não a estrutura.
- [x] Repository + Data Mapper citados conforme 04 §5; integração contra banco em container conforme 07 §13; ciclo RED→GREEN e formato test-first conforme 07 §§4–5.
- [x] O vínculo na §6 é nota em prosa (sem novo item de checklist) — o template de PR segue válido sem alteração.
- [x] Sem código para `code-review-and-quality` revisar; sem dado de paciente em exemplos (nenhum exemplo com dado).
- **Conclusão:** sem achados. Sem pendências.

## Prova executável (test-first de docs)

- **RED 1.1:** `grep -c "Ordem de construção TDD por camada" docs/engineering/07-workflow-de-engenharia.md` → 0.
- **GREEN 1.2:** seção 15 presente (`grep ^## ` lista 15 após 14); releitura confirma princípio, ordem com veículo por camada, bloqueio e vínculo.

## Gates executados

- `pnpm lint`, `format`, `typecheck`, `test`, `build` — ver registro do commit/PR (docs-only: nenhum código tocado).
- `pnpm exec openspec validate --all` — ver registro no archive.
