## ADDED Requirements

### Requirement: Página Orçamento com formulário simples

A rota `/orcamento` SHALL exibir formulário público mobile-first com campos nome, WhatsApp, procedimento de interesse via select alimentado pelos mocks existentes e mensagem opcional; a página SHALL usar tom acolhedor, caloroso e empático, sem promessas milagrosas, sem urgência artificial e sem prometer valores fechados — a solicitação é registrada para retorno da clínica; corpo de texto SHALL ter ao menos 16px e áreas de toque ao menos 44x44px; nenhum dado real de paciente SHALL aparecer; sem backend.

#### Scenario: Solicitar orçamento pelo celular

- **WHEN** a paciente abre `/orcamento` no celular e preenche nome, WhatsApp, procedimento e mensagem opcional
- **THEN** ela entende o que informar em cada campo e envia a solicitação sozinha, sem pressão comercial e sem valores enganosos

#### Scenario: Select reflete o catálogo mockado

- **WHEN** a paciente abre o select de procedimento de interesse
- **THEN** vê as opções vindas dos mocks existentes, com um padrão acolhedor quando nada combina

#### Scenario: Sem promessa de valor fechado

- **WHEN** a paciente lê a página e a confirmação
- **THEN** nenhum texto promete preço fechado; a mensagem informa que a clínica retornará com o orçamento personalizado

### Requirement: Envio mockado com confirmação acolhedora

O envio da solicitação SHALL ser 100% mockado, sem nenhuma chamada de rede e sem persistência; o fluxo SHALL ter quatro estados explícitos — formulário (ocioso), enviando (feedback visível, envio bloqueado contra duplo clique), sucesso (confirmação visual acolhedora de recebimento) e erro simulado forçável (mensagem acolhedora sem culpa, dados preservados, nova tentativa); a nota de proteção de dados (LGPD) SHALL acompanhar o formulário.

#### Scenario: Envio bem-sucedido confirma recebimento

- **WHEN** a paciente envia o formulário válido
- **THEN** ela vê estado de envio e em seguida confirmação acolhedora de que a solicitação foi recebida, sem que nenhum dado saia do navegador

#### Scenario: Erro simulado permite nova tentativa

- **WHEN** o envio mockado falha
- **THEN** a paciente vê mensagem acolhedora sem culpa, os dados digitados são preservados e ela pode tentar de novo

#### Scenario: Nenhuma chamada de rede

- **WHEN** a solicitação é enviada em qualquer estado
- **THEN** nenhum fetch/XHR é disparado e nada é persistido fora da memória da sessão

### Requirement: Validação amigável e segurança de entrada

Os campos SHALL ter validação amigável em português com mensagens por campo ligadas via `aria-describedby` e `aria-invalid`, sem depender só da validação nativa; nome SHALL exigir ao menos 2 caracteres; WhatsApp SHALL exigir ao menos 10 dígitos; o texto livre (nome e mensagem) SHALL ser tratado como texto em toda renderização e submissão — nunca como HTML cru — com escaping garantido contra XSS; a função de submissão mockada SHALL validar o schema do payload na fronteira UI ↔ lib (contrato nomeado, desenhado com apoio da skill `api-and-interface-design`) e rejeitar payload malformado com erro acolhedor, sem vazar detalhes internos.

#### Scenario: Campo inválido orienta com carinho

- **WHEN** a paciente tenta enviar com nome vazio ou WhatsApp inválido
- **THEN** cada campo mostra mensagem em português explicando como corrigir, ligada ao campo para leitor de tela, e nada é enviado

#### Scenario: Texto de marcação nunca vira HTML

- **WHEN** nome ou mensagem contém caracteres de marcação (`<`, `>`, `&`, aspas) ou tentativa de script
- **THEN** o conteúdo é tratado e exibido como texto literal, sem execução ou interpretação de HTML

#### Scenario: Payload malformado é rejeitado no contrato

- **WHEN** a fronteira UI ↔ submissão recebe payload fora do schema (campo ausente, tipo errado, procedimento desconhecido)
- **THEN** a submissão retorna erro acolhedor sem expor detalhes internos e sem chamada de rede
