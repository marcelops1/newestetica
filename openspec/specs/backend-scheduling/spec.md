# backend-scheduling Specification

## Purpose

Entrega o primeiro módulo real do backend (Agendamento): reservar horários sem conflito sobre slots da administração, com persistência PostgreSQL e HTTP mínimo validado pelos contratos, servindo de padrão copiável para os demais módulos do Épico 4.

## Requirements

### Requirement: Reserva sem overbooking

O módulo SHALL garantir que um slot nunca tenha duas bookings confirmadas simultaneamente: ao confirmar uma booking, o slot SHALL ser marcado como indisponível para novas reservas, e uma segunda tentativa de reserva no mesmo slot SHALL ser recusada.

#### Scenario: Primeira reserva em slot livre confirma

- **WHEN** uma solicitação válida chega para um slot disponível
- **THEN** a booking é confirmada e o slot deixa de estar disponível

#### Scenario: Segunda reserva no mesmo slot é recusada

- **WHEN** uma solicitação chega para um slot que já tem booking confirmada
- **THEN** a reserva é recusada sem criar booking e sem alterar a existente

#### Scenario: Concorrência no mesmo slot elege uma única vencedora

- **WHEN** duas solicitações concorrentes disputam o mesmo slot
- **THEN** exatamente uma confirma e a outra é recusada, sem overbooking em nenhum caso

### Requirement: Listagem de disponibilidade

O módulo SHALL expor a disponibilidade criada pela administração: a listagem SHALL conter somente slots disponíveis, com os dados necessários à reserva (identificador, início, duração).

#### Scenario: Somente slots disponíveis são listados

- **WHEN** a disponibilidade é consultada existindo slots livres e ocupados
- **THEN** a resposta contém apenas os livres

#### Scenario: Sem disponibilidade, resposta vazia acolhedora

- **WHEN** a disponibilidade é consultada sem nenhum slot livre
- **THEN** a resposta é uma lista vazia, sem erro

### Requirement: Confirmação de reserva via porta de notificação

Toda booking confirmada SHALL acionar a porta de notificação com os dados da confirmação (paciente, clínica, data, hora, tratamento); o transporte real de e-mail (SMTP) é fora deste change — a porta é cumprida por adapter fake/console e o SMTP real nasce em change futuro.

#### Scenario: Booking confirmada dispara notificação

- **WHEN** uma booking é confirmada
- **THEN** a porta de notificação é invocada exatamente uma vez com os dados da confirmação

#### Scenario: Booking recusada não dispara notificação

- **WHEN** uma reserva é recusada (slot ocupado ou payload inválido)
- **THEN** a porta de notificação não é invocada

### Requirement: Validação de entrada e saída pelos contratos

A camada HTTP SHALL validar toda entrada com os schemas Zod de `contracts/src/scheduling/` e formatar a saída conforme os mesmos contratos; payload inválido SHALL ser recusado com erro estruturado (código + mensagem), sem expor detalhes internos.

#### Scenario: Payload inválido recebe erro estruturado

- **WHEN** chega uma solicitação com nome curto, telefone sem DDD ou campos com tipo errado
- **THEN** a resposta indica falha de validação com código e mensagem, sem conteúdo interno do validador

#### Scenario: Saída conforme o contrato

- **WHEN** uma reserva confirma ou a disponibilidade é listada
- **THEN** o corpo da resposta é compatível com os schemas de `contracts/src/scheduling/`

### Requirement: Persistência PostgreSQL cumpre o contrato das portas

A implementação real dos repositórios SHALL honrar integralmente as interfaces definidas no Domain (portas): tudo que é salvo é recuperável, e o estado de ocupação do slot persiste entre operações.

#### Scenario: Round-trip de slot e booking

- **WHEN** um slot e sua booking são salvos e lidos de volta do PostgreSQL real
- **THEN** os dados retornam íntegros e o slot consta como ocupado

### Requirement: Regra de dependência Clean Architecture no módulo

O módulo SHALL respeitar a regra de dependência: `domain/` não importa nada fora de `domain/` (sem framework, sem ORM, sem HTTP); `application/` depende somente de `domain/`; `infrastructure/` implementa as portas do `domain/`; `presentation/` depende de `application/`.

#### Scenario: Auditoria estática de imports

- **WHEN** os imports do módulo são auditados
- **THEN** nenhuma violação da direção de dependência é encontrada

### Requirement: Escopo limitado ao Agendamento sem autenticação

O módulo SHALL conter somente o bounded context de Agendamento, sem autenticação/autorização (Keycloak/RBAC nasce na Feature 4.2 de Identidade), sem SMTP real, sem `backend/Dockerfile` e sem outros bounded contexts.

#### Scenario: Auditoria de escopo

- **WHEN** o conteúdo do módulo é auditado
- **THEN** não existe código de outros bounded contexts, de autenticação, de envio real de e-mail nem Dockerfile
