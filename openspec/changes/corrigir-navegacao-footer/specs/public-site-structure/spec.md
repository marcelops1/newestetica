## MODIFIED Requirements

### Requirement: Diferenciais, depoimentos, CTA final e rodapé no padrão do protótipo

Os diferenciais SHALL ser 4 cards numerados; depoimentos SHALL trazer avaliação por estrelas, citação e avatar de iniciais (fictícios) — além de link "Ver todos os depoimentos" para `/depoimentos`; o CTA final SHALL ser um painel `primary-soft` com as duas ações; o rodapé SHALL ter 4 colunas (marca, navegação, horários, endereço fictício) + linha legal; a coluna de navegação do rodapé SHALL conter os mesmos destinos canônicos do menu do Header — Tratamentos para `/tratamentos`, Resultados para `/antes-depois`, Depoimentos para `/depoimentos` e Diferenciais como `/#diferenciais` — e os links internos do rodapé SHALL usar `next/link`.

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
