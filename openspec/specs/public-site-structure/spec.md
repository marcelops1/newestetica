# public-site-structure Specification

## Purpose

Define a estrutura das seções do site público conforme o protótipo visual aprovado, garantindo acolhimento imediato e experiência mobile-first para mulheres de 40 a 60 anos.

## Requirements

### Requirement: Nove seções do protótipo aprovado

O site público SHALL conter, nesta ordem, Header, Hero, Simulador/quiz de objetivos, Tratamentos (com filtros), Resultados (antes/depois + consentimento), Diferenciais, Depoimentos, CTA final de agendamento e Footer, conforme `docs/06-design-system.md`.

#### Scenario: Navegação completa no mobile

- **WHEN** uma paciente percorre a página inicial do topo ao rodapé no celular
- **THEN** todas as nove seções aparecem na ordem aprovada, sem quebra de layout

### Requirement: Mobile-first com ações alcançáveis

Todas as seções SHALL nascer desenhadas para mobile, com áreas de toque de ao menos 44x44px, uma ação principal por tela nos fluxos e feedback claro em cada etapa.

#### Scenario: Agendamento pelo celular sem ajuda

- **WHEN** uma paciente agenda um horário sozinha pelo celular
- **THEN** ela conclui o fluxo sem ajuda, com confirmação visível ao final

### Requirement: Tom acolhedor sem pressão

Todos os textos do site SHALL usar tom acolhedor, caloroso e empático, sem promessas milagrosas, sem infantilização e sem urgência artificial (contadores, pressão comercial), conforme `docs/01-persona-e-ux-40+.md`.

#### Scenario: Revisão de microcopy

- **WHEN** um texto novo entra no site
- **THEN** ele não contém promessa de transformação radical nem gatilho de urgência

### Requirement: Prova social com consentimento visível

Depoimentos e fotos de antes/depois SHALL exibir somente conteúdo com consentimento registrado, deixando claro para a visitante que houve consentimento.

#### Scenario: Antes/depois sem consentimento

- **WHEN** um resultado não possui consentimento explícito registrado
- **THEN** a foto não é exibida publicamente em nenhuma seção

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

### Requirement: Página de catálogo com filtro e busca

A rota `/tratamentos` SHALL listar todos os procedimentos dos mocks com filtro por categoria (abas derivadas, `aria-pressed`) e busca por nome, sem recarregar.

#### Scenario: Busca por nome

- **WHEN** a paciente digita parte do nome de um procedimento
- **THEN** somente os coincidentes permanecem, com mensagem acolhedora se vazio

#### Scenario: Filtro + busca combinados

- **WHEN** categoria e texto estão ativos juntos
- **THEN** a lista respeita ambos os critérios

### Requirement: Detalhe por procedimento

A rota `/tratamentos/[slug]` SHALL exibir nome, descrição clara (o que é, o que esperar), duração, categoria e CTA de agendar; slug inexistente SHALL mostrar página de não-encontrado acolhedora, sem erro técnico.

#### Scenario: Slug inválido

- **WHEN** a paciente abre um slug inexistente
- **THEN** ela vê mensagem acolhedora com caminho de volta ao catálogo

### Requirement: Agendar a partir do catálogo

O CTA de agendar (lista e detalhe) SHALL abrir o `BookingModal` existente com o tratamento pré-selecionado via `resolveTreatment`, mantendo os 4 estados e o envio mockado.

#### Scenario: Agendar do detalhe

- **WHEN** a paciente agenda a partir da página de um procedimento
- **THEN** o modal abre com esse tratamento pré-selecionado

### Requirement: Página Sobre institucional

A rota `/sobre` SHALL exibir hero, história da clínica, formação e valores da Fabiana (conteúdo fictício), bloco de confiança e CTA de agendamento, em tom acolhedor e mobile-first.

#### Scenario: Visita à página Sobre

- **WHEN** a paciente abre `/sobre` no celular
- **THEN** lê história, formação e valores com legibilidade (corpo 16px+) e encontra o CTA sem rolagem excessiva

### Requirement: Agendar a partir da Sobre

O CTA da página SHALL abrir o `BookingModal` existente com pré-seleção padrão, mantendo envio mockado.

#### Scenario: Agendar da Sobre

- **WHEN** a paciente aciona agendar na Sobre
- **THEN** o modal abre em "Avaliação Geral"
