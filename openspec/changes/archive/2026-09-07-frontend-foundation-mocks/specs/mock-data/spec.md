## Purpose

Fornece dados simulados fiéis aos contratos futuros para validar telas e fluxos com a Fabiana, sem backend real e sem expor dados reais de pacientes.

## ADDED Requirements

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
