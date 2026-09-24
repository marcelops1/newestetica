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
| Deploy do frontend | Vercel | Preview deployments por PR |
| Orquestração do backend | Docker + docker-compose | Ambiente futuro em `infra/` |

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
- TDD (RED → GREEN → REFACTOR) obrigatório para comportamento testável, com a única exceção de mudanças sem comportamento (ver `docs/engineering/07-workflow-de-engenharia.md`)

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

Cobertura abaixo de 80% reprova o gate de testes automaticamente. A Definition of Done completa está em `docs/engineering/07-workflow-de-engenharia.md`.

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

> Detalhes de segurança: `docs/security/03-seguranca.md`.

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
- Seguir `docs/product/01-persona-e-ux-40+.md`
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

## 18. Decisão: Deploy do Frontend (Vercel)

**Escolhido:** Vercel como plataforma de deploy do frontend Next.js.

**Motivos:**

- Integração nativa com Next.js (build, otimizações e runtime suportados sem configuração própria)
- Preview deployments automáticos por PR — permite validar visualmente com a Fabiana antes do merge
- Simplicidade operacional no estágio atual: sem infraestrutura própria para manter

**Alternativas consideradas:**

- **Self-host** (VPS + Node/Docker): rejeitada — custo de operação e configuração desproporcional ao estágio atual
- **Outras plataformas de deploy** (ex.: Netlify, Render): rejeitada — integração menos nativa com as otimizações do Next.js e sem ganho relevante para o caso

**Implicações:**

- Variáveis de ambiente do frontend configuradas na plataforma (segredos nunca no código, conforme `docs/security/03-seguranca.md`)
- Domínio customizado será configurado quando a clínica definir o domínio final
- Sem custo de infraestrutura própria neste momento (plano da plataforma)
- O deploy não altera a arquitetura do monorepo nem o `frontend/` (projeto Next.js padrão)

---

## 19. Decisão: Orquestração de Ambiente e Containerização (Docker)

**Escolhido:** Docker como padrão de orquestração de ambiente e de empacotamento das aplicações, via `docker-compose` em `infra/docker/`:

- **Postgres e Keycloak** sobem em containers no ambiente local (base implementada em 2026-09-19, com healthchecks e versões pinadas);
- **Frontend** tem Dockerfile multi-stage (standalone) — portabilidade de hospedagem para AWS/VPS, **sem substituir** a Vercel, que segue como plataforma de **demo** (decisão 18);
- **Backend** (NestJS) entra no compose quando o primeiro módulo nascer (`backend/Dockerfile` ainda não existe; o serviço fica comentado no compose até lá).

**Motivos:**

- Paridade entre desenvolvimento e produção (mesmas versões de serviços para todos)
- Isolamento do ambiente (nada instalado na máquina do desenvolvedor)
- Onboarding simples: subir o ambiente com um comando
- Portabilidade de hosting: o destino final é AWS ou VPS — a Vercel cobre só a demo, sem virar dependência definitiva

**Alternativas consideradas:**

- **Serviços instalados na máquina** (PostgreSQL/Keycloak nativos): rejeitada — divergência de versões e configuração manual por pessoa
- **Apenas serviços gerenciados em nuvem desde já**: rejeitada — custo e dependência externa antes de existir backend
- **Kubernetes/orquestração mais complexa**: rejeitada — complexidade desproporcional ao escopo (mesmo racional do monolito modular)
- **Manter a Vercel como destino final**: rejeitada — lock-in de plataforma; a containerização preserva a escolha de hospedagem

**Implicações:**

- `docker-compose.yml`, realm de exemplo e `.env.example` vivem em `infra/docker/`; segredos fora do repositório (`.env` ignorado pelo git, conforme `docs/security/03-seguranca.md`)
- Versões pinadas (séries estáveis) e healthchecks obrigatórios no compose
- O serviço `backend` fica comentado no compose até `backend/Dockerfile` existir (primeiro módulo do Épico 4)
- Testes de integração do backend usam o mesmo PostgreSQL real em container (ver `docs/engineering/07-workflow-de-engenharia.md` §13)

