# backend-catalog Specification

## Purpose

Dá ao site público uma fonte real para o catálogo de procedimentos: só itens ativos, com filtro por categoria e busca por slug, no formato do contrato já publicado.

## Requirements

### Requirement: Listagem pública só de procedimentos ativos

A listagem pública de procedimentos SHALL conter somente itens ativos; item desativado SHALL nunca aparecer na resposta, mesmo existindo na base.

#### Scenario: Base com ativos e inativos lista só os ativos

- **WHEN** a listagem pública é consultada existindo procedimentos ativos e desativados
- **THEN** a resposta contém exatamente os ativos

#### Scenario: Sem ativos, resposta vazia

- **WHEN** a listagem pública é consultada sem nenhum procedimento ativo
- **THEN** a resposta é uma lista vazia, sem erro

### Requirement: Filtro por categoria

A listagem pública SHALL aceitar filtro por categoria (`facial`, `corporal`, `rejuvenescimento`); com filtro, SHALL retornar somente procedimentos ativos daquela categoria; sem filtro, SHALL retornar todos os ativos.

#### Scenario: Filtragem por categoria válida

- **WHEN** a listagem é consultada com uma categoria válida
- **THEN** todos os itens retornados são ativos e pertencem àquela categoria

#### Scenario: Categoria sem itens ativos

- **WHEN** a listagem é consultada com uma categoria que não tem ativos
- **THEN** a resposta é uma lista vazia

### Requirement: Busca de procedimento por slug

A API SHALL expor a leitura de um procedimento pelo seu slug; slug inexistente ou desativado SHALL responder não-encontrado, sem distinguir os dois casos.

#### Scenario: Slug ativo retorna o procedimento

- **WHEN** um slug de procedimento ativo é consultado
- **THEN** a resposta contém aquele procedimento com todos os campos do contrato

#### Scenario: Slug inexistente ou desativado responde não-encontrado

- **WHEN** um slug inexistente ou de item desativado é consultado
- **THEN** a resposta é não-encontrado, idêntica nos dois casos

### Requirement: Saída conforme o contrato publicado

Toda resposta de leitura do catálogo SHALL ser compatível com os schemas de `contracts/src/catalog/`; divergência entre implementação e contrato reprova.

#### Scenario: Listagem e detalhe validam contra o contrato

- **WHEN** qualquer resposta de leitura do catálogo é validada contra o contrato
- **THEN** a validação aprova em todos os campos

### Requirement: Escopo limitado à leitura pública

Este change SHALL entregar somente leitura pública; criação, edição e desativação de procedimentos (admin) ficam fora e nascem em change futuro com autenticação.

#### Scenario: Auditoria de escopo

- **WHEN** a superfície HTTP do módulo é auditada
- **THEN** não existe rota de escrita, e nenhuma rota exige autenticação além do que o UC prevê (leitura pública livre)
