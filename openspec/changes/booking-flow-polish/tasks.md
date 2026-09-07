## 1. Camada de dados e testes

- [ ] 1.1 Criar `submitBookingRequest()` mockada em `lib/` (sucesso padrão, erro forçável, atraso curto, sem rede) e verificar com testes que o sucesso traz o tratamento e o erro forçado traz mensagem acolhedora
- [ ] 1.2 Estender os testes da camada de dados para os novos comportamentos e verificar que `vitest run` passa com os casos de envio

## 2. Modal polido

- [ ] 2.1 Implementar os quatro estados (formulário, enviando, sucesso com resumo, erro com nova tentativa preservando dados) e verificar que cada estado renderiza isolado e o duplo clique é ignorado
- [ ] 2.2 Implementar validação amigável por campo (`aria-invalid`/`aria-describedby`, mensagens em português) e verificar que nome vazio e WhatsApp inválido orientam a correção
- [ ] 2.3 Implementar focus trap (Tab circula no diálogo) mantendo Escape, overlay e devolução de foco, e verificar por teclado que o foco nunca escapa com o modal aberto
- [ ] 2.4 Explicitar a pré-seleção de tratamento por origem (card, quiz, caso) com padrão "Avaliação Geral" e verificar que cada origem abre o modal com a opção correta

## 3. Verificação

- [ ] 3.1 Rodar todos os quality gates (lint, format, typecheck, testes, build) e verificar que todos passam
- [ ] 3.2 Revisar todos os textos do fluxo contra o tom (acolhedor, sem culpa no erro, sem pressão) e verificar que nenhuma mensagem soa técnica ou apressada
