# Verificação — adicionar-documentacao-openapi

- **Change:** `openspec/changes/adicionar-documentacao-openapi` (branch `feature/adicionar-documentacao-openapi`)
- **Data:** 2026-09-26
- **Gatilhos de segurança (docs/engineering/07 §7):** **superfície nova sem auth** (`/docs` e `/docs-json`) tocando names de campos de PII de Pacientes (sem dados reais) → revisão de segurança registrada na seção 3, com o gate por ambiente e o 403 honesto.

## 1. Testes por nível (docs/07 §13)

| Nível | O que cobre | Arquivos | Testes |
| --- | --- | --- | --- |
| Integração — docs servidas | `/docs` HTML 200, `/docs-json` OpenAPI 3.x, 14 rotas exatas, resumo/tags/respostas/parâmetros/corpos, fidelidade dos 9 componentes e o 403 honesto de Pacientes | 1 | 7 |
| Integração — gate por ambiente | produção sem flag → 404/404; `SWAGGER_ENABLED=true` → 200/200 | 1 | 2 |
| **Total do change** | | **2** | **9** |

Suíte completa no Verify: **84 arquivos / 399 testes verdes** (backend 56/229, contracts 13/61, frontend 15/109).

**REDs reais colados (não apenas "testes verdes"):**

- 0.1 (baseline): com o stack no ar, `GET /docs → 404` e `GET /docs-json → 404`.
- 1.2 (setup): `AssertionError: expected 404 to be 200` nos dois endpoints antes do `setupSwagger`.
- 2.1 (cobertura): `AssertionError: get /health sem resumo` antes dos decorators (as 14 rotas já apareciam sem decoração — o resumo/respostas era o que faltava).
- 3.1 (fidelidade): prova de sensibilidade **write-then-throw** — expectativa divergente de propósito: `AssertionError: campos do componente PatientInputDto: expected [ 'fullName', 'phone', 'purpose' ] to deeply equal [ 'email', 'fullName', 'phone', …(1) ]`; restaurada → verde.
- 4.1 (gate): prova de sensibilidade **write-then-throw** — gate forçado aberto: `AssertionError: expected 200 to be 404` no cenário de produção; restaurado → verde.

**Prova real (compose, passo 7 do prompt):**

```
GET /docs → 200 (text/html; charset=utf-8)
GET /docs-json → 200 (14368 bytes)
openapi: 3.0.0 | title: Newestetica API | total de rotas: 14
DELETE /patients/{id} | GET /before-after | GET /health | GET /patients | GET /patients/{id}
GET /posts | GET /posts/{slug} | GET /procedures | GET /procedures/{slug}
GET /slots/available | GET /testimonials | PATCH /patients/{id} | POST /patients
POST /slots/{slotId}/bookings
tags: Agendamento | Catálogo | Conteúdo Público | Pacientes (bloqueado até a Identidade) | Health
Pacientes 403: AUTH_NOT_IMPLEMENTED — Bloqueado pelo IdentityPendingGuard: autenticação
ainda não implementada para este módulo (UC 4.2.1).
componentes: 9
```

**Wire necessário além do impacto original (registro de escopo):** o container roda com `NODE_ENV=production` (imagem), então o gate desabilitava as docs no stack local — a prova via compose exigiu `SWAGGER_ENABLED: ${SWAGGER_ENABLED:-true}` no serviço `backend` do compose + a variável em `infra/docker/.env.example`. Sem isso o README prometeria URLs que respondem 404 no fluxo containerizado; nenhum requirement muda (a infra-docker já exigia documentar toda variável do compose).

**FYI de dependência:** os peers declarados de `nestjs-zod@5.5.0` ainda não listam Nest 12/Swagger 12 (`^10 || ^11` / `^7.4.2 || ^8 || ^11`); instalação sem erro + smoke + documento gerado com os 9 componentes provam compatibilidade nesta versão — rechecar quando a lib atualizar (trigger).

