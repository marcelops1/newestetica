## ADDED Requirements

### Requirement: Página Blog com busca e filtro

A rota `/blog` SHALL listar todos os artigos dos mocks (título, resumo, categoria, data fictícia) com busca client-side por título/resumo e filtro por categoria (abas derivadas dos mocks, `aria-pressed`), sem recarregar; o texto digitado na busca SHALL ser tratado como texto em toda renderização — nunca como HTML cru; lista vazia SHALL mostrar mensagem acolhedora, sem tela fria; página mobile-first em tom acolhedor e educativo, sem alarmismo e sem promessas milagrosas; sem backend e sem dado real.

#### Scenario: Busca por título ou resumo

- **WHEN** a paciente digita parte do título ou do resumo de um artigo
- **THEN** somente os coincidentes permanecem (busca tolerante a acentos e caixa), com mensagem acolhedora se vazio

#### Scenario: Filtro por categoria

- **WHEN** a paciente escolhe uma categoria
- **THEN** somente os artigos da categoria permanecem visíveis e a aba ativa é indicada visualmente e por `aria-pressed`

#### Scenario: Texto de marcação na busca nunca vira HTML

- **WHEN** a busca contém caracteres de marcação (`<`, `>`, `&`, aspas)
- **THEN** o texto é tratado como texto literal em todo o fluxo (campo, filtragem e mensagem de vazio), sem execução ou interpretação de HTML

### Requirement: Detalhe do artigo por slug

A rota `/blog/[slug]` SHALL exibir categoria, título, data fictícia e conteúdo completo do artigo (parágrafos como texto), link de volta ao blog e CTA de agendar; slug inexistente SHALL mostrar página de não-encontrado acolhedora, sem erro técnico; conteúdo SHALL ser educativo e tranquilizador, nunca alarmista sobre procedimentos.

#### Scenario: Leitura de um artigo

- **WHEN** a paciente abre um artigo da lista no celular
- **THEN** lê categoria, título, data e parágrafos com legibilidade (corpo 16px+) e encontra caminho de volta e CTA sem rolagem excessiva

#### Scenario: Slug inválido

- **WHEN** a paciente abre um slug inexistente
- **THEN** ela vê mensagem acolhedora com caminho de volta ao blog, sem erro técnico

### Requirement: Agendar a partir do blog

O CTA de agendar (detalhe do artigo) SHALL abrir o `BookingModal` existente, mantendo os 4 estados e o envio mockado.

#### Scenario: Agendar do artigo

- **WHEN** a paciente agenda a partir da página de um artigo
- **THEN** o modal abre com pré-seleção padrão ("Avaliação Geral")
