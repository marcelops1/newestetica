# 02 — Arquitetura — Newestetica

> **Fonte oficial da arquitetura de alto nível.** Este documento define como o sistema é organizado, quais princípios arquiteturais são obrigatórios e como as partes se relacionam. Toda decisão de implementação deve respeitar este arquivo e o `docs/architecture/04-decisoes-tecnicas.md`.

---

## 1. Objetivo deste documento

Estabelecer a visão arquitetural do Newestetica de forma clara e estável, para que qualquer IA ou desenvolvedor entenda:

- O estilo arquitetural escolhido
- Os bounded contexts (DDD Estratégico)
- Os princípios de baixo acoplamento e organização
- A estratégia de testes e qualidade
- A divisão entre frontend, backend e shared
- Como o sistema nasce preparado para evoluir (incluindo multi-clínica no futuro)

---

## 2. Estilo Arquitetural Principal

### Monolito Modular

O backend será um **monolito modular**.

**O que isso significa:**

- Um único deploy
- Módulos internos bem delimitados e com baixo acoplamento
- Comunicação entre módulos preferencialmente via interfaces/contratos claros
- Evita a complexidade operacional de microserviços no estágio atual

**Por que essa escolha:**

- O domínio ainda está sendo consolidado
- A equipe e o escopo do MVP não justificam microserviços
- Facilita desenvolvimento, debug e evolução inicial
- Permite extrair módulos no futuro se necessário (sem compromisso prematuro)

> Detalhes de implementação e padrões: `docs/architecture/04-decisoes-tecnicas.md`.

---

## 3. DDD Estratégico — Bounded Contexts

O domínio é organizado nos seguintes **Contextos Delimitados** (inicialmente):

| Contexto | Responsabilidade principal |
| ---------- | --------------------------- |
| **Identidade e Acesso** | Autenticação, autorização, usuários do painel (Keycloak) |
| **Catálogo** | Procedimentos e serviços oferecidos pela clínica |
| **Agendamento** | Slots, disponibilidade, marcação de horários |
| **Pacientes** | Cadastro e dados básicos das pacientes |
| **Atendimento / Histórico** | Registro simples do que foi realizado |
| **Financeiro Básico** | Visão financeira essencial da operação |
| **Conteúdo Público** | Site, blog, depoimentos, antes/depois (lado de apresentação) |

### Regras

- Cada módulo do backend deve pertencer preferencialmente a um contexto.
- Evitar que um módulo conheça detalhes internos de outro.
- Comunicação entre contextos deve ser explícita e controlada.
- No frontend, as features também devem respeitar essa separação conceitual.

---

## 4. Princípios Arquiteturais Obrigatórios

### 4.1 Baixo acoplamento

- Módulos não devem depender de implementações concretas de outros módulos.
- Preferir interfaces e contratos.
- Evitar “god modules” que concentram várias responsabilidades.

### 4.2 Alta coesão

- Cada módulo deve ter uma responsabilidade clara e bem definida.

### 4.3 Separação de responsabilidades

- Frontend cuida de apresentação e experiência.
- Backend cuida de regras de negócio, persistência e segurança.
- Shared e contracts cuidam de tipos e contratos compartilhados.

### 4.4 Independência de frameworks na medida do possível

- Regras de negócio não devem ficar presas ao NestJS ou ao Prisma/TypeORM.
- Usar o framework como detalhe de implementação.

### 4.5 Evolução incremental

- Preferir mudanças pequenas, validadas e revisadas.
- Não introduzir complexidade antecipada (YAGNI).

---

## 5. Organização do Monorepo

```text
newestetica/
├── frontend/          → Next.js (App Router) — site público + painel admin
├── backend/           → NestJS — monolito modular
├── shared/            → Tipos, DTOs, utils e constants compartilhados
├── contracts/         → Contratos de API (schemas, OpenAPI, etc.)
├── infra/             → Docker, Keycloak, configurações de infraestrutura
├── openspec/          → Specs e changes (fonte da verdade de requisitos)
└── docs/              → Documentação oficial
```

---

## 6. Frontend — Visão Arquitetural