## 2. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `docker compose config --quiet` | ✅ 0 |
| `pnpm lint` / `format` / `typecheck` | ✅ 0 / 0 / 0 (após remover import não usado e formatar) |
| `pnpm test` | ✅ **84 arquivos / 399 testes** (backend 56/229) |
| `pnpm build` | ✅ limpo |
| `pnpm audit --audit-level high` | ✅ 0 high/critical (3 moderate — baseline) |

## 3. Revisão de segurança (task 6.2 — `security-and-hardening`)

Superfície nova: `GET /docs` e `GET /docs-json` (públicas por padrão fora de produção); ativo: conhecimento da API (inclui nomes de campos de PII de Pacientes — formato, sem dados reais).

| Abuse case (threat model do design) | Resultado |
| --- | --- |
| Reconhecimento das rotas de Pacientes para ataque | A doc **declara o bloqueio** (403 `AUTH_NOT_IMPLEMENTED`, descrição com guard e UC) e o guard segue sendo a barreira real (independente da doc); os 14 endpoints já eram descobríveis por código/testes |
| Exposição da doc em produção | Gate por ambiente provado nos dois modos (404 por padrão em produção, 200 com `SWAGGER_ENABLED=true`); regra escrita em `docs/security/03-seguranca.md` §8 |
| Dados reais no schema | Nenhum: schemas derivam dos contratos (formato); seeds/mocks fictícios |
| Duplicação/drift de contrato | Ponte Zod→OpenAPI (sem `@ApiProperty` manual — `rg` zero); teste de fidelidade falha se um campo divergir |
| Erros abertos | 404 padrão do Nest para docs desabilitadas; sem stack trace |

Nenhum achado exige correção. O gate **não** substitui auth das rotas (declarado na §8 da 03-segurança).

## 4. Revisão de código (task 6.2 — `code-review-and-quality`)

- **Correção:** 84/399 verdes; cobertura de rotas exata (14, sem fantasma); fidelidade dos componentes; gate nos dois modos.
- **Arquitetura:** setup isolado em `backend/src/swagger.ts` (reutilizado por `main.ts` e testes — testabilidade sem duplicar bootstrap); DTOs derivados dos contratos, sem campo manual; nenhuma camada de domínio/aplicação tocada; comportamento das rotas inalterado (pipes/filtros intactos).
- **Legibilidade/simplicidade:** decorators declarativos por rota; constantes do 403 derivadas do próprio guard (código/mensagem reais, sem texto paralelo).
- **FYIs:** peer do nestjs-zod (seção 1); wire do compose (seção 1).

## 5. Documentação atualizada (task 5.x)

- `README.md` — subseção "Backend e documentação da API (Swagger)" em "Como rodar" (URLs, módulos implementados, 403 de Pacientes, gate de produção).
- `docs/engineering/07-workflow-de-engenharia.md` §17 — regra de manutenção (decorators na mesma task; ponte como fonte; verificação automatizada).
- `.github/pull_request_template.md` — checkbox novo ao lado do de C2/C3.
- `docs/security/03-seguranca.md` §8 — docs restritas por ambiente (produção desabilitada por padrão; doc não substitui enforcement).
- `infra/docker/docker-compose.yml` + `.env.example` — `SWAGGER_ENABLED` no stack local.

## 6. Checklist do change

- [x] 7 grupos com RED colado antes de cada GREEN (dois deles por prova de sensibilidade write-then-throw)
- [x] Prova real no compose: `/docs` 200, `/docs-json` 200 com as 14 rotas, 4 módulos + Health, 403 honesto
- [x] Gates completos verdes
- [x] Revisões de segurança e código registradas (sem módulo novo — §16 não se aplica; itens (a)/(b) endereçados no design)
- [x] Sem UC no backlog afetado (documentação de API) — nada a mudar
- [x] `openspec validate --all` verde; change arquivado com a capability `api-documentation` sincronizada
