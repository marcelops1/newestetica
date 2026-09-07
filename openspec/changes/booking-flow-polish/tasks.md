## 1. Camada de dados (test-first)

- [x] 1.1 Escrever os testes de `submitBookingRequest()` (sucesso traz o tratamento, erro forçado traz mensagem acolhedora, nenhuma chamada de rede) e verificar que falham sem a implementação
- [x] 1.2 Implementar `submitBookingRequest()` mockada em `lib/` (sucesso padrão, erro forçável, atraso curto, sem rede) e verificar que os testes da task 1.1 passam e `vitest run` fica verde

## 2. Estados do modal (test-first)

- [x] 2.1 Escrever a verificação dos quatro estados (formulário, enviando com duplo clique ignorado, sucesso com resumo, erro com nova tentativa preservando dados) e constatar que ela falha com o modal atual
- [x] 2.2 Implementar os quatro estados no modal e verificar que a verificação da task 2.1 passa
- [x] 2.3 Escrever os casos de verificação da validação amigável (nome vazio e WhatsApp inválido orientam a correção via `aria-invalid`/`aria-describedby`) e constatar que falham com o modal atual
- [x] 2.4 Implementar a validação amigável por campo com mensagens em português e verificar que os casos da task 2.3 passam

## 3. Foco e pré-seleção (test-first)

- [x] 3.1 Escrever a verificação de teclado do focus trap (Tab circula no diálogo, Escape fecha devolvendo o foco) e constatar que ela falha com o modal atual
- [x] 3.2 Implementar o focus trap mantendo Escape, overlay e devolução de foco, e verificar que a verificação da task 3.1 passa
- [ ] 3.3 Escrever a verificação da pré-seleção por origem (card, quiz, caso; padrão "Avaliação Geral") e constatar as lacunas no modal atual
- [ ] 3.4 Explicitar a pré-seleção de tratamento por origem e verificar que cada origem abre o modal com a opção correta

## 4. Verificação

- [ ] 4.1 Rodar todos os quality gates (lint, format, typecheck, testes, build) e verificar que todos passam
- [ ] 4.2 Revisar todos os textos do fluxo contra o tom (acolhedor, sem culpa no erro, sem pressão) e verificar que nenhuma mensagem soa técnica ou apressada
