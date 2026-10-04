# Verificação — backend-modulo-identidade

- **Change:** `openspec/changes/backend-modulo-identidade` (branch `feature/backend-modulo-identidade`)
- **Data:** 2026-10-04 (apply)
- **Gatilhos de segurança (docs/07 §7):** autenticação e autorização (login/token/sessão/papéis/2FA), **dados de paciente via rotas que passam a ter acesso real**, segredos de teste/CI → revisão de segurança obrigatória (seção 4), com os 7 abuse cases do threat model um a um.

## 0. Baseline de caracterização (task 0.1 — antes de qualquer mudança)

Suíte completa do backend: **75 arquivos / 341 testes verdes**; cobertura 99,66% stmts / 98,08% branches / 100% funcs / 99,65% lines (comando: `pnpm --filter backend test`, log `/tmp/opencode/ident-apply/0.1-baseline.log`).

Recortes por módulo migrado (caracterização — rede de segurança da troca de guard):

| Módulo | Arquivos | Testes |
| --- | --- | --- |
| Pacientes | 9 | 36 |
| Atendimento | 11 | 76 |
| Financeiro | 8 | 36 |
