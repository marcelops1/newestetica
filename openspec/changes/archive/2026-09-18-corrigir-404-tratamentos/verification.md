# Verificação — corrigir-404-tratamentos

Revisão com `code-review-and-quality` e avaliação de gatilhos com `security-and-hardening` contra `docs/security/03-seguranca.md`. Data: 2026-09-18.

## Gatilhos de segurança (docs/07 §7)

- **Entrada de usuário:** não — página estática de não-encontrado; nenhum campo, parâmetro renderizado, upload ou busca.
- **Autenticação/autorização:** não — rota pública sem login.
- **Dados de paciente:** não — nenhum dado novo; a página não exibe dado algum além de texto fixo.
- **Integrações externas:** não — sem `fetch`/XHR/rede.
- **Segredos/configuração sensível:** não — nenhuma configuração tocada; nenhuma dependência nova.

**Conclusão:** nenhum gatilho acionado; revisão de segurança registrada como não-aplicável, conforme docs/07 §7. Evidências: o novo arquivo contém apenas JSX com texto fixo e `next/link`; `grep` de `innerHTML|dangerouslySetInnerHTML|eval(|fetch(|XMLHttpRequest|axios` na superfície alterada → vazio.

## Revisão code-review-and-quality (5 eixos)

- **Correção:** slug inválido do catálogo agora renderiza a 404 acolhedora escopada — provado em runtime (`next start` + `curl`, abaixo) e pelo contrato (o módulo existe e exporta função). `page.tsx` já chamava `notFound()`; nenhuma outra mudança de comportamento.
- **Legibilidade:** `not-found.tsx` com 24 linhas espelhando o padrão do blog; copy PT própria do contexto de tratamento, tom 40+ (docs 01/06).
- **Arquitetura:** página escopada por rota (padrão do blog), sem componente compartilhado — YAGNI registrado no design; sem ciclo; nada de lógica no frontend.
- **Segurança:** nenhum gatilho; sem entrada, segredo ou I/O. Ver acima.
- **Performance:** página estática; sem custo de runtime além do render trivial.
- **Achados:** nenhum Critical/Required. *FYI (honestidade):* o teste de contrato sozinho (`typeof`) deixava o corpo do componente descoberto e a cobertura global cairia a 99,41% no new code; foi adicionado um smoke que invoca o componente puro, mantendo 100% sem jsdom — registrado como adição ao texto literal da task 1.2.
- **Veredito:** Aprovado.

## Verificação em runtime (task 2.1 — método dos changes anteriores)

`next build` + `next start` + `curl`:

**`/tratamentos/nao-existe` (corrigido):**

```
status=404
Página não encontrada
Esse tratamento não está por aqui
Volte ao catálogo e encontre
Voltar ao catálogo
```

**`/blog/nao-existe` (controle):**

```
status=404
Página não encontrada
Esse artigo não está por aqui
Voltar ao blog
```

## TDD (docs/07 §4)

- **RED (task 1.1):** `Cannot find module '../not-found' imported from .../app/tratamentos/__tests__/not-found.test.ts` — módulo inexistente, precedente do change `pagina-blog`.
- **GREEN (task 1.2):** teste de contrato 1/1 verde após criar a página; smoke adicional na sequência (ver FYI acima).
- Sem exceção §4: comportamento real coberto por teste que falhou antes.

## Aplicação da seção 13 (aplicados e dispensas)

- **Aplicado — unitários/contrato:** módulo existe, export default é função e o corpo do componente executa retornando elemento.
- **Aplicado — integração do fluxo crítico por runtime:** 404 acolhedora verificada no HTML servido em produção, com o blog como controle (mesma técnica dos changes `pagina-blog`, `corrigir-menu-resultados-depoimentos` e `corrigir-navegacao-footer`).
- **Dispensado — segurança OWASP / contrato de dados:** sem entrada de usuário e sem fronteira de dados.
- **Dispensado — mutation:** página estática sem lógica ramificada.
- **Dispensado — E2E e carga (parcimônia):** jornada de alto valor continua sendo o agendamento.

## Gates executados (task 2.1)

- `pnpm lint` — passou (0 erros; 1 warning pré-existente em `stryker.config.mjs`)
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 15 arquivos, 106 testes, cobertura **100%** (171/171 stmts, 117/117 branches, 54/54 funcs, 157/157 lines)
- `pnpm build` — passou (21 páginas; segmento `/tratamentos` agora serve a 404 escopada)
- `openspec validate --changes` — passou (1 passed, 0 failed; `skip_specs` aceito)

## Consistência de documentação (task 2.2)

- `docs/product/05-estado-atual.md`: removida a ressalva da 404 do catálogo (linha 102), agora redundante; contagens afetadas por este change atualizadas (14 arquivos/104 testes → 15/106; "22 changes antes deste" → 23), com o restante preservado.
- `README.md`: contagens equivalentes atualizadas (15/106; 24 changes arquivados, 22 com specs) pela mesma razão.
- **Não tocado (pré-existente, não causado por este change):** "19 PRs mergeados" — já defasado pelo merge do #20; segue como FYI para um futuro refresh, como acordado na revisão do PR #20.
- `docs/product/08-backlog-produto.md`: **sem alteração necessária** — a spec já exigia este comportamento; nenhum status de Use Case/Feature fica incorreto com a conformidade alcançada.
