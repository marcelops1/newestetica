# frontend-foundation Specification

## Purpose

Estabelece a base executável do frontend no monorepo: app Next.js inicializado, estrutura de pastas e quality gates obrigatórios.

## Requirements

### Requirement: Base Next.js executável no monorepo

A pasta `frontend/` SHALL conter um aplicativo Next.js (App Router) + TypeScript executável dentro do workspace pnpm, com scripts `dev`, `lint`, `format`, `typecheck`, `test` e `build`.

#### Scenario: Desenvolvedora roda o frontend localmente

- **WHEN** a desenvolvedora executa o comando de desenvolvimento na pasta `frontend/`
- **THEN** o aplicativo inicia sem erros e responde na porta configurada

#### Scenario: Build de produção passa

- **WHEN** o comando de build é executado na pasta `frontend/`
- **THEN** o build completa sem erros de tipos ou lint bloqueante

### Requirement: Organização de pastas aprovada

O frontend SHALL seguir a organização `app/` (rotas e páginas), `components/` (reutilizáveis), `features/` (por domínio), `lib/` (utilitários e mocks) e `styles/` (design system e tokens), conforme `docs/02-arquitetura.md`.

#### Scenario: Nova tela encontra lugar definido

- **WHEN** uma nova rota ou componente do MVP é adicionado
- **THEN** existe exatamente uma pasta canônica para ele segundo a organização aprovada, sem criar novas pastas de topo fora do padrão

### Requirement: Camada de dados isolada para troca por API real

O acesso a dados no frontend SHALL passar por uma camada isolada (em `lib/` ou `features/`), de forma que trocar mocks pela API real exija alterar somente essa camada, sem reescrever componentes.

#### Scenario: Troca de mocks por API

- **WHEN** a API real fica disponível e a camada de dados é reconfigurada para ela
- **THEN** as telas continuam funcionando sem alteração nos componentes de apresentação

### Requirement: Quality gates obrigatórios

Nenhuma task desta fundação SHALL ser considerada concluída sem passar por lint, formatação, typecheck, testes e build, conforme `docs/04-decisoes-tecnicas.md`.

#### Scenario: Gate falha bloqueia conclusão

- **WHEN** qualquer um dos gates falha
- **THEN** a task permanece não concluída até a correção