**Nota de roadmap:** a rejeição de Kubernetes acima é para o estágio atual do projeto, não permanente. O plano de longo prazo do usuário é hospedar o sistema em produção sobre Kubernetes rodando em cima de VPS (ex.: DigitalOcean), quando a escala e a maturidade operacional justificarem. Docker Compose continua sendo o padrão de desenvolvimento local e do estágio inicial de produção; a migração para Kubernetes será uma decisão técnica nova, proposta via OpenSpec quando esse momento chegar — não decida a favor ou contra Kubernetes sem essa proposta formal.

---

## 20. Decisão: ai-memory como ferramenta experimental de continuidade entre agentes

**Escolhido:** adoção **experimental e não obrigatória** do ai-memory (servidor de memória de longo prazo cross-agent, Markdown versionado em Git, modo zero-LLM, self-hosted) como memória **informal** de continuidade entre sessões e IAs.

**Motivos:**

- Portabilidade informal complementar ao OpenSpec: contexto de conversa e decisões de passagem que **não** viram artefato formal ganham um lugar comum entre agentes diferentes
- Armazenamento em Markdown versionado em Git — auditável e sem lock-in de banco proprietário
- Modo zero-LLM disponível e self-hosted — sem custo de API e sem enviar conteúdo para terceiros
- Suporte multi-agente (Claude Code, Codex, Gemini CLI, OpenCode, entre outros) — alinhado ao princípio multi-IA do projeto

**Alternativas consideradas:**

- **Nenhuma ferramenta equivalente com o mesmo suporte multi-agente**: rejeitada — as alternativas avaliadas não cobriam o conjunto (cross-agent + Markdown em Git + zero-LLM + self-hosted)
- **Manter a continuidade só informal na cabeça do desenvolvedor**: rejeitada — perde-se contexto entre sessões e entre IAs, sem registro nenhum
- **Formalizar tudo no OpenSpec**: rejeitada — artefatos formais são para decisão/escopo; nem todo contexto de passagem merece proposal

**Implicações:**

- Ferramenta de **DESENVOLVIMENTO**: nunca faz parte do deploy de produção (VPS/AWS/Kubernetes) nem do `infra/docker/docker-compose.yml` — roda separada, instalada na máquina do usuário (fora deste repositório)
- **Não substitui** o `AGENTS.md` nem o OpenSpec como fonte de verdade autoritativa; em conflito, eles vencem
- **Nunca captura dado real de paciente** (regra explícita em `docs/security/03-seguranca.md` §4), com reforço técnico (exclusão de path/allowlist) obrigatório antes de existir dado real no projeto
- Adoção não obrigatória: qualquer IA ou pessoa pode trabalhar sem a ferramenta; o fluxo OpenSpec não muda
- Arquivo de roteamento do monorepo (`.ai-memory.toml`) nasce com a instalação real, em change próprio

---

## 21. Decisão: graphify como ferramenta experimental de navegação de codebase

**Escolhido:** adoção **experimental e não obrigatória** do graphify (github.com/Graphify-Labs/graphify — grafo de conhecimento do codebase consultável via `/graphify` e comandos `query`/`path`/`explain`) como navegação **informal** do repositório entre sessões e IAs.

**Motivos:**

- Código com parsing local via tree-sitter (AST determinístico) — sem custo de API e sem nada sair da máquina; só docs/PDFs/mídia passam pelo modelo da sessão (ou chave configurada)
- God nodes, detecção de comunidades e arestas explicadas (`EXTRACTED`/`INFERRED`) — respostas como subgrafo escopado, geralmente bem menor que varredura bruta
- Skill por plataforma (`graphify opencode install`, com seção operacional em `AGENTS.md`) — alinhado ao princípio multi-IA do projeto
- O precedente da instalação que escreveu sozinha no `AGENTS.md` (revertido) mostrou que a ferramenta precisa de regra explícita via OpenSpec antes de operar no repo

**Alternativas consideradas:**

- **Versionar `graphify-out/` desde já** (recomendação upstream): rejeitada por enquanto — grafo com baixo valor no codebase atual; poluiria o repo com artefato regenerável de baixo uso (decisão registrada no `design.md` do change; reavaliar quando a adoção crescer)
- **Só grep/busca bruta**: rejeitada — não escala com o crescimento do backend; o grafo responde com contexto escopado
- **Nenhuma ferramenta de navegação**: rejeitada — cada IA redescobriria a estrutura do zero por sessão

