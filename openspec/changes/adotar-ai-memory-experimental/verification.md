# Verificação — adotar-ai-memory-experimental

Registro de decisão (04 §20) + regra de segurança (03 §4) + nota no AGENTS §12. Exceção docs/07 §4 registrada nas tasks 1.1–3.2. Data: 2026-09-20.

## Gatilhos de segurança (docs/07 §7)

- **Entrada de usuário, autenticação, dados de paciente, integrações, segredos:** nenhum direto — documentação de decisão/regra, sem campos, credenciais ou dados.
- **Nota especial:** este change **cria uma regra em `docs/security/03-seguranca.md`** — a revisão abaixo foca na coerência e no enforcement temporal da regra, não em código.

### Revisão security-and-hardening (contra docs/03)

- **A regra não contradiz o restante do 03:** reforça §2 (minimização), §4 (dados do MVP) e §11 (mocks sem dados reais); não altera §5 (consentimento de fotos) nem §10 (proibições de produto).
- **Gatilho temporal explícito:** "antes de qualquer dado real de paciente existir no projeto (quando o backend for implementado), a ferramenta deve ser revisada e reforçada com exclusão de path/allowlist". Sem essa frase a regra seria abstrata; com ela, há condição verificável.
- **Prevalência declarada:** "em conflito entre a conveniência da ferramenta e esta regra, esta regra vence" — evita que a ferramenta se torne fonte de verdade por conveniência.
- **Consistência com 04 §20:** decisão diz ferramenta de DESENVOLVIMENTO, nunca produção/VPS/Kubernetes, separada do compose; nunca captura dado real (aponta para 03 §4); não substitui AGENTS/OpenSpec.
- **Consistência com AGENTS §12:** nota usa a mesma cláusula de prevalência das skills ("este arquivo vence"); reforça opcional/experimental e "não é fonte de verdade".
- **Varredura dos textos:** grep por `password|secret|api_key|token|PRIVATE` nas linhas adicionadas → nenhum achado; nenhum dado real (nem fictício identificável) introduzido.
- **Conclusão:** regra registrada com coerência e gatilho; nenhum gatilho de archive bloqueante além do registro obrigatório (feito). Sem pendências.

## Revisão code-review-and-quality (foco)

- **Correção:** §20 no formato vigente; Referências → §21; grep confirmou zero refs externas a números de seção do 04 quebradas.
- **Escopo:** só os 3 docs previstos (+ change); `infra/docker/`, specs, backlog e código intocados.
- **Achados:** nenhum Critical/Required.
- **Veredito:** Aprovado.

## Aplicação da seção 13

- Dispensado tudo (unitários, OWASP, contrato, integração, mutation, E2E, carga): sem código executável alterado. Gates rodados como regressão.

## Backlog (task 3.2)

Avaliação de `docs/product/08-backlog-produto.md`: **sem alteração necessária**. Registro de decisão + regra de segurança não cria capability de produto com ator/fluxo/aceite; nenhum status de UC fica incorreto.

## Gates executados (task 3.1)

- `pnpm lint` — passou (0 erros; 1 warning pré-existente em `stryker.config.mjs`)
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 15 arquivos, 109 testes, 100% (inalterado)
- `pnpm build` — passou (21 páginas)
- `pnpm exec openspec validate --all` — 9 passed, 0 failed (8 specs + este change ativo)
