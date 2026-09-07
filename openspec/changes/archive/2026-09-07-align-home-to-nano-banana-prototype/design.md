## Context

Ver `proposal.md` (Why) para a motivação. Ponto de partida: home implementada no change `frontend-foundation-mocks` (hero centralizado, CTAs `ink`, seções estáticas com placeholders) e referência em `docs/prototypes/home-nano-banana.html` (Tailwind CDN + JS inline: drawer, modal, filtros, slider, quiz). Restrições: mesmos tokens (as paletas são idênticas), mesmos mocks (estendidos, não trocados), sem backend, mobile-first e UX 40+.

## Goals / Non-Goals

**Goals:**

- Paridade visual com o protótipo usando só tokens aprovados e componentes React acessíveis.
- Interações do protótipo recriadas com estado React local (sem libs novas): drawer, quiz, filtros, comparador, modal.
- Mocks estendidos de forma compatível (só adição de campos/itens, nada existente muda de forma).

**Non-Goals:**

- Novas páginas ou rotas (Sobre, Agendamento e demais continuam em changes próprios).
- Envio real do formulário, persistência ou qualquer chamada de rede.
- Slider de imagens com fotos reais; comparador usa blocos locais até aprovação com consentimento.
- Redefinir tokens: a paleta do protótipo é idêntica à de `styles/tokens.css`, nada muda nela.

## Decisions

### 1. Componentes de seção reescritos sobre `SectionHeader`/`CTAButton` estendidos, não novos sistemas

Rationale: reaproveita a fundação (composição, 44px, tom) e concentra a mudança visual nos pontos do protótipo; `CTAButton` ganha variante primária taupe.
Alternativas consideradas: reescrever tudo do zero (rejeitado: descarta fundação aprovada) e manter `ink` com exceção pontual (rejeitado: o pedido é paridade total com o protótipo).

### 2. Estado local com `useState` por seção + modal com contexto mínimo

Rationale: cada interação (drawer, quiz, filtro, slider, modal) é local e independente — `useState` é o suficiente (skill `frontend-ui-engineering`); evita store global sem necessidade.
Alternativas consideradas: Zustand/Context global (rejeitado: over-engineering para estado que não é compartilhado).

### 3. Comparador antes/depois com blocos locais e controle ARIA `slider`

Rationale: reproduz o gesto do protótipo (mouse/toque/teclado, trava 5–95%) sem foto externa; `role="slider"` + `aria-valuenow` torna o gesto perceptível a leitor de tela.
Alternativas consideradas: hotlink Unsplash do protótipo (rejeitado: dependência externa, privacidade de terceiros, fotos não consentidas) e versão estática lado a lado (rejeitado: perde a paridade com a referência).

### 4. Modal com dados mockados e fechamento triplo (botão, overlay, Escape)

Rationale: cobre o fluxo de agendamento do MVP visualmente; envio mockado exibe sucesso sem rede; foco gerenciado (retorna ao abridor) evita armadilha de teclado.
Alternativas consideradas: modal real com backend (rejeitado: fora da estratégia frontend-first) e CTAs como links mortos (rejeitado: quebra a experiência validável).

### 5. Mocks estendidos por adição (quiz, categorias, caso clínico, opções do modal)

Rationale: adição pura não quebra nada existente; categorias derivam dos dados (abas nunca órfãs); tudo marcado fictício.
Alternativas consideradas: reescrever os mocks (rejeitado: risco sem benefício) e hardcodar conteúdo nas seções (rejeitado: viola a arquitetura de mocks).

## Risks / Trade-offs

- [Risco] Branco sobre `primary` abaixo do AA estrito → Mitigação: exceção documentada no spec, hover `primary-hover`, semibold 14px+, mesma escolha do protótipo aprovado.
- [Risco] Blocos locais no lugar da foto do hero parecerem "vazios" na validação → Mitigação: composição rica (badge, métricas, card flutuante) carrega o visual; fotos entram após aprovação com consentimento.
- [Risco] Archive fora de ordem misturar deltas → Mitigação: ordem explícita (fundação antes deste); deltas são só ADDED, sem conflito de conteúdo.
- [Trade-off] Modal mockado pode sugerir funcionalidade pronta → Aceito: estado de sucesso deixa claro que é solicitação (recepção confirma), texto herdado do protótipo.
