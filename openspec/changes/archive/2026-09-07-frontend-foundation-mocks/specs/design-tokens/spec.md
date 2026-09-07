## Purpose

Centraliza os tokens visuais do Design System aprovado para garantir consistência, legibilidade e conforto do público 40+ em todas as telas.

## ADDED Requirements

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
