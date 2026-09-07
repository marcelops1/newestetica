# 04 — Decisões Técnicas — Newestetica

> **Fonte oficial das decisões técnicas.** Este documento registra as escolhas de tecnologia, padrões e práticas já definidas. Nenhuma IA deve inventar decisões diferentes sem passar pelo processo OpenSpec.

---

## 1. Objetivo deste documento

Registrar de forma explícita as decisões técnicas do projeto, evitando decisões implícitas ou contraditórias. Serve como referência para implementação e para qualquer modelo de IA que trabalhar no código.

---

## 2. Stack Principal

| Camada | Decisão | Observação |
| -------- | --------- | ---------- |
| Frontend | Next.js (App Router) + TypeScript | Mobile-first |
| Backend | NestJS + TypeScript | Monolito modular |
| Banco de dados | PostgreSQL | Banco relacional principal |
| Autenticação | Keycloak + 2FA | Painel administrativo |
| Monorepo | pnpm workspace | Com turbo |
| Estilo de API | A definir nos contracts | Preferência por contratos claros (OpenAPI/Zod) |
| UI/UX | UI/UX Pro Max + diretrizes 40+ | Obrigatório no frontend |

---

## 3. Decisão: Monolito Modular

**Escolhido:** Monolito modular (não microserviços).

**Motivos:**

- Escopo atual não justifica a complexidade de microserviços
- Facilita desenvolvimento, debug e consistência transacional
- Permite módulos bem separados internamente
- Possibilita extração futura se necessário

**Implicações:**

- Um único deploy do backend
- Módulos com limites claros
- Comunicação entre módulos via interfaces/contratos
- Evitar acoplamento forte entre módulos

---

## 4. Decisão: Organização Interna do Backend (Camadas)

Cada módulo do backend deve seguir, preferencialmente, a separação:

- **Domain** → entidades, regras de negócio, interfaces de repositório
- **Application** → casos de uso / application services
- **Infrastructure** → implementações (ORM, Keycloak, e-mail, etc.)
- **Presentation** → controllers / resolvers / DTOs de entrada e saída

**Objetivo:** manter regras de negócio independentes de framework e de detalhes de infraestrutura.

---

## 5. Decisão: Repository Pattern + Data Mapper

**Escolhido:** Repository Pattern com abordagem **Data Mapper**.

**O que isso significa:**

- As entidades de domínio não conhecem o ORM
- O repositório é a interface de persistência
- A infraestrutura mapeia entre o modelo de domínio e o modelo de persistência

**O que evitar:**

- Active Record (entidade conhecendo e salvando a si mesma)
- Regras de negócio dentro de entities do ORM
- Acesso direto ao ORM a partir dos casos de uso

**Motivo:**

- Baixo acoplamento
- Maior testabilidade
- Independência de framework de persistência

---

## 6. Decisão: Baixo Acoplamento e Contratos

- Módulos devem depender de abstrações, não de implementações concretas
- Contratos compartilhados ficam em `contracts/` e/ou `shared/`
- Frontend e backend se comunicam através de contratos claros
- Evitar dependência direta de estruturas internas entre módulos

---

## 7. Decisão: Padrões de Design

### Strategy

Usar quando houver variações de comportamento (ex: diferentes formas de notificação, cálculo, validação, etc.) sem poluir o código com condicionais.

### Outros padrões

Aplicar sob demanda, sem over-engineering. Preferir simplicidade.

**Regra:** só introduzir um padrão quando ele resolver um problema real de complexidade ou variação.

---

## 8. Decisão: Estratégia de Testes

### Pirâmide

1. **Testes unitários** → regras de negócio e unidades isoladas
2. **Testes de integração** → módulo + banco + adaptadores
3. **Testes E2E** → fluxos críticos completos

### Cobertura

- Meta mínima de cobertura unitária: **> 80%**
- Cobertura artificial não é aceita
- Preferir TDD (RED → GREEN → REFACTOR) quando houver comportamento testável

### O que deve ser testado prioritariamente

- Regras de agendamento
- Consentimento de fotos
- Permissões de acesso
- Casos de uso principais de pacientes, agenda e procedimentos

---

## 9. Decisão: Quality Gates

Nenhuma task de implementação deve ser considerada concluída sem passar por:

- Lint
- Formatação
- Typecheck
- Testes (com cobertura adequada)
- Build (quando aplicável)

Se um gate falhar, a task não está pronta.

---

## 10. Decisão: Frontend-first com Mocks

**Escolhido:** construir o frontend primeiro com dados mockados.

**Motivos:**

- Validar experiência e visual com a Fabiana antes de investir no backend
- Reduzir retrabalho
- Permitir evolução paralela posterior via contratos

**Implicações técnicas:**

- Mocks devem simular os contratos reais o mais fielmente possível
- O frontend deve ser preparado para trocar mocks por API real com baixo impacto
- Contratos devem ser definidos antes ou durante a transição para o backend

---

## 11. Decisão: Autenticação

- Keycloak como Identity Provider
- 2FA obrigatório para o painel admin
- Integração do backend com Keycloak
- Frontend admin protegido por autenticação

> Detalhes de segurança: `docs/03-seguranca.md`.

---

## 12. Decisão: Banco de Dados

- PostgreSQL como banco principal
- Migrations versionadas
- Modelo de dados alinhado aos bounded contexts
- Evitar que o modelo de banco “vaze” para o domínio

---

## 13. Decisão: Comunicação e Integrações (MVP)

| Integração | Status no MVP |
| ------------ | --------------- |
| E-mail transacional (confirmação de agendamento) | Sim |
| Google Calendar / iPhone Calendar | Desejável (se viável sem complexidade excessiva) |
| WhatsApp API | Fora do MVP (apenas link no início) |
| Pagamento online | Fora do MVP |

---

## 14. Decisão: Multi-clínica

- **MVP:** single-clinic (apenas a clínica da Fabiana Rosa)
- **Arquitetura:** deve nascer preparada para multi-clínica
- **Implementação multi-clínica:** fora do MVP

Evitar decisões que tornem a evolução para multi-clínica desnecessariamente difícil.

---

## 15. Decisão: UI/UX e Frontend

- Mobile-first obrigatório
- Seguir `docs/01-persona-e-ux-40+.md`
- Usar a skill **UI/UX Pro Max** em tarefas visuais
- Priorizar legibilidade, contraste, clareza e redução de ansiedade
- Visual clean e suave (referência Ever/Body)

---

## 16. O que deliberadamente NÃO foi escolhido (ainda)

- Microserviços
- GraphQL como padrão obrigatório
- CQRS completo
- Event Sourcing
- Monorepo com packages excessivamente fragmentados
- App mobile nativo

Essas opções podem ser reavaliadas no futuro via OpenSpec, se houver necessidade real.

---

## 17. Regras para novas decisões técnicas

Toda nova decisão técnica relevante deve:

1. Ser proposta via OpenSpec quando impactar arquitetura ou padrões
2. Ser documentada neste arquivo ou em ADR específico
3. Explicar o motivo e as alternativas consideradas
4. Evitar decisão implícita

---

## 18. Referências cruzadas

- Visão de produto: `docs/00-visao-do-produto.md`
- Persona e UX: `docs/01-persona-e-ux-40+.md`
- Arquitetura: `docs/02-arquitetura.md`
- Segurança: `docs/03-seguranca.md`
- Estado atual: `docs/05-estado-atual.md`
- Regras para IAs: `AGENTS.md`
