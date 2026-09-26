## Context

Ver `proposal.md` (Why). Ponto de partida verificado: Nest 12 + Zod 4.6.5 (`zod` em `backend` e `contracts`); 14 rotas em 4 controllers sem nenhum decorator Swagger; `main.ts` só faz bootstrap + `PORT`; `IdentityPendingGuard` em nível de classe no controller de Pacientes; `docs/security/03-seguranca.md` sem regra sobre documentação de API; `README.md` "Como rodar" sem Swagger; `docs/engineering/07-workflow-de-engenharia.md` termina na §16; PR template com item de C2/C3 (mecanismo a replicar).

## Goals / Non-Goals

**Goals:**

- `/docs` e `/docs-json` fiéis às rotas e aos contratos, sem duplicar campo algum.
- Bloqueio de Pacientes visível (nunca sugerir acesso livre).
- Docs fora da superfície de produção por padrão, com regra escrita.

**Non-Goals:**

- Versionamento de API, login no Swagger UI, SDKs/export para frontend, autenticação real (Identidade continua dona disso).

## Decisions

### 1. `@nestjs/swagger` + ponte Zod sem duplicação (skill `api-and-interface-design`)

`@nestjs/swagger` para UI/schema + biblioteca-ponte que gera DTOs/OpenAPI a partir dos schemas Zod existentes (candidata primária: `nestjs-zod` v5 — `createZodDto` + integração com `DocumentBuilder`; DTOs viram tipos dos parâmetros já tipados inline hoje). Rationale: o contrato continua em `contracts/` como fonte única; qualquer campo novo aparece na doc sem edição dupla (Hyrum: o que é observável vira compromisso — melhor derivar do que copiar). Alternativas consideradas: DTOs manuais espelhando os contratos (rejeitada — duplicação exata do que a skill manda evitar; aceita só como fallback se os peers quebrarem); `@anatine/zod-nestjs` (rejeitada — era Zod 3, incompatível com o Zod 4 do repo); `zod-to-openapi` com registro manual (rejeitada — mais plumbing próprio para o mesmo resultado). Verificação no apply (task 1.x): instalação limpa com peers do Nest 12 + um DTO fumegante gerando schema; se quebrar, volta-se à alternativa manual **antes** de prosseguir, sem mudar specs.

### 2. Setup em `main.ts`, paths `/docs` e `/docs-json`

`DocumentBuilder` (título, versão do pacote, tags por módulo) + `SwaggerModule.setup("docs", ...)` e `SwaggerModule.createDocument` exposto também como JSON em `/docs-json`. Rationale: convenção padrão do ecossistema, zero surpresa. Alternativa considerada: servir só o JSON + Swagger externo (rejeitada — UI local é o valor imediato para o painel/Identidade).

### 3. Decorators por controller, bloqueio explícito em Pacientes

`@ApiTags` por módulo; `@ApiOperation` com resumo por rota; `@ApiResponse` para cada status real que os testes já provam (200/201/204/404/409/422); `@ApiParam`/`@ApiQuery` onde há path/query. Em Pacientes, `@ApiForbiddenResponse` com o código `AUTH_NOT_IMPLEMENTED` e descrição citando o guard e o UC 4.2.1 — a doc mostra o cadeado, não uma porta aberta. Alternativa considerada: decorar só tags e deixar responses genéricos (rejeitada — responses vagos viram mentira parcial, pior que ausência).

### 4. Gate por ambiente + regra escrita em `03-seguranca.md`

Docs servidas sempre, exceto com `NODE_ENV=production` sem `SWAGGER_ENABLED=true` (404 nas duas rotas). Rationale: em dev a doc acelera; em produção, superfície de API (nomes de campos PII + rotas admin) não se anuncia de graça — mesmo com o backend ainda sem exposição pública, a regra nasce junto com a superfície. Registro em `03-seguranca.md` §8 (item novo: documentação de API restrita por ambiente). Alternativas consideradas: sempre público (rejeitada — normaliza exposição futura); basic-auth no `/docs` (rejeitada — credencial nova sem IdP para guardá-la; reavaliar com a Identidade).

### 5. Manutenção amarrada ao processo (mesmo mecanismo do C2/C3)

Nova §17 em `docs/engineering/07-workflow-de-engenharia.md` ("toda task que cria/altera endpoint atualiza os decorators na mesma task") + checkbox no PR template ao lado do de C2/C3 ("criou/alterou endpoint? decorators atualizados"). Rationale: replicar o mecanismo que já funciona (tornar o esquecimento visível) em vez de inventar outro. `README.md` ganha o bloco de acesso (URLs + nota de módulos implementados + nota do 403 em Pacientes).

## Risks / Trade-offs

- [Risco] Peers da ponte incompatíveis com Nest 12 → Mitigação: task de verificação antes de prosseguir + fallback manual documentado (decisão 1).
- [Risco] Recurso Zod 4 sem suporte na ponte → Mitigação: auditoria dos schemas usados no apply; teste de divergência reprova omissão.
- [Risco] Drift doc/código → Mitigação: regra §17 + checkbox no PR + teste de divergência contrato↔schema.
- [Trade-off] Sem versionamento agora → aceito; a API ainda é interna e instável por desenho.

## Migration Plan

Sem migração: adição pura (2 deps, setup, decorators, docs). Rollback = reverter o merge. Nenhum dado ou rota existente muda de comportamento.

## Open Questions

Nenhuma bloqueante. Versão exata da ponte resolve-se na task 1.x sem mudar specs.

## Checklist §16 (não se aplica como módulo novo — itens endereçados mesmo assim)

Este change **não** cria módulo de backend, então o checklist §16 não se aplica formalmente; por rigor equivalente: (1) `api-and-interface-design` carregada e citada (decisões 1 e 3); (2) `security-and-hardening` carregada no planejamento com threat model abaixo, mais revisão no Verify (§7); (3)(4)(5) são específicos de módulo novo — sem módulo, sem mutation/adversarial/§14 novos (a suíte existente continua verde como regressão).

### Threat model da fronteira (planejamento, skill `security-and-hardening`)

- **Fronteira nova:** `GET /docs` e `GET /docs-json` — públicas por padrão fora de produção.
- **Ativos:** conhecimento da superfície (14 rotas incl. admin) + nomes de campos PII (sem dados reais — schemas descrevem formato, seed/mocks são fictícios).
- **Abuse cases:** (1) reconhecimento para atacar rotas de Pacientes sem auth → mitigado: o guard bloqueia independente da doc, e a doc declara o 403 em vez de sugerir acesso; (2) enumeração via schema → nomes de campos já são inferíveis pelos testes públicos; sem dados reais expostos; (3) exposição em produção → gate por ambiente + regra em `03-seguranca.md` (decisão 4).
- **STRIDE resumido:** Spoofing N/A (doc não autentica); Tampering N/A (somente leitura); Information disclosure controlado pelo gate + ausência de dados reais; DoS irrelevante (GETs estáticos); Elevation N/A.
