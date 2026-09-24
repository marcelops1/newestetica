# Verificação — backend-modulo-catalogo

- **Change:** `openspec/changes/backend-modulo-catalogo` (branch `feature/backend-modulo-catalogo`)
- **Data:** 2026-09-24
- **Gatilhos de segurança (docs/engineering/07 §7):** entrada de usuário sem autenticação (leitura pública com parâmetros `category` e `slug`) → revisão de segurança obrigatória, registrada na seção 3.

## 1. Testes por nível (docs/07 §13)

| Nível | O que cobre | Arquivos | Testes |
| --- | --- | --- | --- |
| Unit — domínio | `Procedure` (create/restore, validação, vocabulário) e porta | 2 | 10 |
| Unit — aplicação | Casos de uso de listagem e por slug + adversarial (categoria hostil) | 3 | 7 |
| Integração — persistência | Repositório Prisma contra Postgres real (round-trip, ativos, ordem, corrupção) | 1 | 5 |
| Integração — HTTP | Contrato das rotas (200/404/422, filtro, pipe, corpos) | 2 | 7 |
| **Total do módulo** | | **8** | **29** |

Suíte backend completa no Verify: **23 arquivos / 89 testes verdes** (inclui o módulo Agendamento).

**REDs reais colados (não apenas "testes verdes"):**

- 2.3 (aplicação): `AssertionError: promise resolved "[]" instead of rejecting` — a categoria hostil era aceita; corrigido com revalidação no caso de uso (defesa em profundidade).
- 4.1 (HTTP): `Cannot find module '../../src/catalog/catalog.module'` — a rota ainda não existia.
- 4.3 (saída): `AssertionError: expected { id: 'limpeza-de-pele', …(5) } to not have property "isActive"` nos dois endpoints — o controller mapeava a entidade inteira.

**Provas negativas (garantias críticas provadas pela falha, não pela ausência dela):**

- **404 idêntico para inexistente/inativo:** o teste compara os dois corpos literalmente e **falhou** enquanto a mensagem do `ProcedureNotFound` ecoava o slug (corpos distinguíveis); a mensagem virou genérica e o teste passou — qualquer divergência futura reprova.
- **`isActive` fora do wire:** `not.toHaveProperty("isActive")` + conjunto exato de chaves (`CONTRACT_KEYS`) falharam com o mapeamento ingênuo e passam com a allowlist.
- **Dado corrompido no banco:** teste semeia categoria fora do vocabulário → repositório lança `InvalidProcedure` e HTTP responde 422 estruturado (sem vazar o registro).
- **Mutation testing:** 114 mutantes aplicados de fato sobre o módulo (seção 2) — a sensibilidade dos testes foi medida, não presumida.

**Cobertura (threshold 80% reprova o build):** statements 99,5% (202/203), branches 95,65% (88/92), functions 100%.

## 2. Mutation testing (task 5.1 — docs/07 §16.c)

- **Backend (módulo Catálogo):** `pnpm --filter backend exec stryker run --mutate "src/catalog/**/*.ts,!src/catalog/**/*.spec.ts,!src/catalog/**/*.module.ts"` — **10 arquivos, 114 mutantes, score final 92,11% (105 mortos / 9 sobreviventes, 0 sem cobertura, 0 timeout)**, ~12 min, banco de teste no ar.
- **Contracts (schema do catálogo):** `pnpm --filter contracts exec stryker run` — **100% (24/24: `catalog/procedure.ts` 6/6 + `scheduling` 18/18)**.
- **Escopo dos configs estendido** (`backend/stryker.config.mjs` e `contracts/stryker.config.mjs`) para `src/catalog/**` — o módulo novo não era medido até esta task.
- **Histórico da medição (transparência):**
  1. 1ª rodada: 121 mutantes, **85,12%** (103 mortos / 18 sobreviventes).
  2. Triagem: 8 sobreviventes eram lacunas reais → testes novos (caracterização — comportamento já existia; passam direto, sem RED): `restore` valida snapshot vindo do banco; `findActiveByCategory` ordena por nome (2 itens fora de ordem); dado corrompido no banco → erro explícito (repositório + HTTP); códigos `PROCEDURE_NOT_FOUND`/`INVALID_PROCEDURE` assertados no corpo HTTP; ramo 422 do filtro exercitado de ponta a ponta. **6 morreram** (os 2 restantes eram mascarados — ver abaixo).
  3. **3 mutantes equivalentes/mascarados no mapper:** a validação de categoria do `toCategories` era **redundante** com a da entidade (que roda no `restore` e é testada) — mutar o `if` do mapper não muda o comportamento observável (a entidade lança o mesmo erro logo depois). Decisão: **remover a revalidação do mapper** (fonte única = entidade, `code-simplification`) em vez de assertar mensagem de camada; o teste de dado corrompido continua provando a garantia. Mutantes caíram de 121 para 114.
  4. 2ª rodada (árvore final): 114 mutantes, **92,11%**.
- **Sobreviventes finais aceitos (9, todos justificados):** literais de mensagem de erro em `procedure.entity.ts` (6), `errors.ts` (2) e `list-procedures.use-case.ts` (1). Trocar a mensagem não altera contrato observável (classe do erro e `code` são assertados; mensagens são texto para desenvolvedor); assertar texto tornaria os testes frágeis sem ganho de garantia.
- **FYI (ferramenta):** `--mutate` com múltiplos flags via CLI instrumenta **0 arquivos silenciosamente** (score `NaN`, "Instrumented 0 source file(s)"); a forma que funciona é vírgulas em um único flag — sempre conferir a linha "Instrumented N source file(s)" antes de aceitar um score.