**Implicações:**

- Ferramenta de **DESENVOLVIMENTO**: nunca faz parte do deploy de produção nem de `infra/docker/`; CLI/skill instalados por máquina, fora do repo versionado
- **Não substitui** o `AGENTS.md` nem o OpenSpec como fonte de verdade autoritativa; em conflito, eles vencem
- `graphify-out/` **gitignored por enquanto** (entrada no `.gitignore`); reavaliação em change próprio quando a adoção justificar
- **Nunca processa dado real de paciente em docs/PDFs** (regra explícita em `docs/security/03-seguranca.md` §4), com reforço técnico obrigatório antes de existir dado real no projeto
- Adoção não obrigatória: qualquer IA ou pessoa pode trabalhar sem a ferramenta; o fluxo OpenSpec não muda
- A seção operacional em `AGENTS.md` é o mecanismo no OpenCode (instruction-file platform): `query` primeiro com `graph.json` existente, `GRAPH_REPORT.md` só para revisão ampla, `update .` após modificar código

---

## 22. Decisão: kernel técnico compartilhado entre módulos de backend

**Escolhido:** criar `backend/src/shared/` como **kernel técnico** — plumbing puro, sem vocabulário de domínio — com regra de filiação estrita (o kernel nunca importa de módulos; módulos importam do kernel só o plumbing previsto), em exceção explícita à regra de bounded contexts não compartilharem apresentação (`docs/architecture/02-arquitetura.md` §3). Conteúdo inicial: `http/zod-validation.pipe`, `http/domain-exception.filter` (base com hook `statusFor` local por módulo), `errors/domain-error` (base genérica; cada módulo mantém o union de códigos e a subclasse fina) e `prisma/client-factory` (compartilha a construção do cliente, não a instância).

**Motivos:**

- O SonarCloud reprovou o Quality Gate por duplicação em 3 PRs de módulo seguidos (#35, #38, #40 — 8,5% em New Code contra o limite de 3%), com ~39% de clones estruturais de produção e ~61% de DAMP em testes
- O 4º módulo (Identidade e Acesso) copiaria o plumbing pela 4ª vez; corrigir agora é mecânico, provado pela suíte existente, e evita a reincidência
- Mapeamentos e unions permanecem locais: a independência dos contextos é preservada onde importa (domínio e regras), e guards de autenticação futuros não colidem com o kernel

**Alternativas consideradas:**

- **Aceitar a duplicação sem ação** (precedente dos PRs #35/#38): rejeitada — normalizaria o check vermelho pela 4ª vez e empurraria a conta para a Identidade
- **Só extrair a produção**: rejeitada — não zera o gate (≈5,6% restantes)
- **Só excluir os testes no Sonar**: rejeitada — não zera sozinha e acelera o índice (≈7,6%)
- **Classe base genérica para repositórios Prisma**: rejeitada — repositórios/mappers/use-cases não têm duplicação textual; abstração sem ganho e com acoplamento
- **Erro carregando o próprio status HTTP**: rejeitada — vazaria HTTP para o domínio (viola Clean Architecture e o §5)

**Implicações:**

- `docs/architecture/02-arquitetura.md` §3 ganha a exceção com a regra de filiação; `c3-component.md` documenta o kernel
- Cada módulo mantém subclasse fina de filtro (mapa local) e de erro (union local) — poucas linhas, intencionalmente
- Stryker mede `src/shared/**`; `.sonarcloud.properties` (Automatic Analysis — não usar `sonar-project.properties`) exclui os padrões de teste da métrica de duplicação
- Provider de cliente compartilhado continua **não feito** (decisão 8 do change Conteúdo Público segue com o trigger no 4º módulo ou sob pressão de pools)

---

## 23. Referências cruzadas

- Visão de produto: `docs/product/00-visao-do-produto.md`
- Persona e UX: `docs/product/01-persona-e-ux-40+.md`
- Arquitetura: `docs/architecture/02-arquitetura.md`
- Segurança: `docs/security/03-seguranca.md`
- Estado atual: `docs/product/05-estado-atual.md`
- Regras para IAs: `AGENTS.md`
