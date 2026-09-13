# Verificação — pagina-blog

Revisão com `security-and-hardening` contra `docs/security/03-seguranca.md` (gatilho docs/07 §7: busca = entrada de usuário) + revisão com `code-review-and-quality`. Data: 2026-09-13.

## Threat model (5 min)

- **Fronteira:** busca do blog (`/blog`) → `lib/blog.ts` (filtragem em memória) → renderização; slug (`/blog/[slug]`) → acessor → detalhe ou 404. Nenhum dado cruza rede nem persistência.
- **Ativo:** integridade do conteúdo público (posts mockados) e experiência da paciente.
- **Abuse cases (OWASP):** (A03/XSS) query com marcação refletida como HTML — no campo, no estado vazio ou em qualquer texto derivado; slug malicioso tentando caminho/lookup indevido.
- **STRIDE rápido:** Spoofing/EoP n/a (página pública sem auth); Tampering — dados não trafegam (mock estático tipado); Repudiation n/a; Information Disclosure — sem dado real para expor; DoS — busca em memória sobre 4 itens, sem cap necessário; EoP n/a.

## Revisão security-and-hardening (contra docs/03)

- [x] **Validação de entrada (docs/03 §7):** a query é tratada como texto puro — normalizada (`normalizeText`, compartilhada com o catálogo) e usada apenas para filtrar em memória; nunca interpretada nem refletida como HTML. O texto digitado aparece apenas como `value` do input controlado (atributo escapado pelo React), e a mensagem de estado vazio é texto fixo que **não ecoa** a query (verificado no código: nenhum `{query}` fora do `value`).
- [x] **XSS/escaping (confirmação por grep exigida):** `grep -rn "innerHTML\|dangerouslySetInnerHTML" frontend/` → vazio (re-executado no tip do branch); títulos/resumos/conteúdo/autor-renderização são nós de texto JSX (auto-escape); parágrafos renderizados um `<p>` por item do `content`.
- [x] **Slug como chave de lookup:** `getPostBySlug` faz `find` por id exato sobre lista fechada de mocks — sem concatenação em caminho, sem glob, sem execução; slug inexistente → `notFound()` → `app/blog/not-found.tsx` escopado, acolhedora e sem detalhe técnico.
- [x] **Nenhum dado real** (docs/03 §11): 4 posts e categorias 100% fictícios, tom educativo e tranquilizador (teste de contrato reprova vocabulário alarmista nos mocks).
- [x] **Segredos/rede:** nenhum segredo; `grep "fetch(|XMLHttpRequest|axios|WebSocket"` vazio na nova superfície; sem dependência nova (diff não toca `package.json`/lockfile).
- [x] **404 acolhedora verificada em runtime real** (mais forte que gates estáticos): `next start` + `curl /blog/nao-existe` → "Esse artigo não está por aqui" + "Voltar ao blog"; artigo válido e lista renderizam (saída registrada na task 3.2).

## Revisão code-review-and-quality (5 eixos)

- **Correção:** contrato dos posts (todos os campos não-vazios, sem alarmismo) e `getPostBySlug` RED-first; `searchPosts` espelha `searchProcedures` (título+resumo, acentos/caixa, categoria+texto, vazio= tudo da categoria); fluxo lista → detalhe → 404 verificado até em runtime.
- **Legibilidade:** `lib/blog.ts` enxuto (47 linhas); `formatDateBR` determinístico com guardas explícitas; nomes paralelos ao catálogo.
- **Arquitetura:** única fonte de normalização (`normalizeText` reimportado de `lib/catalog.ts`); única fonte de pills (`CategoryFilter` generalizado com props opcionais — os dois consumidores existentes intactos via typecheck); acessores em `lib/data.ts` (fronteira para API futura); sem ciclo (`blog.ts → catalog.ts`; `data.ts → mocks`).
- **Segurança:** ver seção acima — sem achados.
- **Performance:** 6 rotas estáticas/SSG; filtro em memória sobre 4 itens; sem loops unbounded.
- **Achados:** nenhum Critical/Required. *FYI:* `formatDateBR` + testes de ramos entraram no GREEN da task 2.2 além do texto literal da task (data legível para o público 40+, sem locale-dependency) — registrado com honestidade; cast `as readonly T[]` no `CategoryFilter` (único ponto não-infervel do genérico, semântica do default documentada em props); *Nit:* cast único e estreito.
- **Veredito:** Aprovado.

## Aplicação da seção 13 (registro de aplicados e dispensas)

- **Aplicado — unitários com edge cases:** `getPostBySlug` (válido/inválido), `searchPosts` (parcial título, parcial resumo, acentos/caixa, categoria+texto, vazio, queries com marcação), `formatDateBR` (válida, não-ISO, mês 00/13, dia 00/32), contrato dos posts (campos não-vazios, ≥4 posts, parágrafos não-vazios, abas sem órfãs e em ordem de inserção, vocabulário sem alarmismo).
- **Aplicado — segurança OWASP (task dedicada):** queries `<script>alert(1)</script>` e `pele & "cuidado"` filtradas como texto puro; grep de `innerHTML`/`dangerouslySetInnerHTML` vazio; query nunca ecoada fora do input controlado.
- **Aplicado — contrato/schema (fronteira mock ↔ UI):** `getPosts()`/`getPostBySlug()`/`getPostCategories()`/`searchPosts()` como contratos nomeados das rotas; `data.test.ts` de contrato intacto.
- **Aplicado — integração do fluxo crítico (lista → detalhe → 404):** build prerenderiza `/blog` + 4 artigos; **404 do slug inválido verificada em runtime real** (curl no servidor de produção); limitação registrada: sem testing-library, clique/navegação no navegador não é simulável (mesma lacuna dos changes anteriores).
- **Dispensado — mutation:** lógica trivial (filter/includes/regex/formatação), sem negócio sensível — mesma justificativa dos changes de página.
- **Dispensado — E2E (parcimônia):** jornada de alto valor é agendamento; blog é leitura.
- **Dispensado — carga (parcimônia):** sem requisito de performance.
- **Parcial — falha e resiliência:** coberta pelo slug inválido → 404 acolhedora (runtime provado) e formato de data inválido → entrada crua; sem outras dependências externas.

## Gates executados (task 4.1)

- `pnpm lint` — passou (0 erros; 1 warning pre-existente em `stryker.config.mjs`, fora do escopo deste change)
- `pnpm format` — passou (todos os arquivos no estilo Prettier)
- `pnpm typecheck` — passou (`tsc --noEmit`, com os 2 consumidores do `CategoryFilter` intactos)
- `pnpm test` — 12 arquivos, 98 testes, cobertura **100%** (162/162 stmts, 117/117 branches, 49/49 funcs, 150/150 lines) — `lib/blog.ts` a 100%, meta do padrão dos changes recentes
- `pnpm build` — passou (`/blog` estática + `/blog/[slug]` com os 4 artigos SSG)
- `openspec validate --changes` — 1 passed, 0 failed (`change/pagina-blog`)

## TDD (docs/07 §4)

- [x] RED comprovado antes de cada GREEN: task 1.1 (5/5 falhando — campos/acessores inexistentes), task 2.1 (`Cannot find module '../blog'` — 7/7 falhando). Observação honesta: `formatDateBR` foi implementada junto ao GREEN 2.2 e seus testes passaram de primeira — lacuna de teste, não de implementação; nenhum caminho de produção mudou sem prova de teste.