## 3. Revisão de segurança (task 5.2 — `security-and-hardening`)

Escopo: superfície pública de leitura, sem autenticação por desenho (UC 4.2.2). Abuse cases do threat model do design, um a um:

| Abuse case | Resultado |
| --- | --- |
| Injeção no `category` (`' OR '1'='1`, unicode, tamanho) | Zod enum na fronteira → 422 `VALIDATION_ERROR` (testado); revalidação no caso de uso (teste adversarial); Prisma parametrizado — auditoria `grep` confirma **zero** `$queryRaw`/`$executeRaw` no módulo |
| Slug hostil/gigante | `z.string().min(1).max(200)` na fronteira → 422; app-level → `ProcedureNotFound`; usado como valor opaco em `findUnique` |
| Enumeração por 404 | Corpos **idênticos** para inexistente e inativo (comparados no teste); mensagem genérica |
| Vazamento de campo interno (`isActive`) | Allowlist explícita + testes (`not.toHaveProperty` + chaves exatas) |
| Dado corrompido no banco | Erro explícito 422 estruturado, sem vazar o registro (testado) |
| DoS / rate limiting | **Risco aceito e registrado:** leitura somente, dataset curado e pequeno, buscas por PK/índice; sem paginação (gatilho: >100 ativos). Rate limiting entra com o hardening de staging/produção (mesma decisão do módulo Agendamento) |
| Erros expondo internos | Filtro devolve só `code` + `message`; sem stack trace no corpo (testado) |
| LGPD / dados de paciente | Módulo não trata dado de paciente; seed 100% fictício (`prisma/seed.mjs`); nenhum log adicionado |
| Segredos | Nenhum segredo no módulo; `DATABASE_URL` por env (`.env` não versionado) |

**Achado real da revisão (corrigido test-first):** a mensagem do `ProcedureNotFound` ecoava o slug, tornando os 404 de "inexistente" e "inativo" distinguíveis por texto — contraria a spec ("idêntica nos dois casos") e enfraquece a anti-enumeração. Corrigido com mensagem genérica; o teste que compara os corpos foi quem pegou.

## 4. Revisão de código (task 5.3 — `code-review-and-quality`)

- **Correção:** quatro níveis de teste + contrato nas duas pontas; ordenação determinística (`name asc`); `findActiveBySlug` checa `isActive` antes do mapper (inativo → 404, nunca 500).
- **Arquitetura:** direção de dependências auditada (`domain` sem imports externos; `presentation` é a única camada que importa `@newestetica/contracts`; nenhum import `catalog → scheduling`); erros/pipe/filtro locais do módulo (bounded contexts não compartilham apresentação — mesmo formato, classe não compartilhada); sem `UnitOfWork` (leitura de entidade única, YAGNI com gatilho registrado).
- **Legibilidade:** comentários só onde explicam decisão (Data Mapper, allowlist, independência de módulo).
- **Segurança:** seção 3.
- **Performance:** buscas por PK; listagem pequena sem paginação (gatilho >100 ativos); `categories` sem índice GIN — aceito no dataset curado (FYI registrado).
- **Simplicidade:** nenhuma abstração sem uso real (sem UoW, sem paginação, sem cache); a revalidação de categorias no mapper foi removida na triagem de mutation (redundante com a entidade — fonte única).
- **FYIs registrados:**
  1. `CatalogModule` cria o próprio `PrismaClient` (2 pools até existir provider compartilhado) — candidato a refatoração quando o 3º módulo chegar; trade-off documentado no próprio módulo.
  2. Prettier drift nos commits do agente (husky não rodou nas execuções não interativas) — pego pelo gate `format`; o pre-commit segue sendo conveniência, o CI é a verdade (docs/07 §6).

## 5. Gates (docs/07 §6)

| Gate | Resultado |
| --- | --- |
| `pnpm lint` | ✅ limpo |
| `pnpm format` | ✅ limpo (após `format:write` nos arquivos do módulo) |
| `pnpm typecheck` | ✅ limpo |
| `pnpm test` | ✅ 23 arquivos / 89 testes |
| `pnpm build` | ✅ limpo |
| `pnpm audit --audit-level high` | ✅ 0 high/critical (3 moderate — baseline do repo, sem regressão) |

## 6. Documentação atualizada (task 5.4)

- `docs/product/08-backlog-produto.md` — UC 4.2.2 → **Em andamento** (leitura pública entregue; CRUD e auth pendentes).
- `docs/architecture/c2-container.md` — Real ganha o segundo módulo (Catálogo) e suas rotas.
- `docs/architecture/c3-component.md` — seção "Backend (real — módulo Catálogo)" com diagrama de camadas e wiring.

## 7. Checklist §16 (docs/07)

- [x] **(a)** `api-and-interface-design` citada no `design.md` (decisões de contrato e allowlist).
- [x] **(b)** `security-and-hardening` carregada no planejamento (threat model no `design.md`) — revisão do Verify na seção 3.
- [x] **(c)** Mutation real medida e registrada (seção 2), com triagem completa de sobreviventes e histórico das duas rodadas.
- [x] **(d)** Testes adversariais (2.3–2.4 no domínio/aplicação; fronteira em 4.1/4.3; dado corrompido e injeção no HTTP).
- [x] **(e)** §14 avaliada (task 5.5): **dispensa com motivo** — a sessão reforçou padrões já registrados (RED colado, prova negativa, revisão formal de segurança, grupos por camada) sem padrão de prompt genuinamente novo; o gotcha de ferramenta do Stryker ficou registrado como FYI na seção 2, não como regressão de prompt.
