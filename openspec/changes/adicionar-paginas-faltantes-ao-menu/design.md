## Context

Ver `proposal.md` (Why). Ponto de partida: `NAV_ITEMS` com 5 itens e `FOOTER_NAV_ITEMS` com 4 (derivados via `flatMap`/`filter` sobre `NAV_ITEMS`); `/blog`, `/contato` e `/orcamento` existem em produção sem nenhum link no Header ou rodapé. `CTAButton` aceita `href` + `variant="ghost"` (precedente: `Hero.tsx:39`). Header desktop tem logo + 5 links + WhatsApp fantasma + CTA primário; drawer tem 5 links + CTA primário + WhatsApp. Testes em ambiente `node` (sem jsdom/testing-library); runtime (`next start` + `curl` no HTML servido) é o método estabelecido de prova de binding.

## Goals / Non-Goals

**Goals:**

- Blog, Contato e Orçamento alcançáveis por navegação a partir de qualquer página, com placement que respeita espaço do Header, mobile-first/40+ e tom acolhedor — sem duplicar literais de destino.

**Non-Goals:**

- Mudar ordem/labels/estilo existentes; nova superfície de UI; mexer em páginas, backend ou specs além dos dois requirements.

## Decisions

### 1. Placement: Header nav intacto (5); Orçamento vira CTA fantasma no header (desktop + drawer); Blog e Contato vão ao rodapé (após Diferenciais)

Rationale: header desktop já tem 7 elementos e o drawer 7 blocos — adicionar 3 links entupiria o menu e inflaria o drawer, contra mobile-first e carga cognitiva 40+. Orçamento é ação de conversão (medo de preço, docs/01) e merece destaque de CTA, não item de menu; Blog (descoberta educativa) e Contato (estável, já redundante via WhatsApp em todo header) cabem no rodapé, que comporta lista maior. Drawer recebe o CTA de Orçamento (consistência desktop/mobile), após Agendar e antes do WhatsApp. Alternativas consideradas: tudo no header (rejeitada — poluição do menu e do drawer); tudo no rodapé incluindo Orçamento (rejeitada — esconde a conversão e não endereça a ansiedade de preço); Orçamento substituindo Agendar (rejeitada — agendamento é a conversão primária do MVP); nova seção de CTAs na home (rejeitada — nova superfície, fora de escopo).

### 2. CTA via `CTAButton href` + `variant="ghost"` (API existente, precedente `Hero.tsx:39`)

Rationale: reaproveita o componente canônico de botão (mesmo visual fantasma do WhatsApp, hierarquia clara contra o primário Agendar); a regra `no-html-link-for-pages` só acusa `<a>` literal, então o gate de lint segue verde. Trade-off aceito e registrado: `CTAButton` com `href` renderiza `<a>` simples (navegação com reload em vez de transição client-side) — aceitável para páginas estáticas leves sem estado a preservar. Alternativas consideradas: `next/link` com classes fantasma duplicadas (rejeitada — duplica estilo, risco de deriva); estender `CTAButton` para embrulhar `Link` (rejeitada — mexe em componente compartilhado por 1 CTA novo; escopo desproporcional).

### 3. Dados: `NAV_DESTINATIONS` ganha `blog`, `contato`, `orcamento`; rodapé híbrido (4 derivados + 2 entradas explícitas com hrefs via constantes e labels próprios)

Rationale: Blog/Contato não estão em `NAV_ITEMS`, então a derivação por lookup não os alcança — as 2 entradas declaram href via constante (eixo do bug, sem duplicação) e labels próprias do rodapé (apresentação é de cada consumidor, como a ordem já era). Alternativas consideradas: duplicar os literais (rejeitada — recria a deriva); lookup por label com `find` (rejeitada — `undefined`, exigiria assertion, precedente rejeitado); colocar os labels em `NAV_ITEMS` (rejeitada — o header herdaria itens que não deve ter).

### 4. Testes: unit RED/GREEN para constantes e mapa do rodapé; RED/GREEN de runtime para os bindings (CTA e hrefs novos) — sem exceção §4

Rationale: binding JSX↔href não é unit-testável no env `node`; a checagem de runtime (`curl` no HTML servido afirmando os hrefs) é teste executável com pass/fail e precede a implementação, como exige docs/07 §5. Alternativas consideradas: jsdom (rejeitado — não instalado); regex sobre o fonte (rejeitado — frágil, precedente); exceção §4 (rejeitada — há comportamento real e há como testá-lo primeiro).

### 5. Spec: dois MODIFIED em `public-site-structure` (CTA no requirement do Header; Blog/Contato no do rodapé + correção da frase "mesmos destinos do menu do Header", que ficaria falsa)

Rationale: comportamento observável novo nos dois requirements; a frase antiga precisa de correção junto, não em change separado.

## Risks / Trade-offs

- [Risco] Drawer cresce em um bloco fantasma → Mitigação: ainda curto (5 links + 3 ações), 44px mantidos, sem urgência artificial.
- [Risco] CTA com reload em vez de transição client-side → Mitigação: aceito (páginas estáticas, precedente `Hero.tsx:39`); reversível estendendo o `CTAButton` no futuro se virar problema real.
- [Trade-off] Labels "Blog"/"Contato" vivem só no módulo do rodapé → aceito: labels nunca causaram bug; hrefs seguem em fonte única.