- **Next.js App Router**
- **TypeScript**
- **Mobile-first**
- **UI/UX Pro Max** + diretrizes de `docs/product/01-persona-e-ux-40+.md`
- Estratégia atual: **dados mockados** até validação com a Fabiana

### Organização recomendada (alto nível)

- `app/` → rotas e páginas
- `components/` → componentes reutilizáveis
- `features/` → funcionalidades por domínio (agendamento, catálogo, etc.)
- `lib/` → utilitários e configurações
- `styles/` → design system e tokens

O frontend deve nascer preparado para consumir a API real depois, mas **hoje trabalha com mocks**.

---

## 7. Backend — Visão Arquitetural

- **NestJS**
- **PostgreSQL**
- **Monolito modular**
- **Autenticação via Keycloak + 2FA**

### Organização interna recomendada

Cada módulo deve seguir uma estrutura clara, por exemplo:

```text
modules/
├── patients/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── appointments/
├── procedures/
├── users/
└── ...
```

### Padrões obrigatórios (resumo)

- **Repository Pattern**
- **Data Mapper** (evitar Active Record)
- Preferência por **baixo acoplamento** entre camadas
- Regras de negócio no domínio/aplicação, não na infraestrutura

> Detalhes de implementação e padrões: `docs/architecture/04-decisoes-tecnicas.md`.

---

## 8. Estratégia de Testes e Qualidade

### Pirâmide de testes (obrigatória)

| Tipo | Objetivo | Obrigatório |
| ------ | ---------- | ----------- |
| **Unitários** | Regras de negócio e funções isoladas | Sim |
| **Integração** | Módulos + banco + contratos | Sim |
| **E2E** | Fluxos críticos completos | Sim (fluxos principais) |

### Cobertura

- Meta mínima de cobertura de testes unitários: **> 80%**
- Não aceitar cobertura artificial
- Testes de comportamento SHALL ser escritos em ciclo **RED → GREEN → REFACTOR** (TDD) obrigatório, com a única exceção de mudanças sem comportamento (ver `docs/engineering/07-workflow-de-engenharia.md`)

### Quality Gates (obrigatórios antes de considerar uma task concluída)

- Lint
- Formatação
- Typecheck
- Testes + cobertura
- Build (quando aplicável)

---

## 9. Segurança na Arquitetura

A segurança não é um “módulo isolado”. Ela permeia a arquitetura:

- Autenticação e autorização centralizadas (Keycloak)
- Dados sensíveis protegidos desde o desenho
- Consentimento de imagens tratado como requisito de domínio
- Princípio do menor privilégio
- Segredos nunca no código

Detalhes completos: `docs/security/03-seguranca.md`.

---

## 10. Preparação para o Futuro (Multi-clínica)

No MVP o sistema atende **apenas uma clínica** (Fabiana Rosa).

Porém, a arquitetura deve nascer **preparada** para multi-clínica no futuro:

- Evitar hardcode de “clínica única” em regras de negócio
- Pensar em isolamento de dados por clínica desde o início (mesmo que não implementado)
- Não acoplar o domínio a uma única instância de forma irreversível

A implementação de multi-clínica **não faz parte do MVP**.

---

## 11. Estratégia de Entrega e Impacto na Arquitetura

A ordem de construção influencia a arquitetura:

1. **Frontend com mocks** (validação visual)
2. **Contratos de API** (`contracts/`)
3. **Backend real** implementando os contratos
4. Integração frontend ↔ backend

Isso evita que o frontend fique refém de decisões prematuras do backend e vice-versa.

---

## 12. O que esta arquitetura deliberadamente evita

- Microserviços no MVP
- Over-engineering
- Compartilhamento excessivo de código entre frontend e backend além de contratos e tipos
- Regras de negócio no frontend
- Acoplamento forte entre módulos
- Decisões arquiteturais implícitas (tudo deve estar documentado)

---

## 13. Referências cruzadas

- Visão de produto: `docs/product/00-visao-do-produto.md`
- Persona e UX: `docs/product/01-persona-e-ux-40+.md`
- Segurança: `docs/security/03-seguranca.md`
- Decisões técnicas detalhadas: `docs/architecture/04-decisoes-tecnicas.md`
- Estado atual: `docs/product/05-estado-atual.md`
- Regras para IAs: `AGENTS.md`
