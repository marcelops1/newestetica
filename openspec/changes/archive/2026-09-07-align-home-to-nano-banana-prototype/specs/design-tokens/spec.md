## ADDED Requirements

> Em camada sobre o delta de `design-tokens` do change `frontend-foundation-mocks` (arquivar a fundação primeiro).

### Requirement: CTA primário usa primary do protótipo

Todo CTA primário da home SHALL usar fundo `primary` com hover em `primary-hover` e texto branco, conforme o protótipo aprovado — nunca preto/`ink` onde o protótipo usa taupe.

#### Scenario: Botão Agendar no header

- **WHEN** a paciente vê o header em qualquer viewport
- **THEN** o botão "Agendar avaliação" tem fundo taupe (`primary`) e escurece no hover

### Requirement: CTA secundário fantasma com borda

CTAs secundários SHALL usar fundo `surface`, texto `ink-secondary` e borda `border`, com hover que aproxima de `primary` (borda `primary`/fundo `primary-soft`), conforme o protótipo.

#### Scenario: Botão Conhecer Tratamentos

- **WHEN** a paciente vê o hero
- **THEN** a ação secundária é visualmente mais leve que a primária, sem competir com ela

### Requirement: Superfícies de destaque em primary-soft

Painéis de destaque (badge do hero, painel do CTA final, caixa de recomendação do quiz, avatar de iniciais) SHALL usar fundos `primary-soft` com texto em `primary-hover` ou `ink`, nunca cores fora da paleta.

#### Scenario: Auditoria de cor da home

- **WHEN** qualquer elemento da home é inspecionado
- **THEN** sua cor pertence aos tokens aprovados; não há preto sólido, neon ou rosa choque

### Requirement: Exceção documentada ao AA em botões primary

Texto branco semibold sobre fundo `primary` em botões (padrão exato do protótipo aprovado) SHALL ser aceito como exceção à regra AA, com mitigação obrigatória: hover em `primary-hover`, peso semibold ou superior e tamanho mínimo 14px; nenhum outro texto sobre `primary` é permitido.

#### Scenario: Revisão de contraste de botão

- **WHEN** um botão primário é revisado
- **THEN** ele usa `primary`/`primary-hover`, é semibold com ao menos 14px e o hover escurece o fundo
