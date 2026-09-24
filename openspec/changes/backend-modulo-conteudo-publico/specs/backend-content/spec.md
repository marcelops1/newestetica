## Purpose

Dá ao site público uma fonte real para depoimentos, posts do blog e casos de antes/depois: leitura pública no formato dos contratos vigentes, com a regra central de que nada sem consentimento é servido publicamente, pronta para o Épico 5 consumir.

## ADDED Requirements

### Requirement: Listagem pública de depoimentos

A API SHALL expor a listagem pública de depoimentos no formato do contrato vigente; todo item da base é público por desenho do contrato (sem flag de visibilidade).

#### Scenario: Base com depoimentos lista todos

- **WHEN** a listagem pública de depoimentos é consultada existindo itens na base
- **THEN** a resposta contém exatamente esses itens, cada um no formato do contrato

### Requirement: Listagem pública de posts do blog

A API SHALL expor a listagem pública de posts no formato do contrato vigente.

#### Scenario: Base com posts lista todos

- **WHEN** a listagem pública de posts é consultada existindo itens na base
- **THEN** a resposta contém exatamente esses itens, cada um no formato do contrato

### Requirement: Detalhe de post por slug

A API SHALL expor a leitura de um post pelo seu slug; slug inexistente SHALL responder não-encontrado, sem distinguir motivos.

#### Scenario: Slug existente retorna o post

- **WHEN** um slug de post existente é consultado
- **THEN** a resposta contém aquele post com todos os campos do contrato

#### Scenario: Slug inexistente responde não-encontrado

- **WHEN** um slug inexistente é consultado
- **THEN** a resposta é não-encontrado

### Requirement: Antes/depois público somente com consentimento explícito

A listagem pública de antes/depois SHALL conter somente casos com consentimento explícito; caso sem consentimento SHALL nunca aparecer na resposta, mesmo existindo na base — "nada sem consentimento é servido publicamente" (UC 4.2.7, `docs/security/03-seguranca.md` §5).

#### Scenario: Base com e sem consentimento lista só os consentidos

- **WHEN** a listagem pública é consultada existindo casos com e sem consentimento
- **THEN** a resposta contém exatamente os casos com consentimento explícito

#### Scenario: Sem consentidos, resposta vazia

- **WHEN** a listagem pública é consultada sem nenhum caso com consentimento
- **THEN** a resposta é uma lista vazia, sem erro

#### Scenario: Saída valida contra o contrato público

- **WHEN** qualquer item da resposta é validado contra o contrato público
- **THEN** o consentimento é literalmente verdadeiro em todos os itens

### Requirement: Saída conforme o contrato publicado

Toda resposta de leitura do conteúdo SHALL ser compatível com os schemas de `contracts/src/content/`; divergência entre implementação e contrato reprova.

#### Scenario: Listagens e detalhe validam contra o contrato

- **WHEN** qualquer resposta de leitura do conteúdo é validada contra o contrato
- **THEN** a validação aprova em todos os campos

### Requirement: Escopo limitado à leitura pública

Este change SHALL entregar somente leitura pública; criação, edição e desativação de conteúdo (admin), submissões de contato/orçamento e quiz ficam fora e nascem em changes futuros (escrita com autenticação).

#### Scenario: Auditoria de escopo

- **WHEN** a superfície HTTP do módulo é auditada
- **THEN** não existe rota de escrita, e nenhuma rota exige autenticação além do que o UC prevê (leitura pública livre)
