## MODIFIED Requirements

### Requirement: Header com navegação e drawer mobile

O header SHALL ser sticky com blur, conter logo + tagline (logo liga para `/`), navegação desktop com links reais — Tratamentos para `/tratamentos`, A Clínica para `/sobre`, Resultados para `/antes-depois`, Depoimentos para `/depoimentos`, e Diferenciais como `/#diferenciais` — ação WhatsApp fantasma + CTA primário de Agendar + CTA fantasma "Pedir Orçamento" para `/orcamento`, e no mobile um botão hamburger que abre/fecha um drawer com os mesmos links e ações (incluindo o CTA de Orçamento); o drawer SHALL ser operável por teclado e expor estado via `aria-expanded`; links internos SHALL usar `next/link`.

#### Scenario: Navegação mobile por teclado

- **WHEN** uma visitante navega só pelo teclado no celular
- **THEN** ela abre o menu, percorre todos os links e o fecha, com o estado anunciado corretamente

#### Scenario: Navegar a partir de outra página

- **WHEN** a visitante está em `/tratamentos` e aciona Diferenciais
- **THEN** ela chega à seção de diferenciais da home (`/#diferenciais`)

#### Scenario: Rotas reais no menu

- **WHEN** a visitante aciona Tratamentos, A Clínica, Resultados ou Depoimentos de qualquer página
- **THEN** ela chega a `/tratamentos`, `/sobre`, `/antes-depois` ou `/depoimentos`, sem digitar URL

#### Scenario: Diferenciais continua âncora da home

- **WHEN** a visitante aciona Diferenciais de qualquer página
- **THEN** ela chega à seção de diferenciais da home (`/#diferenciais`), não a uma rota própria

#### Scenario: Orçamento acessível do menu

- **WHEN** a visitante aciona Pedir Orçamento no header (desktop) ou no drawer (mobile), de qualquer página
- **THEN** ela chega a `/orcamento`, sem digitar URL

### Requirement: Diferenciais, depoimentos, CTA final e rodapé no padrão do protótipo

Os diferenciais SHALL ser 4 cards numerados; depoimentos SHALL trazer avaliação por estrelas, citação e avatar de iniciais (fictícios) — além de link "Ver todos os depoimentos" para `/depoimentos`; o CTA final SHALL ser um painel `primary-soft` com as duas ações; o rodapé SHALL ter 4 colunas (marca, navegação, horários, endereço fictício) + linha legal; a coluna de navegação do rodapé SHALL conter os destinos — Tratamentos para `/tratamentos`, Resultados para `/antes-depois`, Depoimentos para `/depoimentos`, Diferenciais como `/#diferenciais`, Blog para `/blog` e Contato para `/contato` — e os links internos do rodapé SHALL usar `next/link`.

#### Scenario: Leitura do rodapé

- **WHEN** a paciente chega ao rodapé
- **THEN** encontra navegação, horários e endereço claramente separados, sem dados reais

#### Scenario: Ver todos os depoimentos

- **WHEN** a visitante aciona "Ver todos os depoimentos" na seção
- **THEN** ela chega a `/depoimentos`

#### Scenario: Navegação do rodapé a partir de outra página

- **WHEN** a visitante está em `/depoimentos` e aciona Resultados no rodapé
- **THEN** ela chega a `/antes-depois`

#### Scenario: Diferenciais do rodapé continua âncora da home

- **WHEN** a visitante aciona Diferenciais no rodapé de qualquer página
- **THEN** ela chega à seção de diferenciais da home (`/#diferenciais`), não a uma rota própria

#### Scenario: Blog e Contato no rodapé

- **WHEN** a visitante aciona Blog ou Contato no rodapé, de qualquer página
- **THEN** ela chega a `/blog` ou `/contato`, sem digitar URL
