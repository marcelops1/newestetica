# Verificação — resolver-duplicacao-sonar-backend

- **Change:** `openspec/changes/resolver-duplicacao-sonar-backend` (branch `chore/resolver-duplicacao-sonar-backend`)
- **Data:** 2026-09-24
- **Gatilhos de segurança (docs/engineering/07 §7):** **nenhum** — refactor estrutural puro: sem entrada de usuário nova, sem autenticação, sem dado de paciente, sem integração externa, sem segredo. Ainda assim, a fronteira foi auditada (seção 4) porque o código movido inclui validação de entrada e tratamento de erro.

## 1. Prova de não-quebra (caracterização)

A suíte completa foi rodada **antes** e **depois de cada migração** — não só no final:

| Etapa | Arquivos / testes | Cobertura (stmts) | Resultado |
| --- | --- | --- | --- |
| Baseline (task 0.1, antes de mover nada) | 36 / 147 | 99,7% | ✅ verde |
| Após migrar `ZodValidationPipe` (1.2) | 37 / 149 | — | ✅ verde |
| Após `DomainError` genérico (2.2) | 38 / 151 | — | ✅ verde |
| Após base do `DomainExceptionFilter` (3.2) | 39 / 153 | — | ✅ verde |
| Após factory do Prisma (4.2) | 40 / 155 | 99,68% | ✅ verde |
| Final (gates 6.1) | **40 / 155** (backend) + contracts 12/54 + frontend 15/109 | 99,68% | ✅ verde |

**REDs reais colados (não apenas "testes verdes"):**

- 1.1: `Cannot find module './zod-validation.pipe'`
- 2.1: `Cannot find module './domain-error'`
- 3.1: `Cannot find module './domain-exception.filter'`
- 4.1: `Cannot find module './client-factory'`

**Provas negativas / auditorias:**

- **Nenhum comportamento observável mudou:** os testes HTTP dos 3 módulos (404/409/422, corpos `{code, message}`, validação 422) passaram sem alteração — os mapas de status e as mensagens foram preservados; a herança do `@Catch(DomainError)` da base compartilhada foi provada pelos 21 testes HTTP dos 3 módulos.
- **`grep` de cópias:** `class ZodValidationPipe` → só o kernel; `extends Error` → só o kernel; `class DomainExceptionFilter` → base + 3 subclasses finas; `new PrismaClient` → só a factory.
- **Direção de dependências:** o kernel não importa nenhum módulo (`rg` vazio); os módulos importam do kernel só o plumbing da exceção (controllers→pipe, filters→base, errors→base, modules→factory); `domain/` dos 3 módulos sem imports externos novos.
- **Cliente Prisma continua conectável:** os testes de integração sobem os 3 módulos via Nest (o provider usa a factory) e consultam o Postgres real — 155/155.

**FYIs registrados (ferramenta):**

1. **Prisma + cobertura v8:** `expect(client).toBeInstanceOf(PrismaClient)` estoura `RangeError: Maximum call stack size exceeded` sob `--coverage`, e `constructor.name` vira `'t'` (proxy do Prisma + instrumentação). O spec da factory assere métodos (`$connect`/`$transaction`/`$disconnect`) e deixa a prova do cliente conectável para a integração. Reproduzido isoladamente (com/sem coverage) antes da decisão.
2. **Lint config:** o hook com default ignora o parâmetro (`_error`) e o ESLint do backend não tinha `argsIgnorePattern`; adicionado `{ argsIgnorePattern: "^_" }` ao `backend/eslint.config.mjs` (convenção reutilizável, 7 linhas).

## 2. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `pnpm lint` | ✅ limpo (1 warning pré-existente em `frontend/stryker.config.mjs`, fora do change) |
| `pnpm format` | ✅ limpo (após `format:write` em 2 arquivos) |
| `pnpm typecheck` | ✅ limpo |
| `pnpm test` | ✅ 67 arquivos / 318 testes (backend 40/155; cobertura 99,68% stmts) |
| `pnpm build` | ✅ limpo |
| `pnpm audit --audit-level high` | ✅ 0 high/critical (3 moderate — baseline do repo) |

## 3. Mutation testing — `src/shared` (extra, além das tasks)

