# Verificação — decisao-tecnica-vercel-docker

Mudança de documentação pura (registro de decisões em `docs/architecture/04-decisoes-tecnicas.md` + 2 bullets em `docs/product/05-estado-atual.md`). Exceção docs/07 §4 registrada nas tasks 1.1–3.2. Data: 2026-09-18.

## Gatilhos de segurança (docs/07 §7)

- **Entrada de usuário, autenticação, dados de paciente, integrações, segredos:** nenhum — textos de decisão arquitetural, sem campos, credenciais ou dados.
- **Varredura dos textos:** grep por `password|secret|api_key|token|PRIVATE` achou apenas falsos positivos benignos ("Tokens" = design tokens: `tokens.css` e spec `design-tokens`). Nenhum segredo, credencial ou dado real.
- **Conclusão:** nenhum gatilho acionado; revisão registrada como não-aplicável (registro obrigatório para liberar o archive).

## Revisão de conteúdo (decisões × escopo)

- **Vercel:** seção §18 com Escolhido/Motivos (integração nativa, previews por PR, simplicidade), alternativas rejeitadas (self-host; outras plataformas) e implicações (env vars na plataforma sem segredos no código, domínio quando houver, sem custo de infra própria agora) — exatamente o escopo aprovado.
- **Docker:** seção §19 com Motivos (paridade dev/prod, isolamento, onboarding), alternativas rejeitadas (serviços nativos; nuvem gerenciada; Kubernetes) e implicações (`docker-compose` em `infra/`; **nada implementado agora** — `infra/docker/` segue vazio, verificado com `ls`).
- **Renumeração segura:** grep confirmou zero referências externas a números de seção do 04 antes da mudança; Referências passou a §20; seções 18–19 antes dela.
- **05:** 2 bullets em "Decisões técnicas já tomadas", referenciando §§18–19; grep confirma que não havia menção pendente a remover e que nenhuma decisão segue listada como em aberto. "Deploy de ambiente" permanece corretamente em "O que ainda NÃO existe" (decisão ≠ deploy feito).

## TDD (docs/07 §4)

- Exceção aplicável e registrada em cada task: documentação de decisão sem comportamento executável; verificação por releitura + grep + gates.

## Aplicação da seção 13

- Dispensado tudo (unitários, OWASP, contrato, integração, mutation, E2E, carga): sem código executável alterado. Gates rodados como regressão.

## Backlog (task 3.2)

Avaliação de `docs/product/08-backlog-produto.md`: **sem alteração necessária**. Feature 6.3 (Deploy de ambiente) segue "Não iniciado" — decisão registrada ≠ deploy realizado; o resumo do Épico 6 ("CI concluído; observabilidade e deploy pendentes") permanece preciso. Nenhum outro status menciona plataforma de deploy ou orquestração.

## Gates executados (task 3.1)

- `pnpm lint` — passou (0 erros; 1 warning pré-existente em `stryker.config.mjs`)
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 15 arquivos, 106 testes, 100% (inalterado, como esperado)
- `pnpm build` — passou (21 páginas)
- `openspec validate --changes` — passou (1 passed, 0 failed; `skip_specs` aceito)
