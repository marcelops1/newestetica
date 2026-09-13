## Context

Ver `proposal.md` (Why) e `specs/public-site-structure/spec.md` (WHAT). Ponto de partida: `frontend/lib/booking.ts` (`submitBookingRequest`: sucesso + `forceError`, 100% local, `DEFAULT_TREATMENT`, `resolveTreatment`) com teste em `frontend/lib/__tests__/booking.test.ts` (sucesso, erro acolhedor, sem rede); `frontend/features/booking/BookingModal.tsx` (client, 4 estados, validação nome ≥2 / dígitos ≥10, mensagens acolhedoras, `aria-invalid`/`aria-describedby`, nota LGPD, foco/Escape/focus trap no modal); `getTreatmentOptions()` em `frontend/lib/data.ts` (fonte do select, vinda de `treatmentOptionsMock`); padrão de página validado em `/tratamentos`, `/sobre`, `/depoimentos` (`app/<rota>/page.tsx` + `features/<domínio>/<Page>.tsx`); sem `@testing-library` — testes no nível `lib/` (vitest, node). Restrições: docs/01 (tom, 40+), docs/06 (tokens, formulários), docs/03 (validação, XSS, LGPD, sem dado real), docs/07 §7 (gatilho de segurança: entrada de usuário → revisão `security-and-hardening` obrigatória no Verify) e §13 (tipos de teste por prioridade).

## Goals / Non-Goals

**Goals:**

- Página `/orcamento` com formulário simples e confirmação acolhedora, reaproveitando ao máximo validação e microcopy do `BookingModal`.
- Função de submissão mockada espelhando `submitBookingRequest`, com contrato/schema nomeado na fronteira UI ↔ lib.
- Mapeamento explícito dos tipos de teste da seção 13, com task dedicada de OWASP e de contrato/schema.

**Non-Goals:**

- Backend, persistência, e-mail transacional, valores/preços no mock (UC 1.7.1 proíbe prometer valores fechados).
- Novo Design System, novos tokens, mudança no header/nav, mudança nos mocks existentes.
- Validação com a Fabiana neste change (ocorre fora, como nos changes de página anteriores).

## Aplicação da seção 13 (tipos de teste que se aplicam)

| Tipo (docs/07 §13) | Aplica? | Como |
|---|---|---|
| Unitários com edge cases | **Sim (sempre)** | RED-first em `submitQuoteRequest` (sucesso com tratamento, default quando vazio, `forceError` acolhedor, sem rede via spy de `fetch`) + validação (nome curto, WhatsApp curto, mensagem opcional vazia/longa) |
| OWASP | **Sim (sempre — gatilho §7: entrada de usuário real)** | Task dedicada: payloads maliciosos (`<script>`, `<img onerror>`, `&`, aspas) tratados como texto — sem `innerHTML`/`dangerouslySetInnerHTML` (grep) + schema rejeita tipo errado sem vazar detalhes; revisão `security-and-hardening` registrada no Verify contra docs/03 |
| Contrato/schema | **Sim (sempre — fronteira UI ↔ mock)** | Contrato nomeado do payload (`QuoteInput`/`QuoteResult` + validador/schema) desenhado com apoio da skill `api-and-interface-design`; testado RED-first (payload válido passa, malformado retorna erro acolhedor); documenta a futura troca mock → API real |
| Integração de fluxo crítico | **Sim (preencher → enviar → confirmação)** | Estados da página (ocioso/enviando/sucesso/erro com dados preservados) verificados pelos gates disponíveis; limitação registrada: sem testing-library no projeto, clique/fluxo de componente não é simulável — cobertura via teste da lib + build/typecheck + revisão manual no Verify |
| Mutation | Não — dispensado (registrar em verification.md no apply) | Lógica trivial (trim/default/delay mockado), sem negócio sensível |
| Falha e resiliência | **Sim, parcial** | Coberta pelo caso `forceError` (dados preservados, nova tentativa); sem dependência externa além disso |
| E2E | Não (parcimônia) | Jornada de alto valor é agendamento; orçamento ganha E2E só se virar conversão crítica futura |
| Carga | Não (parcimônia) | Sem requisito de performance |