O Stryker foi estendido a `src/shared/**` e rodado contra o kernel para provar que o código movido continua medido:

- **Resultado: `pnpm --filter backend exec stryker run --mutate 'src/shared/**/*.ts,!src/shared/**/*.spec.ts'` — 4 arquivos, 17 mutantes, score final 100,00% (17 mortos / 0 sobreviventes, 0 sem cobertura, 0 timeout)**, ~2,5 min, banco de teste no ar. `http` 9/9 (pipe 6 + base do filtro 3), `prisma` 6/6, `errors` 2/2.

## 4. Revisão de segurança (`security-and-hardening`)

**Sem gatilho (docs/07 §7) — refactor estrutural.** Auditoria da fronteira mesmo assim:

| Verificação | Resultado |
| --- | --- |
| Superfície HTTP | inalterada: mesmas rotas, mesmos DTOs, mesma validação na fronteira (o pipe só mudou de lugar) |
| Corpos de erro | inalterados: `{code, message}` sem stack, mesmas mensagens por classe (o `catch` é o mesmo, agora na base) |
| Caminho de segredo/ambiente | `DATABASE_URL` lida em um único lugar (factory) com a mesma mensagem de erro; `.env` segue no `.gitignore`; nada hardcoded |
| Injeção / queries | nenhuma query nova; repositórios e adapters intocados |
| Dados de paciente / LGPD | nada novo; nenhum log adicionado |
| DI/wiring | mesmos tokens e escopos; instâncias de PrismaClient continuam por módulo (sem mudança de privilégio) |

Nenhum achado. A única mudança de configuração (`argsIgnorePattern` no ESLint) é de ferramenta de desenvolvimento e não afeta runtime.

## 5. Revisão de código (`code-review-and-quality`)

- **Correção:** comportamento preservado, provado pelas 155 provas do backend (incluindo os HTTP 404/409/422 e os contratos); nenhuma mudança em rotas/DB.
- **Arquitetura:** exceção do kernel documentada (02 §3 + 04 §22) com regra de filiação; kernel não importa módulos; mapeamentos e unions permanecem locais; instâncias Prisma por módulo (trigger da decisão 8 intacto); DI preservado (`useFactory: createPrismaClientFromEnv`, tokens iguais).
- **Legibilidade:** subclasses finas comentadas apontando a exceção; `import type` padronizado para `PrismaClient` nos módulos (uso só de tipo).
- **Simplicidade:** o kernel tem 4 arquivos pequenos e nenhuma abstração além do que a duplicação pagava; sem parâmetros genéricos desnecessários (`DomainError<Code>` mantém a precisão dos unions).
- **Performance:** idêntica (mesmo número de clientes/conexões, mesmos queries).
- **Nenhum achado Required**; FYIs da seção 1.

## 6. Documentação atualizada (task 5.2/5.3)

- `docs/architecture/02-arquitetura.md` §3 — exceção do kernel técnico com regra de filiação (plumbing puro pode compartilhar; domínio nunca).
- `docs/architecture/04-decisoes-tecnicas.md` §22 — decisão, motivos, alternativas rejeitadas e implicações (referências renumeradas para §23).
- `docs/architecture/c3-component.md` — seção "Backend (kernel técnico compartilhado)" com diagrama e notas (mapeamentos locais, instâncias por módulo).
- `docs/product/05-estado-atual.md` — pendência de duplicação baixada apontando este change.
- `.sonarcloud.properties` (novo) — exclusões de CPD para testes; **não** `sonar-project.properties` (ignorado pelo Automatic Analysis, verificado na doc oficial).

## 7. Aceite do SonarCloud (task 6.3)

- **SCOPE_SONAR** (PENDENTE — preencher com o resultado do check no PR)

## 8. Checklist final

- [x] Tasks 0–5 completas com RED real colado e commits semânticos por task
- [x] Suíte verde antes e depois de cada migração (seção 1)
- [x] `grep` de cópias e direção da dependência auditados (seção 1)
- [x] Gates completos verdes (seção 2)
- [x] Revisões de código e segurança registradas (seções 4 e 5)
- [x] Docs emendados (seção 6)
- [x] `skip_specs` respeitado (refactor puro — sem delta de spec)
