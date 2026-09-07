# 07 — Workflow de Engenharia — Newestetica

> **Fonte única do fluxo de engenharia.** Este documento detalha o COMO do processo: a junção entre as etapas do OpenSpec e o método das Agent Skills. Toda decisão de execução deve respeitar este arquivo, `AGENTS.md`, `docs/04-decisoes-tecnicas.md` e `docs/03-seguranca.md`.

---

## 1. Objetivo e autoridade deste documento

Definir o fluxo unificado de engenharia do projeto: quais etapas existem, qual skill governa cada etapa, que artefato cada etapa produz e o que libera a etapa seguinte.

**Autoridade:** este documento detalha o COMO do processo. Em caso de conflito com este arquivo, o `AGENTS.md` continua vencendo.

---

## 2. Princípio de junção: OpenSpec + Agent Skills

- O **OpenSpec** define as etapas e onde os artefatos moram (`openspec/changes/`, `openspec/specs/`), além do gate que libera cada etapa.
- As **Agent Skills** definem o método dentro de cada etapa (como pensar, como quebrar, como implementar, como revisar).
- Nenhum dos dois substitui o outro: etapa sem skill vira improviso; skill sem etapa vira trabalho sem registro nem gate.

---

## 3. Etapa OpenSpec → skill obrigatória → artefato → critério de saída

| Etapa OpenSpec | Skill obrigatória (carregar antes) | Artefato | Critério de saída |
| ---------------- | ----------------------------------- | -------- | ------------------ |
| Explore | `openspec-explore` | Entendimento registrado + nome do change | Escopo e nome definidos, sem ambiguidade material |
| Propose | `openspec-propose` + `spec-driven-development` | `proposal.md` | `openspec validate` passa; capabilities declaradas |
| Specs | `spec-driven-development` | `specs/` (deltas) | Requisitos SHALL testáveis, cada um com cenário WHEN/THEN |
| Design | `spec-driven-development` | `design.md` | Decisões com rationale e alternativas rejeitadas |
| Tasks | `planning-and-task-breakdown` | `tasks.md` | Tasks no formato test-first (seção 5) |
| Apply | `openspec-apply-change` + `incremental-implementation` + `test-driven-development` (+ `frontend-ui-engineering` se for UI) | Código + testes | Gates verdes + Definition of Done (seção 6) |
| Verify | `code-review-and-quality` + `security-and-hardening` | Registros de revisão no change | Revisões registradas; archive bloqueado sem elas |
| Archive | `openspec-archive-change` + `openspec-sync-specs` | Change arquivado + specs sincronizadas | `openspec validate --all` passa |

Em dúvida sobre qual skill usar em qualquer etapa: `using-agent-skills`.

---

## 4. TDD é inegociável

Ciclo obrigatório: **RED → GREEN → REFACTOR**.

- **RED:** escrever primeiro o teste que falha, provando o comportamento ausente.
- **GREEN:** implementar o mínimo para o teste passar.
- **REFACTOR:** simplificar sem mudar o comportamento, com os testes verdes.

**O que conta como comportamento testável:** qualquer mudança observável — regra de negócio, filtro, validação, estado de UI, formato de dado, gate que reprova.

**A única exceção:** mudanças que não alteram comportamento — documentação, configuração pura, renomeação sem mudança de sentido. A exceção SHALL ser escrita na própria task; sem esse registro, a task segue o ciclo completo.

---

## 5. Formato obrigatório de task

Toda task de implementação SHALL ser precedida pela task do teste que falha.

**Exemplo correto (test-first):**

```markdown
- [ ] 3.1 Escrever o teste que reprova cobertura abaixo de 80% e verificar que ele falha com os scripts atuais
- [ ] 3.2 Configurar o threshold de 80% no runner e verificar que o teste da task 3.1 agora passa e que cobertura menor reprova o build
```

**Exemplo errado (padrão antigo):**

```markdown
- [ ] 3.1 Configurar o threshold de cobertura e verificar que o build passa
```

O segundo não é TDD: ele descreve verificação depois da implementação. Se a configuração estiver errada de um jeito que o próprio verificador não percebe, nada acusa — o teste que falha antes existe justamente para provar que a verificação é capaz de falhar.

---

## 6. Definition of Done

Uma task SHALL ser considerada concluída somente quando atender a todos os itens:

- [ ] Teste que falhou antes de existir código (ou exceção registrada na task, seção 4)
- [ ] Lint passando
- [ ] Formatação passando
- [ ] Typecheck passando
- [ ] Testes com cobertura acima de 80% passando
- [ ] Build passando (quando aplicável)
- [ ] Revisão com `code-review-and-quality` registrada
- [ ] Revisão de segurança contra `docs/03-seguranca.md` registrada, quando houver entrada de usuário, autenticação, dados de paciente ou integração (seção 7)
- [ ] Spec sincronizada com a implementação
- [ ] Nenhum dado real de paciente em mocks, testes ou exemplos

---

## 7. Segurança em cada etapa

Toda etapa respeita `docs/03-seguranca.md`. A revisão com `security-and-hardening` é obrigatória na etapa Verify — e o archive é bloqueado sem o registro — sempre que o change tocar em qualquer um destes gatilhos:

- Entrada de usuário (formulários, uploads, parâmetros, busca)
- Autenticação ou autorização (login, sessão, papéis, 2FA)
- Dados de paciente (cadastro, agendamento, histórico, fotos)
- Integrações externas (e-mail, calendário, WhatsApp, pagamentos)
- Segredos ou configuração sensível (tokens, chaves, `.env`, CI)

Fora dos gatilhos, a revisão de segurança é recomendada, mas o registro continua obrigatório para liberar o archive.

---

## 8. Referências cruzadas

- Regras para IAs: `AGENTS.md`
- Decisões técnicas: `docs/04-decisoes-tecnicas.md`
- Segurança: `docs/03-seguranca.md`
- Estado atual: `docs/05-estado-atual.md`
- Arquitetura: `docs/02-arquitetura.md`
