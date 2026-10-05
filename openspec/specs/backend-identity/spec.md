# backend-identity Specification

## Purpose

Dá ao backend autenticação e autorização reais via Keycloak para as rotas administrativas: valida o JWT do painel (assinatura, emissor, audiência, expiração) e aplica RBAC por papel com negação por padrão, com 2FA exigido no realm.

## Requirements

### Requirement: Autenticação real via Keycloak (sem login próprio)

A API SHALL aceitar como identidade somente o JWT emitido pelo Keycloak do projeto, validando assinatura (via JWKS do realm), emissor, audiência e expiração a cada requisição; o backend SHALL NOT expor endpoint próprio de login, emissão ou renovação de tokens — o login continua sendo o fluxo padrão do Keycloak no frontend (Épico 5). Requisição sem token, com token malformado, expirado, de emissor ou audiência divergentes, ou com assinatura inválida SHALL responder 401 com código e mensagem fixos, sem expor detalhe interno nem distinguir motivos.

#### Scenario: Token válido do realm acessa conforme o papel

- **WHEN** uma rota administrativa é chamada com JWT válido (assinatura, emissor, audiência e expiração íntegros)
- **THEN** a identidade é aceita e a decisão passa para a camada de autorização (RBAC)

#### Scenario: Sem token ou com token inválido responde 401 sem distinguir motivos

- **WHEN** uma rota administrativa é chamada sem token, com token malformado, expirado, de outro emissor/audiência ou com assinatura inválida (incluindo algoritmo `none`)
- **THEN** a resposta é 401, idêntica em todos os casos, sem corpo de dados e sem indicar qual checagem falhou

### Requirement: RBAC por papel com negação por padrão

A API SHALL autorizar por papel (`admin`, `reception` — os papéis do realm): token válido sem papel, ou com papel insuficiente para a rota, SHALL responder 403 com código e mensagem fixos, sem vazar existência de dados e sem distinguir "sem papel" de "papel insuficiente"; rota sem papel declarado SHALL exigir ao menos autenticação (negação por padrão — nada é público por esquecimento). Comportamento de negócio com token válido e papel autorizado SHALL ser idêntico ao contrato vigente de cada módulo.

#### Scenario: Papel insuficiente ou ausente responde 403 idêntico

- **WHEN** uma rota restrita é chamada com token válido mas sem papel, ou com papel abaixo do exigido
- **THEN** a resposta é 403, byte-idêntica nos dois casos, sem expor dado algum

#### Scenario: Papel autorizado responde conforme o contrato do módulo

- **WHEN** uma rota é chamada com token válido e papel autorizado
- **THEN** a resposta segue o contrato vigente do módulo (suítes existentes como caracterização — zero regressão)

### Requirement: 2FA obrigatório exigido no realm e provado

O realm do projeto SHALL exigir o segundo fator para `admin` e `reception` (configuração versionada em `infra/docker/keycloak/realm-newestetica.json`); login só com senha SHALL NOT produzir sessão utilizável no backend. A exigência SHALL ser provada por teste contra o realm (fluxo só-senha não obtém token aceito), não presumida da configuração.

#### Scenario: Segundo fator exigido para os papéis do painel

- **WHEN** o fluxo de autenticação do realm é exercitado para `admin` e `reception`
- **THEN** a conclusão exige o segundo fator, e tentativa só com senha não resulta em acesso às rotas
