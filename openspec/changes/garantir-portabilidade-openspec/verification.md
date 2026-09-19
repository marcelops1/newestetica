# Verificação — garantir-portabilidade-openspec

Change de tooling: OpenSpec vira dependência do projeto (pin exato) e a documentação passa a usar a forma portável. Data: 2026-09-19.

## Gatilhos de segurança (docs/07 §7)

- **Entrada de usuário, autenticação, dados de paciente, integrações:** nenhum — tooling de desenvolvimento.
- **Segredos:** nenhum segredo/token nos textos ou no `package.json` (grep nas linhas adicionadas → vazio); lockfile com `integrity` sha512; pin exato `1.12.0`.
- **Supply-chain (revisão `security-and-hardening`):**
  - Mesmo pacote/versão que já executava globalmente nesta máquina (`@fission-ai/openspec@1.12.0`) — o change não adiciona código novo em execução, só auditabilidade e reprodutibilidade.
  - `pnpm view openspec version` → `0.0.0` (pacote homônimo não relacionado) — a documentação nova previne que `npx` baixe o pacote errado.
  - Lockfile revisado: +17 pacotes transitivos (inquirer/ora/yaml/fast-glob etc., típicos de CLI); **nenhum `requiresBuild`** e nenhum aviso de build script no install — nada de postinstall de terceiros.
  - Instalação limpa a partir do lockfile (535 pacotes) sem scripts novos.
- **Conclusão:** nenhum gatilho dos que bloqueiam archive; revisão registrada.

## Prova executável (sem exceção §4 na parte de instalação)

- **RED:** `npm view openspec version` → `0.0.0`; `node_modules/.bin/openspec` ausente; `pnpm exec which openspec` → `/home/marcelo/.nvm/.../bin/openspec` (o global — dependência da máquina provada pelo caminho de resolução).
- **GREEN (após pin + script):** `node_modules/.bin/openspec --version` → 1.12.0; `pnpm exec which openspec` → `./node_modules/.bin/openspec`; `pnpm exec openspec --version` e `pnpm openspec --version` → 1.12.0.
- **GREEN em ambiente limpo:** `rm -rf node_modules frontend/node_modules` + `pnpm install` (535 pacotes do lockfile; `unrs-resolver` postinstall é dep pré-existente do eslint; husky `prepare` ok) e, novamente, bin local → 1.12.0.
- **Independência do global, provada:** `env PATH="/tmp/opencode/bin:/usr/bin:/bin" sh node_modules/.bin/openspec --version` → 1.12.0, com `which openspec` ausente nesse PATH (só o `node` estava disponível).

## Revisão code-review-and-quality (foco)

- **Correção:** forma portável documentada em 3 pontos (AGENTS, docs/07, README); binário resolve localmente; script descobrível.
- **Arquitetura:** skills vendorizadas ficam intactas (conteúdo upstream duplicado); a cláusula de prevalência do AGENTS cobre os exemplos curtos — sem churn de reescrita.
- **Achados:** nenhum Critical/Required. *Nota honesta:* `pnpm add` exigiu `-w` para a raiz do workspace (registrado na task 1.2).
- **Veredito:** Aprovado.

## Aplicação da seção 13

- **Aplicado — prova executável/intake:** RED/GREEN de resolução do binário + clean install (acima).
- **Aplicado — supply-chain:** pin exato, lockfile revisado, sem install scripts.
- **Dispensado — OWASP/contrato/E2E/carga:** tooling sem entrada de usuário, sem fronteira de dados e sem jornada de produto.

## Backlog (task 4.2)

Avaliação de `docs/product/08-backlog-produto.md`: **sem alteração necessária**. Tooling de infraestrutura de desenvolvimento (portabilidade do CLI) não é capability de produto com ator/fluxo/aceite — mesmo critério aplicado às decisões técnicas no change `atualizar-epico-6-infraestrutura`; a casa autoritativa é `AGENTS.md` §6 e `docs/07` §3 (nota de CLI portável). O UC 6.1.2 cobre o gate de pre-commit, não a instalação do CLI.

## Gates executados (task 4.1)

- `pnpm lint` — passou (0 erros; 1 warning pré-existente em `stryker.config.mjs`)
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 15 arquivos, 109 testes, 100% (inalterado)
- `pnpm build` — passou (21 páginas)
- `pnpm exec openspec validate --changes` — passou (1 passed, 0 failed; `skip_specs` aceito) — agora pelo binário do projeto
