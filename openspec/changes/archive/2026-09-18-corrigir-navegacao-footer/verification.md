# Verificação — corrigir-navegacao-footer

Revisão com `code-review-and-quality` e avaliação de gatilhos com `security-and-hardening` contra `docs/security/03-seguranca.md`. Data: 2026-09-18.

## Gatilhos de segurança (docs/07 §7)

- **Entrada de usuário:** não — troca de destinos e de elemento de link na coluna Navegação do rodapé; nenhum campo, upload, parâmetro ou busca.
- **Autenticação/autorização:** não — navegação pública; sem login, sessão, papéis ou 2FA.
- **Dados de paciente:** não — nenhum dado novo; os destinos apontam para rotas estáticas já existentes.
- **Integrações externas:** não — nenhum `fetch`/XHR/rede; `NAV_DESTINATIONS`/`FOOTER_NAV_ITEMS` são dados estáticos importados.
- **Segredos/configuração sensível:** não — o diff não toca `.env`, CI, lockfile ou configuração; nenhuma dependência nova.

**Conclusão:** nenhum gatilho acionado; revisão de segurança registrada como não-aplicável, conforme docs/07 §7 (registro obrigatório para liberar o archive). Evidências: `grep` de `innerHTML|dangerouslySetInnerHTML|eval(|fetch(|XMLHttpRequest|axios` na superfície alterada → vazio; Footer e módulos sem I/O; links internos migrados para `next/link`.

## Revisão code-review-and-quality (5 eixos)

- **Correção:** `FOOTER_NAV_ITEMS` aponta os 4 destinos canônicos (Tratamentos→`/tratamentos`, Resultados→`/antes-depois`, Depoimentos→`/depoimentos`, Diferenciais→`/#diferenciais`), provado por teste (5/5) e pelo HTML servido em runtime, na home e em `/depoimentos`. Header sem regressão (4/4 + HTML).
- **Legibilidade:** `NAV_DESTINATIONS` com nomes autoexplicativos; `footer-nav-items.ts` com 8 linhas e ordem própria; Footer.removeu o array inline.
- **Arquitetura:** fonte única de destino (`nav-items.ts`) referenciada pelos dois consumidores — elimina a causa-raiz da saga (conhecimento de destino duplicado); sem ciclo (`footer-nav-items → nav-items`); `NavItem` importado como type; sem duplicação.
- **Segurança:** nenhum gatilho; sem entrada, segredo ou I/O. Ver seção acima.
- **Performance:** constantes estáticas avaliadas uma vez; páginas seguem SSG.
- **Achados:** nenhum Critical/Required. *FYI:* o teste do Header (`nav-items.test.ts`) não afirmava os literais das constantes compartilhadas — segue válido e verde; a mudança para constantes é invisível ao consumer.
- **Veredito:** Aprovado.

## Verificação em runtime (além dos gates)

`next start` (build de produção) + `curl`:

- Rodapé na home e em `/depoimentos` contém exatamente: `/tratamentos`, `/antes-depois`, `/depoimentos`, `/#diferenciais` — links absolutos, funcionando de qualquer página.
- Header na home permanece com: `/` (logo), `/tratamentos`, `/#diferenciais`, `/antes-depois`, `/depoimentos`, `/sobre`, WhatsApp — sem regressão pela mudança compartilhada.

## Regra de lint `@next/next/no-html-link-for-pages` (task 2.1)

- `eslint .` após a migração: 0 erros (só o warning pré-existente de `stryker.config.mjs`).
- Regra comprovadamente ativa: probe em `stdin` com `<a href="/tratamentos">` → erro `no-html-link-for-pages` ("Use `<Link />` from `next/link`"); ou seja, o `<a>` antigo seria barrado e a migração é o que mantém a coluna limpa.

## TDD (docs/07 §4)

- **RED (task 1.1):** teste contra os itens extraídos verbatim do Footer — 5/5 falhando: `'#tratamentos' ≠ '/tratamentos'`, `'#resultados' ≠ '/antes-depois'`, `'#depoimentos' ≠ '/depoimentos'`, `'#diferenciais' ≠ '/#diferenciais'` e o invariante "todo destino parte da raiz".
- **GREEN (task 1.2):** constantes compartilhadas + `next/link` — 5/5 verdes; Header 4/4 segue verde.
- Sem exceção §4: mudança de comportamento real coberta por teste que falhou antes.

## Aplicação da seção 13 (aplicados e dispensas)

- **Aplicado — unitários:** mapa completo dos 4 destinos do rodapé + invariante de âncora crua (trava a classe do bug para itens futuros).
- **Dispensado — segurança OWASP / contrato / integração:** sem entrada de usuário, sem fronteira de dados e sem dependência externa; a integração dos destinos foi verificada em runtime no HTML servido (home e `/depoimentos`).
- **Dispensado — mutation:** dado estático sem lógica ramificada.
- **Dispensado — E2E e carga (parcimônia):** troca de destinos; jornada de alto valor continua sendo o agendamento.

## Backlog (task 2.2)

Avaliação de `docs/product/08-backlog-produto.md`: **sem alteração necessária**. Não existe Use Case/Feature de navegação de rodapé com status a corrigir. UC 1.1.1 (Home) segue "Concluído (implementada com mocks...)" — a correção é de bug de navegação, não feature; UC 1.8.1 (WhatsApp) cita "header, CTA final e rodapé", mas seus links externos (`contact.whatsappHref`) não foram tocados e seguem corretos como `<a target="_blank">`; os demais status permanecem precisos.

## Gates executados (task 2.1)

- `pnpm lint` — passou (0 erros; 1 warning pré-existente em `stryker.config.mjs`, fora do escopo)
- `pnpm format` — passou (todos os arquivos no estilo Prettier)
- `pnpm typecheck` — passou (`tsc --noEmit`)
- `pnpm test` — 14 arquivos, 107 testes, cobertura **100%** (165/165 stmts, 117/117 branches, 49/49 funcs, 153/153 lines)
- `pnpm build` — passou (21 páginas estáticas)
- `openspec validate --changes` — passou (1 passed, 0 failed: `change/corrigir-navegacao-footer`)
