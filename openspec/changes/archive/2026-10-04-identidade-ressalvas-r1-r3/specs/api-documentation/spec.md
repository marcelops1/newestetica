## REMOVED Requirements

### Requirement: Bloqueio de Pacientes explícito na documentação

**Reason**: O bloqueio honesto (`IdentityPendingGuard`, 403 `AUTH_NOT_IMPLEMENTED`) foi removido pelo change backend-modulo-identidade; as rotas administrativas agora exigem autenticação real (401/403 fixos + esquema bearer), e a documentação antiga mente sobre a API real.
**Migration**: Ver o requirement "Autenticação real documentada (401/403 + bearer)" nesta spec.

## ADDED Requirements

### Requirement: Autenticação real documentada (401/403 + bearer)

As 9 rotas administrativas (Pacientes, Atendimento e Financeiro) SHALL documentar as respostas 401 com código `AUTH_UNAUTHENTICATED` e 403 com código `AUTH_FORBIDDEN`, ambas com descrições fixas; o documento SHALL declarar um esquema de segurança bearer global e cada rota administrativa SHALL exigi-lo; a documentação SHALL NOT referenciar `IdentityPendingGuard`, `AUTH_NOT_IMPLEMENTED` ou bloqueio honesto.

#### Scenario: 401 e 403 fixos nas rotas administrativas

- **WHEN** as operações de `/patients`, `/patients/{patientId}/attendances` e `/finance/summary` são lidas no schema gerado
- **THEN** cada uma lista a resposta 401 com o código `AUTH_UNAUTHENTICATED` e a resposta 403 com o código `AUTH_FORBIDDEN`

#### Scenario: Esquema bearer declarado e exigido

- **WHEN** os `securitySchemes` do documento e a chave `security` das 9 operações são lidos no schema gerado
- **THEN** existe um esquema bearer e cada operação administrativa o exige
