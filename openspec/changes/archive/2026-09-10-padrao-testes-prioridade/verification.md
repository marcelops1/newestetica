# Verificação — padrao-testes-prioridade

Avaliação contra `docs/security/03-seguranca.md` e docs/07 §7. Data: 2026-09-10.

## Gatilhos de docs/07 §7

**Sem gatilho direto.** Mudança exclusiva de Markdown de processo (docs/07 §13 + artefatos do change): sem código, sem entrada de usuário, sem auth, sem dado de paciente, sem integração, sem segredos.

## Lacuna relevante revelada pela Fase 1 (investigação das skills)

A investigação cobriu `test-driven-development`, `security-and-hardening` e `code-review-and-quality` contra 8 tipos de teste, com um achado que toca segurança:

- **Testes de segurança OWASP têm exigência sem método:** a seção 13 os põe em "sempre exigir", mas `security-and-hardening` ensina prevenção (padrões OWASP, validação, escaping) e manda escrever abuse cases como primeiro teste — sem guia de como escrever/executar testes de segurança. Risco aceito e documentado no `design.md`: vale o abuse-case como mínimo; guia de escrita fica como lacuna conhecida, sem criar skill nova (decisão do solicitante).
- **Sem impacto neste change:** nenhuma skill nova foi criada; contrato/schema, mutation, falha/resiliência e carga seguem descobertos e alocados às faixas "com frequência/parcimônia" justamente por isso.

## Gates executados (task 1.2)

- `pnpm lint` — passou
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 5 arquivos, 22 testes, cobertura 100%
- `pnpm build` — passou (zero erros)
- `openspec validate --all` — 8 passed, 0 failed (INFO pré-existente em `public-site-structure`, fora deste change)
