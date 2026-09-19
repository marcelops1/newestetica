## Purpose

Define o ambiente local containerizado do projeto (banco, IdP e imagens das aplicações), para que qualquer desenvolvedor ou IA suba a base do backend com um comando, sem instalar serviços na máquina.

## ADDED Requirements

### Requirement: Compose stack local com Postgres e Keycloak

O repositório SHALL conter `infra/docker/docker-compose.yml` definindo os serviços `postgres` (imagem com pin exato de série estável, volume nomeado para dados, healthcheck via `pg_isready`) e `keycloak` (imagem com pin exato de série estável, modo dev, importação do realm de exemplo, `depends_on` com condição de postgres saudável), todos na mesma rede dedicada nomeada; o serviço `backend` SHALL existir apenas como bloco comentado até `backend/Dockerfile` existir.

#### Scenario: Configuração válida

- **WHEN** alguém roda `docker compose -f infra/docker/docker-compose.yml config`
- **THEN** o comando sai com zero, sem o serviço `backend` no grafo ativo

#### Scenario: Postgres saudável após up

- **WHEN** alguém roda o up com espera de saúde
- **THEN** o postgres atinge estado saudável e aceita conexão com as credenciais do `.env`

#### Scenario: Keycloak sobe após o banco

- **WHEN** o stack está no ar
- **THEN** o Keycloak responde na porta documentada com o realm de exemplo importado (sem usuários reais)

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

O `package.json` raiz SHALL expor `infra:up` (sobe o stack até os healthchecks passarem) e `infra:down` (derruba os serviços e remove órfãos).

#### Scenario: Up sobe tudo saudável

- **WHEN** alguém roda `pnpm infra:up` do zero
- **THEN** postgres e keycloak ficam saudáveis e alcançáveis nas portas documentadas

#### Scenario: Down limpa tudo

- **WHEN** alguém roda `pnpm infra:down`
- **THEN** nenhum container do projeto permanece rodando
