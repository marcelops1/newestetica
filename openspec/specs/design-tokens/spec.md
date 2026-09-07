# design-tokens Specification

## Purpose

Centraliza os tokens visuais do Design System aprovado para garantir consistência, legibilidade e conforto do público 40+ em todas as telas.

## Requirements

### Requirement: Tokens centralizados como fonte única

Cores, tipografia, espaçamentos, radius, sombras e bordas SHALL viver em um único local centralizado (tokens de estilo) e nenhum componente SHALL usar valores literais divergentes do Design System (`docs/06-design-system.md`).

#### Scenario: Auditoria de cor fora do padrão

- **WHEN** um componente usa uma cor fora da paleta aprovada
- **THEN** a revisão identifica a divergência porque o token correspondente existe e o valor literal não é permitido

### Requirement: Paleta e tipografia aprovadas

O sistema SHALL aplicar a paleta aprovada (fundo `#FAFAF9`, texto principal `#1C1917`, primary `#9A7B6B` e variações de apoio) e as famílias `Cormorant Garamond` (títulos) e `Inter` (corpo), com corpo mínimo de 16px no mobile e contraste mínimo WCAG AA.

#### Scenario: Leitura confortável no celular

- **WHEN** uma paciente de 40 a 60 anos lê qualquer texto de corpo no celular
- **THEN** o tamanho é de ao menos 16px com contraste AA ou superior

### Requirement: Regras visuais de contenção

O sistema SHALL respeitar as regras do Design System: primary nunca "grita", sem pretos/brancos absolutos em excesso, sombras leves, sem cores neon ou rosa choque, sem animações excessivas.

#### Scenario: Revisão visual da Fabiana

- **WHEN** a Fabiana revisa uma tela nova
- **THEN** o visual é percebido como clean e suave, sem elementos promocionais agressivos

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
