# AGENTS.md — Newestetica

Porta de entrada obrigatória para qualquer IA que trabalhe neste projeto.
Leia este arquivo por completo antes de qualquer outra ação. Ele contém regras inegociáveis, em especial o processo Spec-Driven Development (OpenSpec).

## 1. Título e Introdução

Newestetica é um sistema completo para clínica de estética, focado em mulheres de 40 a 60 anos. A profissional responsável é a Fabiana Rosa. Todo o produto é construído sob o ponto de vista dela e das suas pacientes.

Este documento define como qualquer modelo de IA deve trabalhar neste repositório. Ele está acima de qualquer outra instrução. Se houver conflito entre este arquivo e qualquer outra fonte, este arquivo vence.

## 2. Como qualquer IA deve iniciar o trabalho neste projeto (OBRIGATÓRIO)

Nenhuma IA pode tocar em código ou propor mudanças antes de executar todos os passos abaixo, nesta ordem:

1. Leia este AGENTS.md por completo.
2. Leia README.md (se existir conteúdo).
3. Leia as Referências Obrigatórias (seção 9), nesta ordem:
   - docs/00-visao-do-produto.md
   - docs/01-persona-e-ux-40+.md
   - docs/02-arquitetura.md
   - docs/03-seguranca.md
   - docs/04-decisoes-tecnicas.md
   - docs/05-estado-atual.md
   - docs/06-design-system.md
4. Explore a pasta openspec/ (especialmente openspec/specs/ e openspec/changes/).
5. Leia frontend/AGENTS.md e backend/AGENTS.md.
6. Somente depois de carregar todo esse contexto, identifique se a tarefa exige mudança de produto.
   - Se exigir mudança de comportamento, fluxo, escopo ou funcionalidade, é obrigatório seguir o fluxo OpenSpec (seção 6).
   - Só comece a escrever código após a spec da mudança existir e ser aceita.

Qualquer IA que pular este fluxo está trabalhando de forma incorreta.

## 3. Visão resumida do produto

### Problema

Mulheres de 40 a 60 anos buscam rejuvenescimento natural, autoestima, correção e prevenção, mas têm medo de artificialidade, dor, preço, resultados exagerados e exposição da privacidade.

### Proposta

Um sistema acolhedor e seguro para a clínica da Fabiana Rosa, que transmite confiança e naturalidade em todas as etapas: do site público ao acompanhamento da paciente.

### MVP (escopo atual)

- Site público: Home, Sobre, Catálogo, Antes/Depois, Depoimentos, Agendamento, Orçamento, Contato, Blog.
- Agendamento self-service: a paciente agenda sozinha; a administração cria os slots disponíveis.
- Painel admin: Dashboard, pacientes, agenda, procedimentos, histórico, financeiro básico e usuários.

### Estratégia de entrega (IMPORTANTE)

Frontend-first com dados mockados → validação visual com a Fabiana → só então backend real.
Não antecipe backend antes da validação do frontend.

### Tom e visual

- Tom: acolhedor, caloroso e empático.
- Visual: clean e suave (referência Ever/Body).
- Dispositivo: mobile-first.
- UI/UX: seguir as diretrizes da skill UI/UX Pro Max e os requisitos específicos para o público 40+.
- Design System e protótipo visual aprovados (ver docs/06-design-system.md).

## 4. Stack e arquitetura de alto nível

- Frontend: Next.js (App Router) + TypeScript + Tailwind
- Backend: NestJS + PostgreSQL (monolito modular)
- Autenticação: Keycloak + 2FA
- Repositório: Monorepo com pnpm workspace

- Backend é monólito modular (não microserviços).
- Estratégia de dados no início: mockados no frontend.
- Detalhes completos: docs/02-arquitetura.md e docs/04-decisoes-tecnicas.md.

## 5. Estrutura de pastas do monorepo

```text
newestetica/
├── AGENTS.md
├── README.md
├── docs/
│   ├── 00-visao-do-produto.md
│   ├── 01-persona-e-ux-40+.md
│   ├── 02-arquitetura.md
│   ├── 03-seguranca.md
│   ├── 04-decisoes-tecnicas.md
│   ├── 05-estado-atual.md
│   └── 06-design-system.md
├── openspec/
│   ├── specs/
│   └── changes/
│       └── archive/
├── frontend/
│   └── AGENTS.md
├── backend/
│   └── AGENTS.md
├── shared/
├── contracts/
├── infra/
├── observability/
├── backups/
├── pnpm-workspace.yaml
├── turbo.json
├── Makefile
└── package.json
```

Não crie novas pastas de topo sem necessidade real e sem passar pelo OpenSpec.

## 6. Processo de desenvolvimento — Spec-Driven Development (OpenSpec) — INEGOCIÁVEL

**REGRA ABSOLUTA:** Nenhuma IA e nenhum humano pode implementar funcionalidade, alterar comportamento ou mudar escopo sem antes passar por uma change no OpenSpec.

Fluxo obrigatório:

1. Explore
2. Propose (criar change em openspec/changes/)
3. Specs
4. Design
5. Tasks
6. Apply (só depois de aprovado)
7. Verify
8. Archive

Obrigações da IA:

