# mock-data Specification

## Purpose

Fornece dados simulados fiéis aos contratos futuros para validar telas e fluxos com a Fabiana, sem backend real e sem expor dados reais de pacientes.

## Requirements

### Requirement: Mocks cobrem o conteúdo do MVP

A camada de mocks SHALL fornecer dados para catálogo de procedimentos, depoimentos, resultados de antes/depois, slots de agenda disponíveis e conteúdo do blog, com formato estável e documentado por entidade.

#### Scenario: Tela renderiza só com mocks

- **WHEN** o backend real ainda não existe
- **THEN** todas as seções do site público renderizam conteúdo completo usando apenas os mocks

### Requirement: Fidelidade aos contratos futuros

Os mocks SHALL simular o mais fielmente possível os contratos reais previstos (mesmos campos e formatos), para que a troca pela API exija apenas reconfigurar a camada de dados.

#### Scenario: Validação de campo antes do backend

- **WHEN** um contrato de API é definido em `contracts/`
- **THEN** os mocks já existentes são compatíveis com ele ou a divergência é mapeada explicitamente

### Requirement: Nenhum dado real em mocks

Os arquivos de mock SHALL NOT conter dados reais de pacientes, fotos reais sem consentimento, credenciais, tokens ou qualquer informação sensível verdadeira, conforme `docs/03-seguranca.md`.

#### Scenario: Auditoria dos arquivos de mock

- **WHEN** os arquivos de mock são inspecionados
- **THEN** todo nome, foto, contato e depoimento é identificavelmente fictício

### Requirement: Consentimento simulado como regra de domínio

Os mocks de antes/depois SHALL incluir o estado de consentimento por item, e a exibição SHALL respeitar a regra "sem consentimento claro, a foto não aparece".

#### Scenario: Item mockado sem consentimento

- **WHEN** um item de antes/depois mockado está marcado sem consentimento
- **THEN** os componentes não o exibem, mesmo em ambiente de desenvolvimento

### Requirement: Objetivos e recomendações do quiz

Os mocks SHALL fornecer os 4 objetivos do simulador (id, título, descrição curta) e a recomendação de cada um (protocolo indicado + descrição), todos fictícios.

#### Scenario: Recomendação por objetivo

- **WHEN** a UI solicita a recomendação de um objetivo válido
- **THEN** recebe exatamente um protocolo com título e descrição não vazios

### Requirement: Categorias e campos de tratamentos para filtros e cards

Cada procedimento mockado SHALL ter categoria entre as abas do filtro e os campos exibidos no card (categoria, duração, nome, descrição); as abas SHALL derivar das categorias existentes mais "Todos".

#### Scenario: Filtro sem categoria órfã

- **WHEN** as abas são geradas a partir dos mocks
- **THEN** toda aba de categoria possui ao menos um procedimento

### Requirement: Campos do caso clínico de resultados

Cada caso mockado SHALL ter título, resumo, sessões, recuperação, objetivo e `hasConsent`; somente casos com consentimento são listados.

#### Scenario: Caso completo para o painel

- **WHEN** um caso com consentimento é exibido
- **THEN** todos os campos do painel estão preenchidos com conteúdo fictício

### Requirement: Opções do modal e canais de contato fictícios

Os mocks SHALL fornecer as opções de "tratamento de interesse" do modal e os canais de contato (WhatsApp, endereço, horários) com valores visivelmente fictícios.

#### Scenario: Inspeção dos contatos

- **WHEN** os arquivos de mock de contato são inspecionados
- **THEN** números, endereços e nomes são identificavelmente fictícios

### Requirement: Resultado simulado do envio de agendamento

A camada de dados SHALL expor `submitBookingRequest()` mockada que recebe os campos do formulário e retorna resultado determinístico (sucesso por padrão; erro forçável por parâmetro para demonstração e testes), sem nenhuma chamada de rede e sem persistir dados.

#### Scenario: Envio padrão tem sucesso

- **WHEN** o formulário válido é enviado sem forçar erro
- **THEN** o resultado indica sucesso com o tratamento solicitado

#### Scenario: Erro forçado para demonstração

- **WHEN** o envio é disparado com erro forçado
- **THEN** o resultado indica falha com mensagem acolhedora, sem expor detalhes técnicos
