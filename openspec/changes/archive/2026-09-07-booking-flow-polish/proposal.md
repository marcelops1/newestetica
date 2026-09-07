# Change: booking-flow-polish

## Why

O agendamento é a ação principal do site e hoje o modal mockado vai do formulário direto ao sucesso, sem estado de envio, sem erro simulado, sem mensagens de validação amigáveis e sem contenção de foco. Este change pole o fluxo para transmitir a segurança que a paciente de 40–60 anos precisa no momento decisivo, ainda sem backend.

## What Changes

- Estados explícitos do fluxo: formulário (ocioso) → enviando → sucesso, mais erro simulado com nova tentativa.
- Validação amigável em português com mensagens por campo (`aria-invalid`/`aria-describedby`), sem depender só do nativo do navegador.
- Pré-seleção de tratamento mantida e explicitada quando a origem é um card, protocolo do quiz ou caso de resultados.
- Resumo do pedido no estado de sucesso (tratamento escolhido) + contenção de foco no modal (Tab não escapa) mantendo Escape, overlay e devolução de foco.
- Camada de dados ganha `submitBookingRequest()` mockada com resultado determinístico (sucesso por padrão; erro forçável para demonstração e testes), sem nenhuma chamada de rede.
- Tom acolhedor em todas as mensagens, sem pressão nem culpa pelo erro ("tente de novo, sem pressa").
- Explicitamente fora: backend, Keycloak, pagamentos, e-mail/calendário reais, WhatsApp API, painel admin.

## Capabilities

### New Capabilities

- Nenhuma (o fluxo já é coberto pelas capabilities existentes).

### Modified Capabilities

- `public-site-structure`: requirement "Modal de agendamento mockado" — estendido com estados, validação, pré-seleção explícita, resumo no sucesso e focus trap (conteúdo completo atualizado).
- `mock-data`: ADDED "Resultado simulado do envio de agendamento" — `submitBookingRequest()` determinística na camada de dados.

## Impact

- Afeta somente `frontend/features/booking/`, `frontend/lib/` (novo mock + testes) e textos do modal; nada de backend, contratos ou infra.
- Não altera escopo de produto: mesmo fluxo de solicitação de avaliação do MVP, só com UX completa.
- Deltas MODIFIED exigem merge inteligente no archive (preservar cenários existentes).