- Toda nova capacidade ou alteração de comportamento deve ser proposta como change OpenSpec antes de qualquer código.
- Manter openspec/specs/ sempre como a verdade do produto.
- Uma mudança só é considerada pronta quando a implementação corresponde à spec aprovada.

O que NÃO é permitido:

- Implementar direto sem proposta
- Alterar comportamento existente sem change aprovada
- Atualizar specs diretamente em openspec/specs/ para burlar o processo
- Ignorar o fluxo porque a tarefa parece pequena

## 7. Modelos de IA recomendados (não obrigatórios)

Orquestração / Planejamento: GLM-5.3
Codificação geral: DeepSeek V4 ou GLM-5.3 Flash
Frontend / UI: Kimi K3
Revisão: DeepSeek V4 Pro (somente leitura)

A escolha do modelo é livre. O respeito ao processo OpenSpec e às regras deste arquivo é obrigatório.

## 8. Regras absolutas (o que NUNCA fazer)

1. Nunca implemente código sem seguir o fluxo OpenSpec.
2. Nunca pule a leitura das referências obrigatórias.
3. Nunca invente decisões de produto, arquitetura ou tecnologia. Se faltar informação, pergunte.
4. Nunca gere código fora do que foi aprovado em spec.
5. Nunca use dados reais de pacientes em mocks sem seguir docs/03-seguranca.md.
6. Nunca crie documentação que contradiga as specs ou os docs vigentes.
7. Nunca altere openspec/specs/ fora do ciclo de changes.
8. Nunca antecipe o backend: a estratégia é frontend-first com mock.
9. Nunca fuja do tom do produto (acolhedor, caloroso, empático).
10. Nunca ignore o Design System e o protótipo visual aprovado.
11. Nunca deixe conclusões importantes só na conversa. Registre nos arquivos apropriados.
12. Nunca escreva código de comportamento antes do teste que falha (RED -> GREEN -> REFACTOR). Ver docs/07-workflow-de-engenharia.md.
13. Nunca conclua uma task sem cumprir integralmente a Definition of Done de docs/07-workflow-de-engenharia.md.
14. Nunca toque em entrada de usuário, autenticação, dados de paciente ou integração sem revisão com a skill security-and-hardening contra docs/03-seguranca.md.

## 9. Referências obrigatórias (leitura antes de qualquer trabalho)

A IA deve ler estes arquivos na ordem abaixo antes de qualquer tarefa:

1. docs/00-visao-do-produto.md
2. docs/01-persona-e-ux-40+.md
3. docs/02-arquitetura.md
4. docs/03-seguranca.md
5. docs/04-decisoes-tecnicas.md
6. docs/05-estado-atual.md
7. docs/06-design-system.md
8. docs/07-workflow-de-engenharia.md
9. openspec/ (especialmente specs/ e changes/)
10. frontend/AGENTS.md
11. backend/AGENTS.md

Se você não leu um arquivo desta lista e vai tocar na área que ele cobre, leia antes.

## 10. Estado atual do projeto

A fonte oficial do estado é docs/05-estado-atual.md; esta seção apenas resume.

- Documentação base concluída
- Design System definido e protótipo visual aprovado
- Home pública implementada com mocks e quality gates passando
- Dois changes arquivados e quatro specs aprovadas
- Backend não iniciado
- Validação com a Fabiana pendente

Consequência prática: a IA deve seguir o fluxo de docs/07-workflow-de-engenharia.md e só implementar mediante Change OpenSpec aprovado.

## 11. Referências cruzadas rápidas

- Visão: docs/00-visao-do-produto.md
- Persona/UX: docs/01-persona-e-ux-40+.md
- Arquitetura: docs/02-arquitetura.md
- Segurança: docs/03-seguranca.md
- Decisões técnicas: docs/04-decisoes-tecnicas.md
- Estado atual: docs/05-estado-atual.md
- Design System: docs/06-design-system.md
- Workflow de engenharia: docs/07-workflow-de-engenharia.md

## 12. Agent Skills (addyosmani/agent-skills)

Skills instaladas em `.opencode/skills/` (ver `docs/opencode-setup.md` do repositório oficial para detalhes).

### Regras

- Se a tarefa corresponder a uma skill abaixo, carregue-a com a tool `skill` antes de agir.
- Siga o workflow da skill estritamente; não aplique parcialmente.
- Nunca pule etapas exigidas (spec, plano, teste) quando a skill exigir.
- Em caso de conflito com este AGENTS.md, este arquivo vence.

### Mapeamento intenção → skill

- Nova funcionalidade / mudança significativa → `spec-driven-development` (antes de qualquer código), depois propor via OpenSpec (seção 6)
- Planejamento / quebra de tarefas → `planning-and-task-breakdown`
- Implementação (> 1 arquivo) → `incremental-implementation` + `test-driven-development`
- Lógica, bug ou mudança de comportamento → `test-driven-development`
- Telas, componentes, layout → `frontend-ui-engineering` (sempre com `docs/01-persona-e-ux-40+.md` e `docs/06-design-system.md`)
- Antes de merge / revisar código → `code-review-and-quality`
- Entrada de usuário, auth, dados, integrações → `security-and-hardening` (sempre com `docs/03-seguranca.md`)
- Dúvida sobre qual skill usar → `using-agent-skills`

A amarração obrigatória entre cada skill e a etapa do OpenSpec está em docs/07-workflow-de-engenharia.md.
