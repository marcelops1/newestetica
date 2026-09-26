# Change: adicionar-documentacao-openapi

## Why

O backend tem 4 módulos e 14 rotas sem nenhuma documentação navegável: descobrir a API hoje exige ler controllers e contratos no código. Com o painel admin (Épico 2) e a Identidade chegando, o custo dessa descoberta só cresce — expor Swagger UI agora fixa o ponto de partida documentado.

## What Changes

- Nova dependência `@nestjs/swagger` (+ ponte Zod→OpenAPI sem duplicar contratos) e setup em `main.ts` servindo `/docs` (Swagger UI) e `/docs-json` (schema OpenAPI).
- Decorators em todos os controllers dos 4 módulos (`ApiTags`, `ApiOperation`, respostas por status); rotas de Pacientes documentam explicitamente o 403 `AUTH_NOT_IMPLEMENTED` do `IdentityPendingGuard` (sem esconder o bloqueio).
- Gate por ambiente: docs servidas por padrão fora de produção; em produção, só com `SWAGGER_ENABLED=true` — regra registrada em `docs/security/03-seguranca.md`.
- `README.md` ("Como rodar") com acesso ao Swagger; `docs/engineering/07-workflow-de-engenharia.md` §17 (regra de manutenção); checkbox novo no `.github/pull_request_template.md` ao lado do de C2/C3.
- Explicitamente fora: versionamento da API, autenticação no Swagger UI, exportação para o frontend, SDKs gerados.

## Capabilities

### New Capabilities

- `api-documentation`: documentação OpenAPI/Swagger da API servida pelo próprio backend, refletindo fielmente rotas e contratos vigentes.

### Modified Capabilities

- Nenhuma (nenhum requirement existente muda de texto ou cenário).

## Impact

- `backend/package.json` (+2 deps aprox.), `backend/src/main.ts` (setup), 4 controllers (decorators), `contracts/` intocado (fonte da verdade, sem duplicação), `docs/security/03-seguranca.md`, `README.md`, `docs/engineering/07-workflow-de-engenharia.md` (§17 nova), `.github/pull_request_template.md`.
- Sem impacto em comportamento das rotas, banco, specs vigentes ou frontend.
