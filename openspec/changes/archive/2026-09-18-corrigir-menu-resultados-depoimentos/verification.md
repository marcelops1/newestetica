# Verificação — corrigir-menu-resultados-depoimentos

Revisão com `code-review-and-quality` e avaliação de gatilhos com `security-and-hardening` contra `docs/security/03-seguranca.md`. Data: 2026-09-18.

## Gatilhos de segurança (docs/07 §7)

- **Entrada de usuário:** não — o change só troca constantes de `href` em `NAV_ITEMS`; nenhum campo, upload, parâmetro ou busca.
- **Autenticação/autorização:** não — navegação pública; sem login, sessão, papéis ou 2FA.
- **Dados de paciente:** não — nenhum dado novo; os destinos apontam para rotas estáticas já existentes (`/antes-depois`, `/depoimentos`).
- **Integrações externas:** não — nenhum `fetch`/XHR/rede; `nav-items.ts` é dado estático importado.
- **Segredos/configuração sensível:** não — o diff não toca `.env`, CI, lockfile ou configuração; nenhuma dependência nova.

**Conclusão:** nenhum gatilho acionado; revisão de segurança registrada como não-aplicável, conforme docs/07 §7 (registro obrigatório para liberar o archive). Evidências: `grep` de `innerHTML|dangerouslySetInnerHTML|eval(|fetch(|XMLHttpRequest|axios` na superfície alterada → vazio; `nav-items.ts` sem I/O; Header segue com `next/link` (`Header.tsx:4`, import de `NAV_ITEMS` em `Header.tsx:7`, consumido no desktop em `Header.tsx:33` e no drawer em `Header.tsx:82`).

## Revisão code-review-and-quality (5 eixos)

- **Correção:** destinos batem com a spec — Resultados→`/antes-depois`, Depoimentos→`/depoimentos`, Diferenciais→`/#diferenciais`, Tratamentos→`/tratamentos`, A Clínica→`/sobre` — provados por teste (4/4) e pelo HTML servido em runtime. Invariantes preservados.
- **Legibilidade:** `nav-items.ts` de 12 linhas, tipo explícito, sem lógica; Header ficou menor (removeu a constante inline).
- **Arquitetura:** destino único de navegação consumido por desktop e drawer; módulo puro sem dependências de UI, seguindo a fronteira `features/home/sections`; sem ciclo; sem duplicação (o Header não redeclara item algum).
- **Segurança:** nenhum gatilho; sem entrada, segredo ou I/O. Ver seção acima.
- **Performance:** dado estático avaliado uma vez no módulo; nenhum efeito em render ou bundle relevante.
- **Achados:** nenhum Critical/Required. *FYI:* `Footer.tsx:21-25` mantém âncoras nuas (`#resultados`, `#depoimentos`, `#tratamentos`, `#diferenciais`) que quebram fora da home — explicitamente fora do escopo deste change (proposal, "What Changes"); candidato a change futuro.
- **Veredito:** Aprovado.

## Verificação em runtime (além dos gates)

`next start` (build de produção) + `curl` na home:

- Bloco `<header>` renderizado contém exatamente: `/` (logo), `/tratamentos`, `/#diferenciais`, `/antes-depois`, `/depoimentos`, `/sobre`, `https://wa.me/...` (WhatsApp).
- Status HTTP: `/` 200, `/antes-depois` 200, `/depoimentos` 200, `/tratamentos` 200, `/sobre` 200.
- Diferenciais confirma-se âncora `/#diferenciais`; Tratamentos (`/tratamentos`) e A Clínica (`/sobre`) sem regressão, tanto no teste quanto no HTML servido.

## TDD (docs/07 §4)

- **RED (task 1.1):** teste do mapa completo contra o `NAV_ITEMS` extraído verbatim — 2/4 falhando, com as duas asserções-alvo: `expected '/#resultados' to be '/antes-depois'` e `expected '/#depoimentos' to be '/depoimentos'`; as 2 asserções de invariante (Diferenciais, Tratamentos/A Clínica) já passavam.
- **GREEN (task 1.2):** após trocar os dois destinos, 4/4 passando.
- Sem exceção §4: mudança de comportamento real coberta por teste que falhou antes.

## Aplicação da seção 13 (aplicados e dispensas)

- **Aplicado — unitários:** mapa completo dos 5 destinos, incluindo os invariantes de Diferenciais e das rotas já corrigidas.
- **Dispensado — segurança OWASP / contrato / integração:** sem entrada de usuário, sem fronteira de dados e sem dependência externa; a verificação de integração do destino foi feita em runtime no HTML servido (acima), mais forte que um mock de navegação.
- **Dispensado — mutation:** dado estático sem lógica ramificada.
- **Dispensado — E2E e carga (parcimônia):** troca de destinos; jornada de alto valor continua sendo o agendamento.

## Backlog (task 2.2)

Avaliação de `docs/product/08-backlog-produto.md`: **sem alteração necessária**. Não existe Use Case/Feature de navegação de menu com status a corrigir — o menu é comportamento transversal do Header, sem entrada própria no backlog. Os status vizinhos permanecem corretos: UC 1.1.1 (Home) segue "Concluído (implementada com mocks...)"; UC 1.4.1 (`/antes-depois`) e UC 1.5.1 (`/depoimentos`) seguem "Em andamento... pendente validação com a Fabiana", sem relação com o destino do link do menu. Este change é correção de bug de navegação, não feature nova.

## Gates executados (task 2.1)

- `pnpm lint` — passou (0 erros; 1 warning pré-existente em `stryker.config.mjs`, fora do escopo)
- `pnpm format` — passou (todos os arquivos no estilo Prettier)
- `pnpm typecheck` — passou (`tsc --noEmit`)
- `pnpm test` — 13 arquivos, 102 testes, cobertura **100%** (163/163 stmts, 117/117 branches, 49/49 funcs, 151/151 lines)
- `pnpm build` — passou (21 páginas estáticas, incluindo `/antes-depois` e `/depoimentos`)
- `openspec validate --changes` — passou (1 passed, 0 failed: `change/corrigir-menu-resultados-depoimentos`)
