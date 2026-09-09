## ADDED Requirements

### Requirement: Página Antes e Depois

A rota `/antes-depois` SHALL listar todos os casos de antes/depois com consentimento dos mocks, cada caso com comparador operável (mouse, toque, teclado), badge de consentimento visível, painel (sessões, recuperação, objetivo) e CTA que abre o `BookingModal` com pré-seleção; casos sem consentimento SHALL NOT aparecer; página mobile-first em tom acolhedor, com blocos locais e sem fotos reais.

#### Scenario: Lista só casos com consentimento

- **WHEN** a paciente abre `/antes-depois` no celular
- **THEN** vê um comparador por caso com consentimento, cada um com badge visível, e nenhum caso sem consentimento aparece

#### Scenario: Agendar a partir de um caso

- **WHEN** a paciente aciona agendar num caso da página
- **THEN** o modal abre com esse tratamento pré-selecionado, mantendo envio mockado

## MODIFIED Requirements

### Requirement: Resultados com consentimento e comparador

A seção de resultados SHALL exibir o badge de consentimento explícito, um comparador antes/depois operável por mouse, toque e teclado sobre blocos locais (sem fotos externas), e o painel do caso (sessões, recuperação, objetivo) com CTA — somente para itens com consentimento — além de link "Ver todos os casos" para `/antes-depois`.

#### Scenario: Comparador por teclado

- **WHEN** a visitante move o comparador pelo teclado
- **THEN** a divisão antes/depois acompanha entre 5% e 95% com o valor exposto via `aria-valuenow`

#### Scenario: Caso sem consentimento

- **WHEN** um caso mockado está sem consentimento
- **THEN** nada dele é renderizado na seção

#### Scenario: Ver todos os casos

- **WHEN** a visitante aciona "Ver todos os casos" na seção
- **THEN** ela chega a `/antes-depois`