## Decisions

### 1. `frontend/lib/quote.ts` espelhando `booking.ts` (`submitQuoteRequest` + `QuoteInput`/`QuoteResult`)

Rationale: o padrão já é conhecido, testado e aceito (sucesso/erro forçável/sem rede); espelhar reduz risco e mantém a troca futura mock → API isolada na camada `lib/` (docs/02 §6, docs/04 §10). O contrato do payload é desenhado com apoio da skill `api-and-interface-design` (tipos + schema/validador nomeado na fronteira), antecipando `contracts/` sem criá-lo agora.
Alternativas consideradas: reutilizar `submitBookingRequest` diretamente (rejeitado: semântica errada — orçamento ≠ agendamento — e acoplaria evoluções distintas); criar chamada real/placeholder de API (rejeitado: viola frontend-first, sem backend).

### 2. `features/quote/QuotePage.tsx` reaproveitando microcopy/validação do `BookingModal`

Rationale: validação (nome ≥2, WhatsApp ≥10 dígitos), mensagens acolhedoras, `aria-invalid`/`aria-describedby`, nota LGPD e 4 estados já foram validados para o mesmo público 40+; reaproveitar evita divergência de tom e de acessibilidade. Componentes de formulário do Design System (Input/Select/Textarea/Button, docs/06 §8) são usados quando existirem; senão, as classes do modal são a referência.
Alternativas consideradas: formulário do zero com outro padrão (rejeitado: duplica esforço e arrisca tom divergente).

### 3. Página como client component com `Header`/`Footer` (padrão `AboutPage`/`CatalogPage`)

Rationale: o `Header` (client) exige handler de agendamento; página server quebraria a serialização — aprendizado registrado no change `pagina-depoimentos`. O formulário de orçamento é estado local efêmero (não precisa de server action nesta fase mockada).
Alternativas consideradas: server component puro (rejeitado: CTA do header morto).

### 4. Select alimentado por `getTreatmentOptions()`, sem alterar mocks

Rationale: o escopo manda "via select com os mocks existentes"; alterar `treatmentOptionsMock` seria escopo desnecessário. `resolveTreatment`-like com default acolhedor cobre opção desconhecida.
Alternativas consideradas: estender mocks (rejeitado: YAGNI).

### 5. Sem valores no mock, sem promessa de preço

Rationale: aceite do UC 1.7.1 ("sem prometer valores fechados") + medo de preço em docs/00 (transparência sem armadilha). A confirmação fala em "retorno da clínica", nunca em cifra.
Alternativas consideradas: faixa de preço ilustrativa (rejeitado: valor enganoso, fora do aceite).

## Risks / Trade-offs

- [Risco] Duplicação booking ↔ quote divergir no futuro → Mitigação: contrato/schema nomeado e documentado; evolução para helper compartilhado só se um terceiro formulário surgir (YAGNI agora).
- [Risco] OWASP com "sempre exigir" mas sem testing-library para testar renderização → Mitigação: validação+escaping testados no nível `lib/` + grep de `innerHTML`/`dangerouslySetInnerHTML` + scenario na spec; lacuna de renderer registrada como no change de depoimentos.
- [Risco] Entrada de usuário real sem backend pode gerar falsa sensação de persistência → Mitigação: microcopy e nota LGPD deixam claro que é solicitação para retorno (padrão do booking: "demonstração com dados mockados" adaptado sem jargão técnico para a paciente).
- [Trade-off] Página nova sem item no header — descoberta via CTA/link existente; adicionar ao header seria mudança de navegação global fora do escopo mínimo (decisão reversível no apply se a revisão pedir).

## Migration Plan

Sem migração: arquivos novos + 1 doc atualizado. Rollback = reverter o change. A troca futura mock → API real ocorre na camada `lib/` (contrato já nomeado), fora deste change.

## Open Questions

Nenhuma que mude spec, abordagem ou tasks. Dúvidas de copy fina (ex.: prazo de retorno na confirmação) seguem o padrão do booking ("em até 2 horas úteis") e são ajustáveis na validação com a Fabiana sem mudar comportamento.
