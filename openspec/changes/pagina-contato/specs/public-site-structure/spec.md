## ADDED Requirements

### Requirement: Página Contato com formulário simples e informações institucionais

A rota `/contato` SHALL exibir formulário público mobile-first com campos nome, contato flexível (um campo aceitando e-mail OU WhatsApp) e mensagem, além de bloco institucional com endereço e horário fictícios vindos dos mocks existentes; a página SHALL usar tom acolhedor, caloroso e empático, sem promessas milagrosas, sem urgência artificial e sem prometer retorno em prazo fechado; corpo de texto SHALL ter ao menos 16px e áreas de toque ao menos 44x44px; nenhum dado real de paciente, endereço real ou número real novo SHALL aparecer; sem backend; os links de WhatsApp existentes (UC 1.8.1) SHALL seguir intocados.

#### Scenario: Enviar mensagem pelo celular

- **WHEN** a paciente abre `/contato` no celular e preenche nome, e-mail ou WhatsApp e mensagem
- **THEN** ela entende o que informar em cada campo e envia a mensagem sozinha, sem pressão e sem precisar ligar

#### Scenario: Contato flexível aceita e-mail ou WhatsApp

- **WHEN** a paciente informa um e-mail válido ou um WhatsApp válido no campo de contato
- **THEN** o campo é aceito; com formato inválido em ambos, mensagem acolhedora orienta como corrigir

#### Scenario: Bloco institucional fictício visível

- **WHEN** a paciente percorre a página
- **THEN** encontra endereço e horário claramente fictícios, sem número ou endereço real

### Requirement: Envio mockado de mensagem com confirmação acolhedora

O envio da mensagem SHALL ser 100% mockado, sem nenhuma chamada de rede e sem persistência; o fluxo SHALL ter quatro estados explícitos — formulário (ocioso), enviando (feedback visível, envio bloqueado contra duplo clique), sucesso (confirmação visual acolhedora de recebimento) e erro simulado forçável (mensagem acolhedora sem culpa, dados preservados, nova tentativa); a nota de proteção de dados (LGPD) SHALL acompanhar o formulário.

#### Scenario: Envio bem-sucedido confirma recebimento

- **WHEN** a paciente envia o formulário válido
- **THEN** ela vê estado de envio e em seguida confirmação acolhedora de que a mensagem foi recebida, sem que nenhum dado saia do navegador

#### Scenario: Erro simulado permite nova tentativa

- **WHEN** o envio mockado falha
- **THEN** a paciente vê mensagem acolhedora sem culpa, os dados digitados são preservados e ela pode tentar de novo

#### Scenario: Nenhuma chamada de rede

- **WHEN** a mensagem é enviada em qualquer estado
- **THEN** nenhum fetch/XHR é disparado e nada é persistido fora da memória da sessão

### Requirement: Validação amigável e segurança de entrada no contato

Os campos SHALL ter validação amigável em português com mensagens por campo ligadas via `aria-describedby` e `aria-invalid`, sem depender só da validação nativa; nome SHALL exigir ao menos 2 caracteres; o contato flexível SHALL exigir e-mail válido OU WhatsApp com ao menos 10 dígitos; mensagem SHALL exigir conteúdo não-vazio e ser tratada como texto mesmo quando longa; o texto livre (nome e mensagem) SHALL ser tratado como texto em toda renderização e submissão — nunca como HTML cru — com escaping garantido contra XSS; a função de submissão mockada SHALL validar o schema do payload na fronteira UI ↔ lib (contrato nomeado, desenhado com apoio da skill `api-and-interface-design`) e rejeitar payload malformado com erro acolhedor, sem vazar detalhes internos.

#### Scenario: Campo inválido orienta com carinho

- **WHEN** a paciente tenta enviar com nome vazio, contato inválido ou mensagem vazia
- **THEN** cada campo mostra mensagem em português explicando como corrigir, ligada ao campo para leitor de tela, e nada é enviado

#### Scenario: Texto de marcação nunca vira HTML

- **WHEN** nome ou mensagem contém caracteres de marcação (`<`, `>`, `&`, aspas) ou tentativa de script
- **THEN** o conteúdo é tratado e exibido como texto literal, sem execução ou interpretação de HTML

#### Scenario: Payload malformado é rejeitado no contrato

- **WHEN** a fronteira UI ↔ submissão recebe payload fora do schema (campo ausente, tipo errado, contato fora dos dois formatos)
- **THEN** a submissão retorna erro acolhedor sem expor detalhes internos e sem chamada de rede
