## ADDED Requirements

> Em camada sobre o delta de `public-site-structure` do change `frontend-foundation-mocks` (arquivar a fundação primeiro).

### Requirement: Hero em duas colunas conforme o protótipo

O hero SHALL ter layout em duas colunas no desktop (conteúdo + card visual) empilhando no mobile, contendo: badge `primary-soft` com indicador, título display com acento itálico em `primary`, subtítulo, grupo de CTA primário + fantasma, linha de 3 métricas e card visual com card flutuante de confiança.

#### Scenario: Hero no desktop

- **WHEN** a paciente abre a home em tela larga
- **THEN** texto à esquerda e card visual à direita aparecem lado a lado, com o card flutuante sobreposto

#### Scenario: Hero no celular

- **WHEN** a paciente abre a home no celular
- **THEN** os blocos empilham em coluna única legível, com o card flutuante adaptado ou oculto sem quebrar o layout

### Requirement: Header com navegação e drawer mobile

O header SHALL ser sticky com blur, conter logo + tagline, navegação desktop (Tratamentos, Diferenciais, Resultados, Depoimentos, A Clínica), ação WhatsApp fantasma + CTA primário, e no mobile um botão hamburger que abre/fecha um drawer com os mesmos links e ações; o drawer SHALL ser operável por teclado e expor estado via `aria-expanded`.

#### Scenario: Navegação mobile por teclado

- **WHEN** uma visitante navega só pelo teclado no celular
- **THEN** ela abre o menu, percorre todos os links e o fecha, com o estado anunciado corretamente

### Requirement: Quiz com objetivos e recomendação

A seção simulador SHALL exibir 4 objetivos selecionáveis e, ao escolher um, revelar a caixa de recomendação com protocolo indicado e CTA, tudo com dados mockados.

#### Scenario: Escolha de objetivo

- **WHEN** a paciente seleciona um objetivo
- **THEN** a opção ativa é destacada e a recomendação correspondente aparece com CTA

### Requirement: Tratamentos com filtros por categoria

A seção de tratamentos SHALL exibir abas de filtro (Todos + categorias dos mocks) que filtram os cards sem recarregar, com a aba ativa em `primary` e as demais fantasmas; cada card SHALL mostrar categoria, duração, nome, descrição e ação de agendar.

#### Scenario: Filtragem por categoria

- **WHEN** a paciente escolhe uma categoria
- **THEN** somente os cards da categoria permanecem visíveis e a aba ativa é indicada visualmente e por `aria-pressed`

### Requirement: Resultados com consentimento e comparador

A seção de resultados SHALL exibir o badge de consentimento explícito, um comparador antes/depois operável por mouse, toque e teclado sobre blocos locais (sem fotos externas), e o painel do caso (sessões, recuperação, objetivo) com CTA — somente para itens com consentimento.

#### Scenario: Comparador por teclado

- **WHEN** a visitante move o comparador pelo teclado
- **THEN** a divisão antes/depois acompanha entre 5% e 95% com o valor exposto via `aria-valuenow`

#### Scenario: Caso sem consentimento

- **WHEN** um caso mockado está sem consentimento
- **THEN** nada dele é renderizado na seção

### Requirement: Diferenciais, depoimentos, CTA final e rodapé no padrão do protótipo

Os diferenciais SHALL ser 4 cards numerados; depoimentos SHALL trazer avaliação por estrelas, citação e avatar de iniciais (fictícios); o CTA final SHALL ser um painel `primary-soft` com as duas ações; o rodapé SHALL ter 4 colunas (marca, navegação, horários, endereço fictício) + linha legal.

#### Scenario: Leitura do rodapé

- **WHEN** a paciente chega ao rodapé
- **THEN** encontra navegação, horários e endereço claramente separados, sem dados reais

### Requirement: Modal de agendamento mockado

Os CTAs de agendamento SHALL abrir o modal do protótipo (nome, WhatsApp, tratamento de interesse pré-selecionado, mensagem opcional, nota LGPD); o envio SHALL ser 100% mockado exibindo o estado de sucesso, sem nenhuma chamada de rede; o modal SHALL fechar por botão, overlay e tecla Escape, com foco gerenciado.

#### Scenario: Solicitação de agendamento

- **WHEN** a paciente preenche e envia o formulário
- **THEN** ela vê a confirmação de recebimento sem que nenhum dado saia do navegador

#### Scenario: Fechamento por Escape

- **WHEN** o modal está aberto e a tecla Escape é pressionada
- **THEN** o modal fecha e o foco retorna ao elemento que o abriu
