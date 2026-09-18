## MODIFIED Requirements

### Requirement: Header com navegação e drawer mobile

O header SHALL ser sticky com blur, conter logo + tagline (logo liga para `/`), navegação desktop com links reais — Tratamentos para `/tratamentos`, A Clínica para `/sobre`, Resultados para `/antes-depois`, Depoimentos para `/depoimentos`, e Diferenciais como `/#diferenciais` — ação WhatsApp fantasma + CTA primário, e no mobile um botão hamburger que abre/fecha um drawer com os mesmos links e ações; o drawer SHALL ser operável por teclado e expor estado via `aria-expanded`; links internos SHALL usar `next/link`.

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
