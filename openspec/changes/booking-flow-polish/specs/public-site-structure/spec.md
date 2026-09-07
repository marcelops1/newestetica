## MODIFIED Requirements

### Requirement: Modal de agendamento mockado

Os CTAs de agendamento SHALL abrir o modal do protótipo (nome, WhatsApp, tratamento de interesse pré-selecionado, mensagem opcional, nota LGPD); o envio SHALL ser 100% mockado, sem nenhuma chamada de rede; o modal SHALL fechar por botão, overlay e tecla Escape, com foco gerenciado e contenção de foco (Tab não escapa do diálogo).

O fluxo SHALL ter quatro estados explícitos: formulário (ocioso), enviando (feedback visível, envio bloqueado contra duplo clique), sucesso (confirmação + resumo do pedido) e erro simulado (mensagem acolhedora + nova tentativa, sem culpa).

Os campos SHALL ter validação amigável em português com mensagens por campo ligadas via `aria-describedby` e `aria-invalid`, sem depender só da validação nativa do navegador.

A pré-seleção de tratamento SHALL refletir a origem (card de tratamento, protocolo do quiz ou caso de resultados), com "Avaliação Geral" como padrão.

#### Scenario: Solicitação de agendamento

- **WHEN** a paciente preenche e envia o formulário
- **THEN** ela vê o estado de envio e em seguida a confirmação de recebimento sem que nenhum dado saia do navegador

#### Scenario: Fechamento por Escape

- **WHEN** o modal está aberto e a tecla Escape é pressionada
- **THEN** o modal fecha e o foco retorna ao elemento que o abriu

#### Scenario: Envio mostra estado e evita duplo clique

- **WHEN** a paciente clica em enviar com o formulário válido
- **THEN** o botão indica envio em andamento e novos cliques são ignorados até a resposta mockada

#### Scenario: Erro simulado permite nova tentativa

- **WHEN** o envio mockado falha
- **THEN** a paciente vê mensagem acolhedora sem culpa, os dados digitados são preservados e ela pode tentar de novo

#### Scenario: Campo inválido orienta com carinho

- **WHEN** a paciente tenta enviar com nome vazio ou WhatsApp inválido
- **THEN** cada campo mostra mensagem em português explicando como corrigir, ligada ao campo para leitor de tela

#### Scenario: Foco contido no diálogo

- **WHEN** a paciente navega com Tab dentro do modal aberto
- **THEN** o foco circula apenas entre os elementos do diálogo até ele fechar

#### Scenario: Sucesso resume o pedido

- **WHEN** o envio mockado tem sucesso
- **THEN** a confirmação mostra o tratamento solicitado e o prazo de retorno via WhatsApp
