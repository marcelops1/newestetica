# Change: pagina-contato

## Why

A paciente que prefere escrever antes de falar (dúvida pontual, vergonha de ligar, fora do horário) não tem onde deixar uma mensagem pelo site: o UC 1.8.1 cobre só links de WhatsApp, e o site perde contatos que não querem chamar direto. A página de Contato fecha a tríade de entrada da paciente (agendar, pedir orçamento, falar com a clínica) no mesmo padrão mockado já validado em `pagina-orcamento` (revisão sem ressalvas bloqueantes, 100% de cobertura).

## What Changes

- Nova rota pública `/contato` (`frontend/app/contato/page.tsx` + `frontend/features/contact/ContactPage.tsx`) com formulário simples mobile-first: nome, contato flexível (um campo aceitando e-mail OU WhatsApp, validado para ambos), mensagem — reaproveitando padrão visual e de validação de `QuotePage`/`BookingModal` (mensagens acolhedoras em português, `aria-invalid`/`aria-describedby`, áreas de toque 44x44px, nota LGPD).
- Bloco institucional na mesma página (endereço e horário fictícios, padrão de dado fictício já usado em Sobre via `getContactInfo()`), sem número/link real novo — os links de WhatsApp existentes (UC 1.8.1) seguem intocados.
- Nova função `submitContactRequest` em `frontend/lib/contact.ts` espelhando `submitQuoteRequest` (`frontend/lib/quote.ts`): 100% mockada, sem rede real, com sucesso e erro forçável (`forceError`), mensagem de erro acolhedora sem culpa, dados preservados para nova tentativa.
- Confirmação visual acolhedora de recebimento (4 estados: ocioso, enviando, sucesso, erro), sem prometer prazo fechado de retorno além do tom já usado ("sem pressa").
- Testes por prioridade (docs/07 §13) no mesmo rigor de `pagina-orcamento`: unitários com edge cases da função de submissão/validação (incl. as duas faces do campo flexível), testes de segurança OWASP (escaping/validação contra injeção e XSS — gatilho docs/07 §7, entrada de usuário real), testes de contrato/schema do payload (fronteira UI ↔ função mockada, com desenho apoiado na skill `api-and-interface-design`), e integração do fluxo crítico (preencher → enviar → confirmação).
- Sem backend, sem dado real de paciente, sem número real novo.
- Atualiza `docs/product/08-backlog-produto.md` (novo UC 1.8.2 "Enviar mensagem pelo site" sob a Feature 1.8; UC 1.8.1 intocado — decisão de escopo confirmada com o solicitante) no mesmo change.

## Capabilities

### New Capabilities

- Nenhuma (página nova dentro de capabilities existentes).

### Modified Capabilities

- `public-site-structure`: ADDED — página `/contato` com formulário de mensagem mockada, confirmação acolhedora e bloco institucional fictício; MODIFIED — nenhuma seção existente muda comportamento.

## Impact

- Arquivos novos: `app/contato/page.tsx`, `features/contact/ContactPage.tsx` (ou equivalente reaproveitando componentes de formulário existentes), `lib/contact.ts` (+ testes).
- Arquivos alterados: `docs/product/08-backlog-produto.md` (novo UC 1.8.2; nenhum outro Use Case alterado).
- Nenhum contrato de backend, nenhum tipo compartilhado e nenhum mock existente alterado; `getContactInfo()` continua a fonte do bloco institucional.
