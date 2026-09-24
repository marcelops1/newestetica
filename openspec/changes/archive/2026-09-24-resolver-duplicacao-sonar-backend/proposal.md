# Change: resolver-duplicacao-sonar-backend

## Why

O SonarCloud reprovou o Quality Gate por duplicação em 3 PRs seguidos de backend (#35, #38 e #40 — esta última com 8,5% de duplicação em New Code contra o limite de 3%, causa investigada e registrada). Cada módulo novo recopia o mesmo plumbing (pipe/filter de apresentação, base de erros, factory de PrismaClient) mais os scaffolds de teste, e o próximo módulo (Identidade e Acesso) copiaria tudo pela 4ª vez. A pendência formal está em `docs/product/05-estado-atual.md` e no `verification.md` do change `backend-modulo-conteudo-publico` (§8): a decisão precisa sair **antes** do 4º módulo.

## What Changes

- Novo `backend/src/shared/` (kernel técnico, sem vocabulário de domínio): `ZodValidationPipe`, base de `DomainExceptionFilter` com hook de mapeamento por módulo, base genérica `DomainError`, factory `createPrismaClientFromEnv` — com migração dos 3 módulos (scheduling, catalog, content) para importar do compartilhado e remoção das cópias locais.
- Emenda explícita a `docs/architecture/02-arquitetura.md` §3 (exceção para infraestrutura técnica pura) + entrada em `docs/architecture/04-decisoes-tecnicas.md`.
- `.sonarcloud.properties` na raiz com `sonar.cpd.exclusions` para os padrões de teste (`backend/test/**`, `**/*.spec.ts`) — **não** `sonar-project.properties`, que o Automatic Analysis ignora (verificado na documentação oficial; design decisão 7).
- Escopo do Stryker estendido a `src/shared/**` (o código movido continua medido); `c3-component.md` e `05-estado-atual.md` atualizados.
- Nenhuma mudança de comportamento, rota, contrato, spec vigente ou banco — refactor puro com prova de não-quebra.

## Capabilities

### New Capabilities

- Nenhuma. Avaliação registrada (exigência do pedido): extração de plumbing compartilhado não cria comportamento observável novo — mesmas rotas, respostas, erros e status, provados pela suíte existente. Inventar capability violaria a regra do schema.

### Modified Capabilities

- Nenhuma. Nenhum requirement vigente muda de texto ou cenário.

> Este change declara `skip_specs: true` no `.openspec.yaml` (refactor puro + config de ferramenta + docs, sem mudança de comportamento — exceção prevista no schema).

## Impact

- `backend/src/shared/` (novo: `http/`, `errors/`, `prisma/`), `backend/src/{scheduling,catalog,content}/` (só imports; nenhum comportamento tocado), `backend/stryker.config.mjs` (escopo), `.sonarcloud.properties` (novo), `docs/architecture/02-arquitetura.md` §3 (emenda), `docs/architecture/04-decisoes-tecnicas.md` (entrada), `docs/architecture/c3-component.md` (subseção do kernel), `docs/product/05-estado-atual.md` (baixa da pendência).
- Sem impacto em frontend, contratos, mocks, specs vigentes, banco ou CI (nenhum secret novo; nenhuma etapa nova no workflow).
