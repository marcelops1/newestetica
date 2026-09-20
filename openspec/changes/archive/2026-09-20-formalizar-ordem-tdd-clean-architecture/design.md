## Context

Ver `proposal.md` (Why). Ponto de partida verificado: 02 §7 normatiza a regra de dependência (`domain/` sem imports externos; `application/` só de `domain/`; `infrastructure/` implementa interfaces do `domain/`; `presentation/` de `application/`) e `backend/AGENTS.md` §4 repete a organização por módulo; 04 §5 exige Repository + Data Mapper; 07 §13 já exige integração do backend contra PostgreSQL real em container e 07 §§4–6 exigem RED→GREEN→REFACTOR com tasks test-first. O que falta é só a ordem: nada diz que o banco vem por último nem que Infrastructure é bloqueada por Domain/Application verdes. `backend/` segue só com `AGENTS.md` (nenhum módulo para conflitar).

## Goals / Non-Goals

**Goals:**

- Regra de ordem permanente e verificável para todo módulo futuro do backend, legível em uma seção do 07.

**Non-Goals:**

- Mudar a regra de dependência, criar código, detalhar NestJS/ORM por fornecedor, redefinir a Definition of Done.

## Decisions

### 1. Nova seção 15 no 07 (não em 02 nem em `backend/AGENTS.md`)

Rationale: a ordem de construção com TDD é workflow (COMO), não arquitetura (O QUÊ) — mora no 07, que já contém TDD, formato de task e DoD. Alternativas consideradas: documentar em 02 §7 (rejeitada — 02 define estrutura, não sequência de trabalho); só em `backend/AGENTS.md` (rejeitada — AGENTS.md é porta de entrada, o 07 é a fonte única do fluxo).

### 2. Princípio "o banco de dados é um detalhe" como abertura

Rationale: ancora a ordem inteira numa frase testável — lógica de negócio nasce, é testada e estabiliza antes de qualquer persistência real. Alternativa considerada: começar direto na ordem sem princípio (rejeitada — sem o porquê, a ordem vira ritual copiável sem entendimento).

### 3. Ordem Domain → Application → Infrastructure → Presentation, com o veículo de teste de cada camada

Rationale: cada camada tem um veículo distinto já previsto no projeto — Domain: unitários puros (sem NestJS TestingModule, sem banco); Application: casos de uso contra repositório FAKE em memória (portas = interfaces do Domain); Infrastructure: integração real contra banco em container (07 §13) provando o contrato da interface; Presentation: a mais fina, validando entrada via `contracts/`. Alternativas consideradas: permitir TestingModule no Domain (rejeitada — acoplaria regra pura ao framework, contra 02 §7); permitir banco real em Application (rejeitada — transformaria teste de caso de uso em teste de persistência); Active Record na Infrastructure (rejeitada — já vedado por 04 §5).

### 4. Regra de bloqueio verificável nas tasks (não só no texto)

Rationale: regra sem verificação é conselho — a seção exige que tasks de Infrastructure só existam/comece após Domain e Application verdes, no formato test-first da seção 5 (o RED da task de Infrastructure deve pressupor as anteriores verdes). Alternativa considerada: bloqueio apenas moral no texto (rejeitada — não auditável no Verify).

### 5. Vínculo por referência cruzada com a DoD (seção 6), sem reescrevê-la

Rationale: a DoD continua sendo a lista única de conclusão; a seção 15 apenas referencia o item de cobertura/testes e o de spec sincronizada. Alternativa considerada: duplicar itens da DoD na seção 15 (rejeitada — duas fontes divergem com o tempo).

## Risks / Trade-offs

- [Risco] Regra percebida como burocracia em módulos triviais (ex.: CRUD sem regra) → Mitigação: a ordem continua valendo, mas o volume de testes segue a seção 13 (proporcional ao risco); a seção dirá isso explicitamente.
- [Trade-off] Fakes em memória precisam ser fiéis às interfaces → aceito: o teste de integração da Infrastructure existe justamente para provar que a implementação real cumpre o mesmo contrato do fake.
