# Verificação — adicionar-paginas-faltantes-ao-menu

Revisão com `code-review-and-quality` e avaliação de gatilhos com `security-and-hardening` contra `docs/security/03-seguranca.md`. Data: 2026-09-19.

## Gatilhos de segurança (docs/07 §7)

- **Entrada de usuário:** não — acréscimo de links de navegação e de um CTA; nenhum campo, upload, parâmetro ou busca.
- **Autenticação/autorização:** não — navegação pública; sem login, sessão, papéis ou 2FA.
- **Dados de paciente:** não — nenhum dado novo; destinos apontam para rotas estáticas existentes.
- **Integrações externas:** não — nenhum `fetch`/XHR/rede; `NAV_DESTINATIONS` é dado estático.
- **Segredos/configuração sensível:** não — o diff não toca `.env`, CI, lockfile ou configuração; nenhuma dependência nova. Copy nova = apenas labels "Blog"/"Contato" e CTA "Pedir Orçamento", sem promessas nem urgência artificial (docs/01).

**Conclusão:** nenhum gatilho acionado; revisão de segurança registrada como não-aplicável (registro obrigatório para liberar o archive). Evidência: `grep` de `innerHTML|dangerouslySetInnerHTML|eval(|fetch(|XMLHttpRequest|axios` na superfície alterada → vazio.

## Revisão code-review-and-quality (5 eixos)

- **Correção:** Blog/Contato acessíveis no rodapé e Orçamento como CTA no header/drawer, provados por teste unitário (constantes + mapa do rodapé) e por runtime (HTML servido); nada existente mudou de destino, ordem ou label.
- **Legibilidade:** rodapé híbrido explícito (4 derivados + 2 entradas com href via constante); CTA usando `CTAButton` existente.
- **Arquitetura:** `NAV_DESTINATIONS` segue como fonte única dos hrefs (nenhum literal duplicado); Header e rodapé com ordens/labels próprios; sem ciclo; sem dependência nova.
- **Segurança:** nenhum gatilho; sem entrada, segredo ou I/O. Ver acima.
- **Performance:** dados estáticos; uma constante a mais e um CTA; sem impacto relevante.
- **Achados:** nenhum Critical/Required. *FYI 1:* o header desktop ganha um terceiro botão — em larguras md/lg a densidade já era alta com dois (comportamento pré-existente); sugerido conferir no ciclo de validação visual com a Fabiana. *FYI 2:* o CTA usa `CTAButton href` (renderiza `<a>` simples, navegação com reload) — trade-off registrado no design (decisão 2), reversível se virar atrito real.
- **Veredito:** Aprovado.

## Verificação em runtime (método dos changes anteriores)

`next build` + `next start` + `curl` no HTML servido da home:

- **Rodapé** (bloco `nav aria-label="Navegação do rodapé"`) — 6 links, incluindo os novos:

```
href="/tratamentos"
href="/antes-depois"
href="/depoimentos"
href="/#diferenciais"
href="/blog"        ← novo
href="/contato"     ← novo
```

- **Header** (bloco `<header>`) — CTA novo presente:

```
href="/tratamentos", href="/antes-depois", href="/depoimentos", href="/#diferenciais", href="/sobre", href="/" (logo), WhatsApp
href="/orcamento"   ← novo (contagem 1)
texto "Pedir Orçamento" presente
```

**Nota de método (honestidade):** o drawer é renderizado condicionalmente (`open ? ... : null`) e não aparece no HTML inicial; a checagem de runtime cobre o CTA desktop (que está no DOM servido). O CTA do drawer usa o mesmo `CTAButton` e a mesma constante `NAV_DESTINATIONS.orcamento`, verificado por leitura + typecheck — não por curl. Nenhuma automação de browser disponível no projeto.

## TDD (docs/07 §4)

- **RED (1.1):** 3 testes de constantes falham com `undefined` (constantes inexistentes).
- **GREEN (1.2):** 9/9 na pasta (7 Header + 2 rodapé).
- **RED (2.1):** teste de ordem do rodapé espera 6 labels, recebe 4 (`Blog`/`Contato` ausentes).
- **GREEN (2.2):** teste 9/9; runtime do rodapé com os 6 hrefs.
- **RED (3.1):** runtime do header servido sem `href="/orcamento"` (contagem 0).
- **GREEN (3.2):** runtime com `href="/orcamento"` (contagem 1) e texto "Pedir Orçamento"; lint/typecheck verdes.
- Sem exceção §4: os três comportamentos tiveram prova de falha antes da implementação.

## Aplicação da seção 13 (aplicados e dispensas)

- **Aplicado — unitários:** constantes canônicas novas e mapa/ordem do rodapé (6 itens).
- **Aplicado — integração do fluxo por runtime:** hrefs novos confirmados no HTML servido da home (rodapé e header), com o método dos changes anteriores.
- **Dispensado — segurança OWASP / contrato:** sem entrada de usuário e sem fronteira de dados.
- **Dispensado — mutation:** dados estáticos sem lógica ramificada.
- **Dispensado — E2E e carga (parcimônia):** jornada de alto valor continua sendo o agendamento.

## Backlog (task 4.2)

Avaliação de `docs/product/08-backlog-produto.md`: **sem alteração necessária**. Os UCs das três páginas (1.7.1 Orçamento, 1.8.2 Contato, 1.9.1 Blog) descrevem implementação e validação pendente com a Fabiana; adicionar links de acesso não altera esses status. UC 1.8.1 menciona "Link visível no header, CTA final e rodapé" — o rodapé agora inclui `/contato`, permanecendo consistente (nenhuma correção requerida).

## Gates executados (task 4.1)

- `pnpm lint` — passou (0 erros; 1 warning pré-existente em `stryker.config.mjs`; `no-html-link-for-pages` limpa)
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 15 arquivos, 109 testes, cobertura **100%** (172/172 stmts, 117/117 branches, 54/54 funcs, 158/158 lines)
- `pnpm build` — passou (21 páginas)
- `openspec validate --changes` — passou (1 passed, 0 failed)
