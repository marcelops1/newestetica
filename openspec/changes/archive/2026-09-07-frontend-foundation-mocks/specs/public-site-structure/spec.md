## Purpose

Define a estrutura das seções do site público conforme o protótipo visual aprovado, garantindo acolhimento imediato e experiência mobile-first para mulheres de 40 a 60 anos.

## ADDED Requirements

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
