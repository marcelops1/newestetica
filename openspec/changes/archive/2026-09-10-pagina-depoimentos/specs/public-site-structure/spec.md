## ADDED Requirements

### Requirement: Página Depoimentos

A rota `/depoimentos` SHALL listar todos os depoimentos dos mocks, cada um com avaliação em estrelas (5 de 5 padrão), citação, avatar de iniciais fictícias e contexto, em layout mobile-first com tom acolhedor; nomes completos reais SHALL NOT aparecer; o texto do mock SHALL ser renderizado como texto (auto-escape), nunca como HTML cru; sem backend e sem dado real de paciente.

#### Scenario: Lista todos os depoimentos

- **WHEN** a paciente abre `/depoimentos` no celular
- **THEN** vê todos os depoimentos fictícios com estrelas, citação e iniciais (nunca nome completo real)

#### Scenario: Texto de marcação nunca vira HTML

- **WHEN** um depoimento mockado contém caracteres de marcação (`<`, `>`, `&`)
- **THEN** ele é renderizado como texto literal, sem execução ou interpretação de HTML

## MODIFIED Requirements

### Requirement: Diferenciais, depoimentos, CTA final e rodapé no padrão do protótipo

Os diferenciais SHALL ser 4 cards numerados; depoimentos SHALL trazer avaliação por estrelas, citação e avatar de iniciais (fictícios) — além de link "Ver todos os depoimentos" para `/depoimentos`; o CTA final SHALL ser um painel `primary-soft` com as duas ações; o rodapé SHALL ter 4 colunas (marca, navegação, horários, endereço fictício) + linha legal.

#### Scenario: Leitura do rodapé

- **WHEN** a paciente chega ao rodapé
- **THEN** encontra navegação, horários e endereço claramente separados, sem dados reais

#### Scenario: Ver todos os depoimentos

- **WHEN** a visitante aciona "Ver todos os depoimentos" na seção
- **THEN** ela chega a `/depoimentos`
