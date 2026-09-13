## Context

Ver `proposal.md` (Why) e `specs/public-site-structure/spec.md` (WHAT). Ponto de partida: `frontend/lib/quote.ts` (`submitQuoteRequest` + `parseQuoteInput` + `validateQuoteFields`, 100% de cobertura nas 4 métricas, revisão do PR #13 sem ressalvas bloqueantes); `frontend/features/quote/QuotePage.tsx` (client, 4 estados, microcopy acolhedora, `aria-invalid`/`aria-describedby`, nota LGPD); `getContactInfo()` em `frontend/lib/data.ts` (WhatsApp/horários/endereço fictícios, padrão de dado fictício já usado em Sobre); padrão de página validado (`app/<rota>/page.tsx` + `features/<domínio>/<Page>.tsx`, client component com `Header`/`Footer`/`BookingModal`); sem `@testing-library` — testes no nível `lib/` (vitest, node). Restrições: docs/01 (tom, 40+), docs/06 (tokens, formulários), docs/03 (validação, XSS, LGPD, sem dado real), docs/07 §7 (gatilho: entrada de usuário → revisão `security-and-hardening` obrigatória no Verify) e §13 (tipos de teste). Decisões de escopo confirmadas com o solicitante: formulário vira novo UC 1.8.2 (UC 1.8.1 intocado); campo de contato único flexível (e-mail OU WhatsApp).

## Goals / Non-Goals

**Goals:**

- Página `/contato` com formulário simples (nome, contato flexível, mensagem), confirmação acolhedora e bloco institucional fictício.
- Função de submissão mockada espelhando `submitQuoteRequest`, com contrato/schema nomeado incluindo as duas faces do campo flexível.
- Mesmo rigor de `pagina-orcamento` nos testes (§13) mirando 100% de cobertura em `lib/contact.ts`.

**Non-Goals:**

- Backend, persistência, e-mail transacional, envio real de mensagem.
- Número/link real novo; alteração dos links de WhatsApp existentes (UC 1.8.1).
- Novos mocks (o `contactMock` existente basta); novo Design System/tokens.
- Validação com a Fabiana neste change.

## Aplicação da seção 13 (tipos de teste que se aplicam)

| Tipo (docs/07 §13) | Aplica? | Como |
|---|---|---|
| Unitários com edge cases | **Sim (sempre)** | RED-first em `submitContactRequest` (sucesso, `forceError` acolhedor, sem rede via spy de `fetch`) + validação das duas faces do campo flexível (e-mail válido, WhatsApp válido, ambos inválidos) + mensagem vazia/longa |
| OWASP | **Sim (sempre — gatilho §7: entrada de usuário real)** | Task dedicada: payloads maliciosos (`<script>`, `<img onerror>`, `&`, aspas) tratados como texto — sem `innerHTML`/`dangerouslySetInnerHTML` (grep) + schema rejeita tipo errado sem vazar detalhes; revisão `security-and-hardening` registrada no Verify contra docs/03 |
| Contrato/schema | **Sim (sempre — fronteira UI ↔ mock)** | Contrato nomeado do payload (`ContactInput`/`ContactResult` + validador/schema) desenhado com apoio da skill `api-and-interface-design`; testado RED-first (válido passa, malformado retorna erro acolhedor); documenta a futura troca mock → API real |
| Integração de fluxo crítico | **Sim (preencher → enviar → confirmação)** | Estados da página verificados pelos gates disponíveis; limitação registrada: sem testing-library no projeto, clique/fluxo de componente não é simulável — cobertura via teste da lib + build/typecheck + revisão manual no Verify |
| Mutation | Não — dispensado (registrar em verification.md no apply) | Lógica trivial (trim/match de formato/delay mockado), sem negócio sensível — mesma justificativa de `pagina-orcamento` |
| Falha e resiliência | **Sim, parcial** | Coberta pelo caso `forceError` (dados preservados, nova tentativa) e mensagem longa como texto; sem dependência externa além disso |
| E2E | Não (parcimônia) | Jornada de alto valor é agendamento; contato não recebe E2E nesta fase |
| Carga | Não (parcimônia) | Sem requisito de performance |

## Decisions

### 1. `frontend/lib/contact.ts` espelhando `quote.ts` (`submitContactRequest` + `ContactInput`/`ContactResult`)

Rationale: o padrão foi revisado sem ressalvas bloqueantes no PR #13 (contrato em duas camadas — schema de forma + validação de conteúdo —, erro acolhedor único, 100% de cobertura); espelhar mantém a troca futura mock → API isolada em `lib/` (docs/02 §6, docs/04 §10). O contrato é desenhado com apoio da skill `api-and-interface-design`, antecipando `contracts/` sem criá-lo agora.
Alternativas consideradas: reutilizar `submitQuoteRequest` (rejeitado: semântica errada — orçamento ≠ mensagem — e acoplaria evoluções); chamada real/placeholder de API (rejeitado: viola frontend-first).

### 2. Campo de contato único flexível (e-mail OU WhatsApp)

Rationale: decisão confirmada com o solicitante; um campo reduz carga cognitiva da paciente 40+ (docs/01 §5.3 — fluxos curtos, uma ação por vez) em vez de dois campos com regras distintas. A validação aceita se qualquer uma das faces passar (e-mail com formato válido OU WhatsApp com ≥10 dígitos); falhando ambas, mensagem acolhedora única orienta os dois formatos. Definição de "e-mail válido" propositalmente pragmática (formato local@domínio, sem regex exótico) — validação real de entregabilidade é papel do backend futuro.
Alternativas consideradas: dois campos separados (rejeitado pelo solicitante + mais atrito no mobile); só WhatsApp (rejeitado: exclui quem prefere e-mail, e o UC 1.8.1 já cobre o caminho WhatsApp).

### 3. `features/contact/ContactPage.tsx` reaproveitando `QuotePage`

Rationale: microcopy, classes, `aria-invalid`/`aria-describedby`, nota LGPD e 4 estados já validados para o mesmo público; reaproveitar evita divergência de tom e acessibilidade. O bloco institucional usa `getContactInfo()` (mesma fonte da página Sobre).
Alternativas consideradas: formulário do zero com outro padrão (rejeitado: duplica esforço e arrisca divergência).

### 4. Página como client component com `Header`/`Footer`/`BookingModal` (padrão `AboutPage`/`QuotePage`)

Rationale: o `Header` (client) exige handler de agendamento; server quebraria a serialização — aprendizado dos changes anteriores. O formulário é estado local efêmero.
Alternativas consideradas: server component puro (rejeitado: CTA do header morto).

### 5. Sem cap de tamanho na mensagem (mock), sem número real novo

Rationale: impor limite seria inventar regra de produto fora do aceite; mensagem longa é tratada como texto opaco (teste de resiliência, como em `pagina-orcamento`); cap de verdade pertence ao backend futuro. Nenhum dado real de contato entra em mocks, testes ou exemplos (docs/03 §11).
Alternativas consideradas: limite arbitrário no mock (rejeitado: regra inventada).

## Risks / Trade-offs

- [Risco] Ambiguidade do campo flexível ("é e-mail ou WhatsApp?") confundir a paciente → Mitigação: label e placeholder mostram os dois formatos com exemplo ("E-mail ou WhatsApp com DDD"); mensagem de erro única cita ambos.
- [Risco] OWASP sem testing-library para testar renderização → Mitigação: mesma do orçamento — validação+texto-opaco no nível `lib/` + grep de `innerHTML`/`dangerouslySetInnerHTML` + scenario na spec; lacuna de renderer registrada.
- [Risco] Página nova sem item no header repetir o debate do orçamento → Mitigação: fora do escopo mínimo (decisão reversível no apply); descoberta via navegação direta/rodapé futuro, como em `/orcamento`.
- [Trade-off] Terceiro formulário mockado (booking, quote, contact) com lógica espelhada — aceitável por YAGNI agora; extração de helper compartilhado só se um quarto surgir ou se a revisão do apply exigir (Cerca de Chesterton: o padrão espelhado foi escolha consciente e revisada).

## Migration Plan

Sem migração: arquivos novos + 1 doc atualizado (novo UC 1.8.2). Rollback = reverter o change. A troca futura mock → API real ocorre na camada `lib/` (contrato já nomeado), fora deste change.

## Open Questions

Nenhuma que mude spec, abordagem ou tasks. Copy fina (ex.: texto da confirmação) segue o padrão do orçamento e é ajustável na validação com a Fabiana sem mudar comportamento.
