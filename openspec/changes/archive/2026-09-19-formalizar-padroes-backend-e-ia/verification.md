# Verificação — formalizar-padroes-backend-e-ia

Mudança de documentação de padrão (02 §7, `backend/AGENTS.md`, docs/07 §13+§14, 1 linha no backlog). Exceção docs/07 §4 registrada nas tasks 1.1–4.2. Data: 2026-09-19.

## Gatilhos de segurança (docs/07 §7)

- **Entrada de usuário, autenticação, dados de paciente, integrações:** nenhum — documentação de padrão, sem campos, credenciais ou dados.
- **Varredura dos textos:** grep por `password|secret|api_key|token|PRIVATE` nas linhas adicionadas → nenhum achado; os exemplos de padrões de prompt não contêm dado real.
- **Conclusão:** nenhum gatilho acionado; revisão registrada como não-aplicável (registro obrigatório para liberar o archive).

## Revisão de conteúdo (padrões × escopo aprovado)

- **Clean Architecture (task 1.1):** 02 §7 ganha a seção com a regra de dependência exata + item no resumo de padrões; `backend/AGENTS.md` §§4–5 ganham a mesma regra (e o item na lista de regras técnicas). Texto idêntico ao aprovado no design.
- **§13 (task 2.1):** faixas e itens vigentes preservados (verificado por releitura); integração ganha o *como* do backend (PostgreSQL real em container — Docker Compose 04 §19, Testcontainers quando suportado, banco isolado + migrations, mock de banco só fora de regra de persistência); contrato ganha verificação nas duas pontas contra `contracts/`; **Testes Adversariais** entra como subcategoria explícita de segurança (inputs maliciosos/malformados, fuzzing básico, bypass de autorização/RBAC), condicionada à existência de superfície de ataque como o bullet OWASP.
- **§14 (task 2.2):** criada ao final do arquivo (Referências é o §12 — **sem renumeração**, descoberta registrada no design); formaliza que a pipeline em estágios já cobre parcialmente; prática leve com seed de 3 padrões observados neste repo e sinais observáveis de degradação; **prática recomendada, sem SHALL de enforcement**. **Grep de nomes de modelos na §14** (`claude|glm|deepseek|gemini|gpt|muse|kimi|llama|mistral|grok|copilot|opencode|codex`) → **vazio**.
- **Backlog (task 3.1):** apenas a linha de intro da Feature 4.2 estendida com a regra de dependência — os 7 UCs de módulos não foram tocados (`git diff` mostra 1 linha no arquivo). Nenhum outro backlog/UC alterado (task 4.2 confirmada pelo `--stat`).

## TDD (docs/07 §4)

- Exceção aplicável e registrada em cada task: documentação de padrão sem comportamento executável (o backend não existe ainda); verificação por releitura + grep + gates.

## Aplicação da seção 13

- Dispensado tudo (unitários, OWASP, contrato, integração, mutation, E2E, carga): sem código executável alterado. Gates rodados como regressão.

## Gates executados (task 4.1)

- `pnpm lint` — passou (0 erros; 1 warning pré-existente em `stryker.config.mjs`)
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 15 arquivos, 109 testes, 100% (inalterado)
- `pnpm build` — passou (21 páginas)
- `pnpm exec openspec validate --changes` — passou (1 passed, 0 failed; `skip_specs` aceito)
