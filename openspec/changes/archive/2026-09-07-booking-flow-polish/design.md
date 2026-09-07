## Context

Ver `proposal.md` (Why). Ponto de partida: `BookingModal` em `frontend/features/booking/` com envio instantâneo→sucesso, validação só nativa, foco inicial + Escape + devolução, sem trap; `lib/data.ts` sem função de envio. Restrições: zero rede, mobile-first, UX 40+, tokens existentes (`danger`/`success` para erro/sucesso).

## Goals / Non-Goals

**Goals:**

- Quatro estados explícitos com transições calmas e mensagens no tom.
- Acessibilidade de formulário e diálogo sem libs novas.
- Erro demonstrável e testável de forma determinística.

**Non-Goals:**

- Máscara de telefone, calendário de slots ou escolha de data (futuro `booking-flow` completo / backend).
- Persistência (localStorage, cookies) de qualquer dado do formulário.
- Biblioteca de formulários ou de testes de componentes.

## Decisions

### 1. Máquina de estados local (`idle → sending → success | error`)

Rationale: um `useState` de status elimina estados impossíveis (ex.: sucesso + enviando) e deixa cada estado renderizável e revisável isoladamente.
Alternativas consideradas: booleanos separados (`sent`, `sending`, `failed`) (rejeitado: combinações inválidas possíveis) e reducer (rejeitado: over-engineering para 4 estados lineares).

### 2. `submitBookingRequest()` mockada com atraso curto e erro forçável

Rationale: atraso (~600ms) torna o estado de envio perceptível; parâmetro `forceError` permite demonstrar e testar o erro sem aleatoriedade nem rede.
Alternativas consideradas: falha aleatória (rejeitado: não determinística, quebra testes) e erro via nome mágico digitado (rejeitado: obscuro e frágil).

### 3. Validação própria em português + `aria-describedby`, mantendo `required` nativo

Rationale: mensagens amigáveis e programáticas para leitor de tela; o nativo continua como rede de segurança.
Alternativas consideradas: só nativo (rejeitado: mensagens do navegador, sem tom) e lib de validação (rejeitado: dependência sem benefício nesta escala).

### 4. Focus trap manual mínimo (primeiro/último elemento, Tab/Shift+Tab)

Rationale: ~15 linhas, sem dependência, suficiente para um diálogo pequeno; mantém Escape, overlay e devolução já existentes.
Alternativas consideradas: `focus-trap` lib (rejeitado: dependência para um caso simples) e nada (rejeitado: viola o requisito de contenção).

## Risks / Trade-offs

- [Risco] Atraso simulado confundir com lentidão real → Mitigação: indicador de envio claro + texto calmo ("Enviando com cuidado…").
- [Risco] `forceError` vazar para produção futura → Mitigação: parâmetro só usado em testes/demo; documentado no código como mock.
- [Trade-off] Sem máscara de WhatsApp a digitação é livre → Aceito: validação mínima de dígitos; máscara entra no fluxo completo com backend.
