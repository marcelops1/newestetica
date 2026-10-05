## RENAMED Requirements

- FROM: `### Requirement: Bloqueio honesto até a Identidade`
- TO: `### Requirement: Autenticação real via Keycloak`

## MODIFIED Requirements

### Requirement: Autenticação real via Keycloak

Todas as rotas de Atendimento SHALL exigir autenticação real via Keycloak (guard real no kernel compartilhado, via `@UseGuards` no controller, sem exceção): requisição sem token válido SHALL responder 401; token válido sem papel autorizado SHALL responder 403 com código e mensagem fixos, sem expor dado algum nem distinguir existência de recursos; com token válido e papel autorizado, as rotas SHALL funcionar conforme seus contratos — as suítes existentes servem como caracterização, provando zero regressão de negócio (o contraste "sem token = 401/403" vs "token válido com papel = acesso" substitui o `overrideGuard` anterior).

#### Scenario: Requisição com o guard ativo é bloqueada com 403 explícito

- **WHEN** qualquer rota de Atendimento é chamada sem token válido, com o guard real ativo (o 403 `AUTH_NOT_IMPLEMENTED` do bloqueio honesto foi substituído por 401/403 reais neste change)
- **THEN** a resposta é 401, idêntica em todos os casos, sem corpo de dados

#### Scenario: Token válido sem papel autorizado responde 403 idêntico

- **WHEN** qualquer rota de Atendimento é chamada com token válido mas sem papel, ou com papel insuficiente
- **THEN** a resposta é 403, byte-idêntica nos dois casos, sem expor dado algum

#### Scenario: Token válido com papel autorizado responde conforme o contrato

- **WHEN** as rotas são chamadas com token válido e papel autorizado
- **THEN** cada rota responde conforme seu contrato, com comportamento idêntico ao caracterizado pelas suítes vigentes
