# Change: pagina-orcamento

## Why

O Use Case 1.7.1 (Orçamento, Épico 1 — Feature 1.7) está "Não iniciado" em `docs/product/08-backlog-produto.md`: a paciente que tem medo de preço sem transparência (docs/00 §2, persona Mariana em docs/01) não tem onde pedir um orçamento personalizado sem pressão comercial. Orçamento é o par natural do agendamento (UC 1.6.1) e segue o mesmo padrão de entrada de dados já validado no `BookingModal`.

## What Changes

- Nova rota pública `/orcamento` (`frontend/app/orcamento/page.tsx` + `frontend/features/quote/QuotePage.tsx`) com formulário simples mobile-first: nome, WhatsApp, procedimento de interesse via select com os mocks existentes (`getTreatmentOptions()`), mensagem opcional — reaproveitando padrão visual e de validação do `BookingModal` (mensagens acolhedoras em português, `aria-invalid`/`aria-describedby`, áreas de toque 44x44px, nota LGPD).
- Nova função `submitQuoteRequest` em `frontend/lib/quote.ts` espelhando `submitBookingRequest` (`frontend/lib/booking.ts`): 100% mockada, sem rede real, com sucesso e erro forçável (`forceError`), mensagem de erro acolhedora sem culpa, dados preservados para nova tentativa.
- Confirmação visual acolhedora de recebimento (4 estados espelhados do booking: ocioso, enviando, sucesso, erro), sem prometer valores fechados — o sistema registra a solicitação para retorno da clínica, conforme aceite do UC 1.7.1.
- Testes por prioridade (docs/07 §13): unitários com edge cases da função de submissão/validação, testes de segurança OWASP (escaping/validação contra injeção e XSS — gatilho docs/07 §7, entrada de usuário real), testes de contrato/schema do payload do formulário (fronteira UI ↔ função mockada, com desenho de contrato apoiado na skill `api-and-interface-design`), e integração do fluxo crítico (preencher → enviar → confirmação).
- Sem backend, sem valores enganosos, sem pressão comercial, sem dado real de paciente.
- Atualiza `docs/product/08-backlog-produto.md` (UC 1.7.1) no mesmo change.

## Capabilities

### New Capabilities

- Nenhuma (página nova dentro de capabilities existentes).

### Modified Capabilities

- `public-site-structure`: ADDED — página `/orcamento` com formulário de solicitação de orçamento mockada e confirmação acolhedora; MODIFIED — nenhuma seção existente muda comportamento.

## Impact

- Arquivos novos: `app/orcamento/page.tsx`, `features/quote/QuotePage.tsx` (ou equivalente reaproveitando componentes de formulário existentes), `lib/quote.ts` (+ teste).
- Arquivos alterados: `docs/product/08-backlog-produto.md` (UC 1.7.1 Não iniciado → Em andamento/Concluído conforme apply).
- Nenhum contrato de backend, nenhum tipo compartilhado e nenhum mock existente alterado; `getTreatmentOptions()` continua a fonte do select.
