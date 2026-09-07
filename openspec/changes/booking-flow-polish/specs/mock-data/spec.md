## ADDED Requirements

### Requirement: Resultado simulado do envio de agendamento

A camada de dados SHALL expor `submitBookingRequest()` mockada que recebe os campos do formulário e retorna resultado determinístico (sucesso por padrão; erro forçável por parâmetro para demonstração e testes), sem nenhuma chamada de rede e sem persistir dados.

#### Scenario: Envio padrão tem sucesso

- **WHEN** o formulário válido é enviado sem forçar erro
- **THEN** o resultado indica sucesso com o tratamento solicitado

#### Scenario: Erro forçado para demonstração

- **WHEN** o envio é disparado com erro forçado
- **THEN** o resultado indica falha com mensagem acolhedora, sem expor detalhes técnicos
