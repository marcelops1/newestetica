# Verificação de segurança — engineering-workflow-hardening

Revisão com a skill `security-and-hardening` contra `docs/03-seguranca.md`.
Data: 2026-09-07. Escopo: somente arquivos deste change (tooling, docs, specs, CI — nenhum comportamento de produto).

## Modelo de ameaça (resumo)

- Fronteiras tocadas: pipeline de CI (executa em push/PR), nova dependência (`@vitest/coverage-v8`), action de terceiros (Gitleaks), arquivos de docs/specs.
- Nenhuma fronteira nova de dados: sem entrada de usuário, sem autenticação, sem dados de paciente, sem integração externa com dados.
- Ativos relevantes: integridade do repositório e segredos do CI.

## Checagens contra docs/03-seguranca.md

| Regra (§) | Resultado |
| --------- | --------- |
| §6 segredos nunca no código | OK — varredura por padrões de segredo nos arquivos do change retornou limpo; único token referenciado é o `GITHUB_TOKEN` automático do Actions |
| §10 proibições (hardcode, fotos sem consentimento, dados sensíveis) | OK — nada do change coleta, exibe ou armazena dado de paciente; mocks não tocados |
| §11 mocks sem dados reais | OK — nenhum mock alterado neste change |
| Auditoria de dependências | OK — única dependência nova (`@vitest/coverage-v8@5.0.0`, registro oficial npm); CI passa a rodar `pnpm audit --audit-level high` |
| Privilégio mínimo no CI | OK — sem `pull_request_target`, sem secrets customizados, `GITHUB_TOKEN` padrão; checkout full-history exigido pelo Gitleaks |
| Artefatos gerados | OK — `frontend/coverage/` ignorado pelo `.gitignore` (não será commitado) |

## Gatilhos de docs/07 §7 neste change

Nenhum gatilho dispara (sem entrada de usuário, auth, dados de paciente ou integração com dados). A revisão profunda proporcional foi a auditoria de supply-chain + segredos acima.

## Observações não bloqueantes

- Actions fixadas em tags major (`v4`/`v2`) — prática oficial dos mantenedores; pin por SHA pode ser avaliado depois via OpenSpec.
- Cobertura atual 100% nos arquivos medidos; o threshold de 80% é piso, não meta (alinhado à proibição de cobertura artificial em `docs/04`).
- Limitação conhecida do threshold (comportamento padrão do vitest): só arquivos importados pelos testes entram na medição — arquivo novo nunca importado não derruba a cobertura sozinho. Comprovado em 2026-09-07: 60 funções não cobertas em arquivo medido → `ERROR: Coverage for lines (25%) does not meet global threshold (80%)`, exit 1; revertido → exit 0.

## Conclusão

**Aprovado sem ressalvas bloqueantes.** Nada neste change amplia superfície de ataque, expõe dado sensível ou enfraquece controles existentes; ao contrário, adiciona auditoria e varredura automatizadas.
