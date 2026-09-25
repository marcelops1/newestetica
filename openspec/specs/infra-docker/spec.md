# infra-docker Specification

## Purpose

Define o ambiente local containerizado do projeto (banco, IdP, backend e imagens das aplicações), para que qualquer desenvolvedor ou IA suba o stack de desenvolvimento com um comando, sem instalar serviços na máquina.

## Requirements

### Requirement: Compose stack local com Postgres e Keycloak

O repositório SHALL conter `infra/docker/docker-compose.yml` definindo os serviços `postgres` (imagem com pin exato de série estável, volume nomeado para dados, healthcheck via `pg_isready`), `keycloak` (imagem com pin exato de série estável, modo dev, importação do realm de exemplo, `depends_on` com condição de postgres saudável) e `backend` (build a partir de `backend/Dockerfile`, `DATABASE_URL` interna apontando para o `postgres`, porta documentada, `depends_on` com condição de postgres saudável, healthcheck em `GET /health`), todos na mesma rede dedicada nomeada; nenhum serviço SHALL permanecer comentado.

#### Scenario: Configuração válida

- **WHEN** alguém roda `docker compose -f infra/docker/docker-compose.yml config`
- **THEN** o comando sai com zero, com os serviços `postgres`, `keycloak` e `backend` no grafo ativo

#### Scenario: Postgres saudável após up

- **WHEN** alguém roda o up com espera de saúde
- **THEN** o postgres atinge estado saudável e aceita conexão com as credenciais do `.env`

#### Scenario: Keycloak sobe após o banco

- **WHEN** o stack está no ar
- **THEN** o Keycloak responde na porta documentada com o realm de exemplo importado (sem usuários reais)

#### Scenario: Backend saudável após up

- **WHEN** alguém roda o up com espera de saúde em volume de dados limpo
- **THEN** o backend atinge estado saudável, com as migrations aplicadas e `GET /health` respondendo o status documentado

### Requirement: Frontend multi-stage com standalone output

O repositório SHALL conter `frontend/Dockerfile` com estágios de build e runtime; o runtime SHALL executar como usuário não-root, expor apenas a porta documentada e servir a aplicação a partir do standalone output (habilitado em `frontend/next.config.ts`).

#### Scenario: Build da imagem passa

- **WHEN** alguém roda o build da imagem do frontend
- **THEN** o build sai com zero nos dois estágios

#### Scenario: Container serve a home

- **WHEN** o container do frontend está no ar
- **THEN** `GET /` responde 200 com a página pública

### Requirement: Contrato de ambiente sem segredos reais

`infra/docker/.env.example` SHALL listar todas as variáveis referenciadas pelo compose (portas, credenciais fictícias de desenvolvimento, nomes de banco/realm) com valores de exemplo; nenhum valor real SHALL aparecer em arquivo versionado; `.env` SHALL permanecer ignorado pelo git.

#### Scenario: Toda variável do compose está documentada

- **WHEN** alguém lista as variáveis referenciadas em `docker-compose.yml`
- **THEN** cada uma existe em `.env.example` com valor fictício

#### Scenario: Nenhum segredo versionado

- **WHEN** alguém grepa por padrões de segredo nos arquivos novos (`password|secret|PRIVATE KEY` fora de placeholders `changeme-dev`/fictícios)
- **THEN** nada é encontrado além dos placeholders documentados

### Requirement: Scripts de ciclo de vida do stack

A raiz do monorepo SHALL expor um `Makefile` com os targets `up` (sobe o stack até os healthchecks passarem), `down` (derruba os serviços e remove órfãos), `logs` (segue os logs), `build` (rebuild das imagens), `restart`, `ps` e `db-shell` (psql direto no container), além de `help` como target padrão listando todos com descrição; o `package.json` raiz SHALL NOT conter scripts `infra:*`.

#### Scenario: Up sobe tudo saudável

- **WHEN** alguém roda `make up` do zero
- **THEN** postgres, keycloak e backend ficam saudáveis e alcançáveis nas portas documentadas

#### Scenario: Down limpa tudo

- **WHEN** alguém roda `make down`
- **THEN** nenhum container do projeto permanece rodando

#### Scenario: Help autodescobre os comandos

- **WHEN** alguém roda `make help` (ou `make` sem argumentos)
- **THEN** cada target aparece listado com sua descrição, sem precisar ler o arquivo

#### Scenario: Scripts pnpm removidos

- **WHEN** alguém grepa por `infra:up` ou `infra:down` fora de `openspec/changes/archive/`
- **THEN** nada é encontrado (a convenção antiga não coexiste com a nova)

### Requirement: Backend containerizado com migrations no entrypoint

O repositório SHALL conter `backend/Dockerfile` multi-stage (build + runtime) seguindo o padrão do `frontend/Dockerfile`: estágio de build gera o Prisma Client e compila o NestJS; estágio runtime executa como usuário não-root, contém apenas o necessário (`dist/`, dependências de produção, Prisma CLI, schema + migrations) e inicia por um entrypoint que roda `prisma migrate deploy` (com a `DATABASE_URL` do ambiente) antes de subir o servidor, falhando rápido se a migration falhar.

#### Scenario: Build da imagem passa

- **WHEN** alguém roda o build da imagem do backend
- **THEN** o build sai com zero nos dois estágios, com o Prisma Client gerado durante o build

#### Scenario: Migrations aplicadas antes de servir

- **WHEN** o container do backend sobe com volume de dados limpo
- **THEN** as migrations são aplicadas pelo entrypoint antes do servidor aceitar conexões, e `GET /health` responde 200 em seguida

#### Scenario: Falha de migration impede boot silencioso

- **WHEN** o container do backend sobe com `DATABASE_URL` inalcançável
- **THEN** o entrypoint sai com erro diferente de zero e o serviço não fica saudável
