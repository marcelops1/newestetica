## ADDED Requirements

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
