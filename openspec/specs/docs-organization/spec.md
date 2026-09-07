# docs-organization Specification

## Purpose
Mantém a documentação navegável por tema à medida que o projeto cresce, sem quebrar referências nem histórico.

## Requirements

### Requirement: Estrutura temática com mapas

`docs/` SHALL ter subpastas por tema (`product/`, `requirements/`, `architecture/`, `security/`, `engineering/`, `qa/`, `data/`, `infra/`), cada pasta nova com `README.md` de um parágrafo (o que mora ali + papel responsável), e `docs/README.md` listando as 8 pastas.

#### Scenario: Localizar documento por tema

- **WHEN** alguém procura onde mora um documento
- **THEN** o mapa indica a pasta em uma linha, sem adivinhação

### Requirement: Movimentação com histórico preservado

Os arquivos SHALL ser movidos com `git mv`, sem edição de conteúdo além de caminhos e da seção 7 do `AGENTS.md`.

#### Scenario: Arqueologia de decisão

- **WHEN** alguém roda `git log --follow` num doc movido
- **THEN** o histórico anterior à mudança aparece

### Requirement: Zero referências quebradas

Toda referência aos caminhos antigos em `AGENTS.md`, `frontend/AGENTS.md`, `backend/AGENTS.md` e nas referências internas SHALL apontar para o caminho novo; `grep -r "docs/0"` SHALL retornar vazio ao final.

#### Scenario: Busca por caminho antigo

- **WHEN** alguém busca `docs/0` no repositório
- **THEN** nenhum resultado de caminho antigo aparece
