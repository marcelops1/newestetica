# 08 — Backlog de Produto — Newestetica

> **Backlog no padrão Épico > Feature > Use Case.** Fonte do escopo: `docs/product/00-visao-do-produto.md` (MVP), `docs/architecture/02-arquitetura.md` (bounded contexts), `docs/architecture/04-decisoes-tecnicas.md` (decisões) e `docs/product/05-estado-atual.md` (status). Sem Tasks — elas nascem quando cada Change for aberto no OpenSpec. Sem prazos nem estimativas.

---

## Épico 1 — Site Público

### Feature 1.1 — Home

**Use Case 1.1.1 — Ver apresentação da clínica**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Site acessível pelo celular.
- **Fluxo principal:**
  1. A paciente abre a página inicial.
  2. O sistema exibe Header, Hero, Quiz, Tratamentos, Resultados, Diferenciais, Depoimentos, CTA final e Footer, nessa ordem.
  3. A paciente percorre as seções sem quebra de layout.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - As 9 seções aparecem na ordem aprovada no mobile e no desktop.
  - Textos em tom acolhedor, sem promessas milagrosas nem urgência artificial.
  - Áreas de toque com ao menos 44x44px.
- **Status atual:** Concluído (implementada com mocks; pendente validação com a Fabiana).

### Feature 1.2 — Sobre

**Use Case 1.2.1 — Conhecer a Fabiana e a clínica**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Home acessível.
- **Fluxo principal:**
  1. A paciente navega até Sobre.
  2. O sistema exibe história, formação, valores e figura da Fabiana como autoridade acolhedora.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Conteúdo transmite confiança e naturalidade.
  - Página mobile-first e legível (corpo mínimo 16px).
- **Status atual:** Não iniciado.

### Feature 1.3 — Catálogo de Procedimentos

**Use Case 1.3.1 — Consultar procedimentos**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Catálogo cadastrado (mock ou API).
- **Fluxo principal:**
  1. A paciente abre o catálogo.
  2. O sistema lista procedimentos com descrição clara (o que é, o que esperar).
- **Fluxos alternativos/exceção:** Nenhum procedimento cadastrado → mensagem acolhedora, sem tela vazia fria.
- **Critérios de aceite:**
  - Cada procedimento explica o que esperar (conforto, tempo, cuidados).
  - Linguagem acessível, sem jargão desnecessário.
- **Status atual:** Em andamento (seção com filtros existe na home; página dedicada pendente).

**Use Case 1.3.2 — Filtrar por categoria**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Use Case 1.3.1 disponível.
- **Fluxo principal:**
  1. A paciente escolhe uma categoria.
  2. O sistema exibe somente os procedimentos da categoria, indicando a aba ativa.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Filtragem sem recarregar a página; aba ativa indicada visualmente e por `aria-pressed`.
- **Status atual:** Em andamento (funciona na home com mocks).

### Feature 1.4 — Antes/Depois

**Use Case 1.4.1 — Ver resultados reais com consentimento**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Casos com consentimento registrado.
- **Fluxo principal:**
  1. A paciente abre Antes/Depois.
  2. O sistema exibe somente casos com consentimento explícito, deixando claro que houve consentimento.
- **Fluxos alternativos/exceção:** Caso sem consentimento → nunca exibido em nenhuma seção.
- **Critérios de aceite:**
  - Badge de consentimento visível junto aos resultados.
  - Nenhum item sem consentimento é renderizado.
- **Status atual:** Em andamento (comparador acessível existe na home com blocos locais; fotos reais pendentes).
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 1.5 — Depoimentos

**Use Case 1.5.1 — Ler depoimentos de pacientes**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Depoimentos cadastrados.
- **Fluxo principal:**
  1. A paciente abre Depoimentos.
  2. O sistema exibe relatos com identificação próxima (iniciais, contexto), sem exposição indevida.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Depoimentos éticos, próximos e identificáveis com a faixa 40–60.
- **Status atual:** Em andamento (seção existe na home com mocks fictícios).

### Feature 1.6 — Agendamento Self-Service (paciente)

**Use Case 1.6.1 — Solicitar avaliação pelo site**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Slots criados pela administração (mock ou API).
- **Fluxo principal:**
  1. A paciente aciona Agendar a partir de qualquer CTA.
  2. O sistema abre o modal (nome, WhatsApp, tratamento pré-selecionado pela origem, mensagem opcional).
  3. A paciente envia e vê a confirmação de recebimento.
- **Fluxos alternativos/exceção:** Envio falha → mensagem acolhedora sem culpa, dados preservados, nova tentativa.
- **Critérios de aceite:**
  - Fluxo concluído sozinha pelo celular, com confirmação visível.
  - Envio 100% mockado até o backend existir; nenhum dado sai do navegador.
- **Status atual:** Em andamento (modal base com mocks; polimento proposto no change `booking-flow-polish`).
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

**Use Case 1.6.2 — Receber confirmação por e-mail**

- **Ator principal:** Sistema (para paciente e clínica).
- **Pré-condição:** Agendamento realizado; backend com e-mail transacional.
- **Fluxo principal:**
  1. O agendamento é confirmado.
  2. O sistema envia confirmação por e-mail para a paciente e para a clínica.
- **Fluxos alternativos/exceção:** Falha no envio → retentativa e aviso à recepção, sem perder o agendamento.
- **Critérios de aceite:**
  - Ambas as partes recebem a confirmação com data, hora e tratamento.
- **Status atual:** Não iniciado (exige backend).
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 1.7 — Orçamento

**Use Case 1.7.1 — Pedir orçamento personalizado**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Catálogo disponível.
- **Fluxo principal:**
  1. A paciente solicita orçamento informando interesse e contato.
  2. O sistema registra a solicitação para retorno da clínica, sem prometer valores fechados.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Solicitação clara, sem pressão comercial e sem valores enganosos.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 1.8 — Contato

**Use Case 1.8.1 — Falar com a clínica via WhatsApp**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Canal de contato configurado.
- **Fluxo principal:**
  1. A paciente aciona o contato/WhatsApp.
  2. O sistema abre o canal direto (link) com a clínica.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Link visível no header, CTA final e rodapé; abre corretamente no mobile.
- **Status atual:** Em andamento (links existem com contatos fictícios; número real pendente).

### Feature 1.9 — Blog

**Use Case 1.9.1 — Ler conteúdo educativo**

- **Ator principal:** Paciente (visitante).
- **Pré-condição:** Posts cadastrados.
- **Fluxo principal:**
  1. A paciente abre o Blog.
  2. O sistema lista artigos que educam e geram confiança.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Artigos legíveis no mobile, tom acolhedor, sem promessas milagrosas.
- **Status atual:** Não iniciado (mocks de posts existem; página pendente).

---

## Épico 2 — Painel Administrativo

### Feature 2.1 — Dashboard

**Use Case 2.1.1 — Ver visão geral da operação**

- **Ator principal:** Fabiana / Recepção (autenticadas).
- **Pré-condição:** Login válido com papel autorizado.
- **Fluxo principal:**
  1. A usuária abre o painel.
  2. O sistema exibe resumo da operação (agenda do dia, pacientes, financeiro básico).
- **Fluxos alternativos/exceção:** Sem dados → estados vazios acolhedores, sem telas frias.
- **Critérios de aceite:**
  - Informações essenciais visíveis em uma tela, sem burocracia.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 2.2 — Gestão de Pacientes

**Use Case 2.2.1 — Cadastrar paciente**

- **Ator principal:** Fabiana / Recepção (autenticadas).
- **Pré-condição:** Papel com permissão de cadastro.
- **Fluxo principal:**
  1. A usuária informa os dados mínimos da paciente.
  2. O sistema valida e registra, informando a finalidade do uso.
- **Fluxos alternativos/exceção:** Dado inválido → mensagem clara por campo, sem perder o digitado.
- **Critérios de aceite:**
  - Coleta mínima necessária; finalidade informada (LGPD).
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

**Use Case 2.2.2 — Consultar e atualizar paciente**

- **Ator principal:** Fabiana / Recepção (autenticadas).
- **Pré-condição:** Paciente cadastrada.
- **Fluxo principal:**
  1. A usuária localiza a paciente.
  2. O sistema exibe dados e permite atualização com o mesmo cuidado da criação.
- **Fluxos alternativos/exceção:** Paciente não encontrada → orientação de busca, sem expor dados de terceiros.
- **Critérios de aceite:**
  - Busca rápida; edição preserva histórico de alterações essenciais.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 2.3 — Gestão de Agenda/Slots

**Use Case 2.3.1 — Criar disponibilidade (slots)**

- **Ator principal:** Fabiana / Recepção (autenticadas).
- **Pré-condição:** Papel com permissão de agenda.
- **Fluxo principal:**
  1. A usuária define dias, horários e duração dos slots.
  2. O sistema disponibiliza os slots para o agendamento self-service, sem sobreposição.
- **Fluxos alternativos/exceção:** Conflito de horário → aviso antes de salvar, sem duplicar.
- **Critérios de aceite:**
  - Nenhum slot sobreposto; paciente só vê horários válidos.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

**Use Case 2.3.2 — Gerenciar agenda da equipe**

- **Ator principal:** Fabiana / Recepção (autenticadas).
- **Pré-condição:** Slots e agendamentos existentes.
- **Fluxo principal:**
  1. A usuária visualiza a agenda por dia.
  2. O sistema permite confirmar, remarcar ou cancelar, refletindo no self-service.
- **Fluxos alternativos/exceção:** Cancelamento → slot volta a ficar disponível.
- **Critérios de aceite:**
  - Agenda sempre consistente com o que a paciente vê.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 2.4 — Gestão de Procedimentos

**Use Case 2.4.1 — Manter o catálogo**

- **Ator principal:** Fabiana (admin).
- **Pré-condição:** Login com papel admin.
- **Fluxo principal:**
  1. A Fabiana cria, edita ou desativa procedimentos (nome, descrição, duração, categoria).
  2. O sistema reflete no catálogo público somente itens ativos.
- **Fluxos alternativos/exceção:** Desativar procedimento com agendamentos futuros → aviso e tratamento sem silenciosamente apagar.
- **Critérios de aceite:**
  - Site público nunca exibe procedimento desativado.
- **Status atual:** Não iniciado.

### Feature 2.5 — Histórico de Atendimento

**Use Case 2.5.1 — Registrar e consultar histórico simples**

- **Ator principal:** Fabiana (admin).
- **Pré-condição:** Paciente e atendimento existentes.
- **Fluxo principal:**
  1. A Fabiana registra o que foi realizado (operacional, sem prontuário médico completo).
  2. O sistema vincula ao prontuário simples da paciente para consulta futura.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Histórico simples e operacional; nenhum dado clínico sensível aprofundado.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 2.6 — Financeiro Básico

**Use Case 2.6.1 — Ver resumo financeiro essencial**

- **Ator principal:** Fabiana (admin).
- **Pré-condição:** Atendimentos registrados.
- **Fluxo principal:**
  1. A Fabiana abre o financeiro.
  2. O sistema exibe visão essencial (recebimentos, pendências), sem contabilidade avançada.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Números essenciais corretos; sem emissão fiscal ou contabilidade (fora do MVP).
- **Status atual:** Não iniciado.

### Feature 2.7 — Gestão de Usuários e Papéis

**Use Case 2.7.1 — Gerenciar equipe e permissões**

- **Ator principal:** Fabiana (admin).
- **Pré-condição:** Keycloak configurado.
- **Fluxo principal:**
  1. A Fabiana cria usuárias da equipe e atribui papel (`admin` ou `reception`).
  2. O sistema aplica permissões do papel em todas as áreas do painel.
- **Fluxos alternativos/exceção:** Remoção de acesso → sessão encerrada com segurança.
- **Critérios de aceite:**
  - Recepção nunca alcança funções exclusivas de admin.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

---

## Épico 3 — Autenticação e Acesso

### Feature 3.1 — Login com Keycloak

**Use Case 3.1.1 — Entrar no painel administrativo**

- **Ator principal:** Fabiana / Recepção.
- **Pré-condição:** Usuária provisionada no Keycloak.
- **Fluxo principal:**
  1. A usuária acessa o painel e é redirecionada ao Keycloak.
  2. Após credenciais válidas, o sistema cria sessão segura e abre o painel.
- **Fluxos alternativos/exceção:** Credenciais inválidas → erro genérico, sem indicar se usuário ou senha falhou.
- **Critérios de aceite:**
  - Nenhuma rota do painel acessível sem autenticação.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 3.2 — 2FA para painel admin

**Use Case 3.2.1 — Verificar segundo fator**

- **Ator principal:** Fabiana / Recepção.
- **Pré-condição:** 2FA ativado para a conta.
- **Fluxo principal:**
  1. Após a senha, o sistema solicita o segundo fator.
  2. Com código válido, o acesso é liberado.
- **Fluxos alternativos/exceção:** Código inválido/expirado → nova tentativa limitada, sem bloquear a conta injustamente.
- **Critérios de aceite:**
  - 2FA obrigatório para `admin` e `reception`; impossível pular a etapa.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 3.3 — Controle de papéis/permissões

**Use Case 3.3.1 — Acessar somente o permitido ao papel**

- **Ator principal:** Usuária autenticada do painel.
- **Pré-condição:** Papel atribuído (`admin` ou `reception`).
- **Fluxo principal:**
  1. A usuária tenta uma ação ou rota.
  2. O sistema autoriza (RBAC) ou nega com mensagem adequada.
- **Fluxos alternativos/exceção:** Tentativa sem permissão → negação registrada, sem vazar existência de dados.
- **Critérios de aceite:**
  - Menor privilégio em todas as rotas e ações.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

---

## Épico 4 — Backend e Contratos

### Feature 4.1 — Contratos de API (contracts/)

**Use Case 4.1.1 — Consumir contratos claros entre frontend e backend**

- **Ator principal:** Equipe de desenvolvimento (frontend/backend).
- **Pré-condição:** Validação visual do frontend concluída.
- **Fluxo principal:**
  1. Os contratos (schemas OpenAPI/Zod) são definidos em `contracts/`.
  2. Frontend e backend evoluem contra os contratos, sem acoplamento direto.
- **Fluxos alternativos/exceção:** Divergência mock × contrato → mapeada explicitamente.
- **Critérios de aceite:**
  - Mocks existentes compatíveis ou divergência documentada.
- **Status atual:** Não iniciado.

### Feature 4.2 — Módulos NestJS por bounded context

Bounded contexts conforme `docs/architecture/02-arquitetura.md`. Todos com status Não iniciado e arquitetura em monolito modular (Repository + Data Mapper).

**Use Case 4.2.1 — Identidade e Acesso (API)**

- **Ator principal:** Painel admin (via API).
- **Pré-condição:** Keycloak integrado.
- **Fluxo principal:**
  1. O backend valida sessão/papel e autoriza operações de usuários.
- **Critérios de aceite:**
  - Autorização RBAC aplicada em todas as rotas protegidas.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

**Use Case 4.2.2 — Catálogo (API)**

- **Ator principal:** Site público e painel (via API).
- **Pré-condição:** Procedimentos cadastrados.
- **Fluxo principal:**
  1. A API expõe CRUD do catálogo; o público lê somente itens ativos.
- **Critérios de aceite:**
  - Leitura pública nunca retorna item desativado.
- **Status atual:** Não iniciado.

**Use Case 4.2.3 — Agendamento (API)**

- **Ator principal:** Paciente (self-service) e recepção (via API).
- **Pré-condição:** Slots criados pela administração.
- **Fluxo principal:**
  1. A API lista disponibilidade, reserva sem conflito e confirma por e-mail (paciente + clínica).
- **Fluxos alternativos/exceção:** Concorrência no mesmo slot → só uma reserva vence, sem overbooking.
- **Critérios de aceite:**
  - Regras 6.3 de `docs/00` cumpridas (self-service, slots da admin, confirmação por e-mail).
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

**Use Case 4.2.4 — Pacientes (API)**

- **Ator principal:** Painel admin (via API).
- **Pré-condição:** Autenticação + papel autorizado.
- **Fluxo principal:**
  1. A API mantém cadastro e dados básicos com coleta mínima e finalidade informada.
- **Critérios de aceite:**
  - Direitos do titular preparáveis (acesso, correção, exclusão) sem retrabalho estrutural.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

**Use Case 4.2.5 — Atendimento / Histórico (API)**

- **Ator principal:** Fabiana (via API).
- **Pré-condição:** Paciente e atendimento existentes.
- **Fluxo principal:**
  1. A API registra e recupera o histórico simples por paciente.
- **Critérios de aceite:**
  - Somente histórico operacional; sem prontuário médico completo.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

**Use Case 4.2.6 — Financeiro Básico (API)**

- **Ator principal:** Fabiana (via API).
- **Pré-condição:** Atendimentos registrados.
- **Fluxo principal:**
  1. A API agrega o resumo financeiro essencial.
- **Critérios de aceite:**
  - Escopo limitado ao essencial; sem fiscal/contábil.
- **Status atual:** Não iniciado.

**Use Case 4.2.7 — Conteúdo Público (API)**

- **Ator principal:** Site público (via API).
- **Pré-condição:** Conteúdo aprovado com consentimentos.
- **Fluxo principal:**
  1. A API serve catálogo, depoimentos, antes/depois (só com consentimento) e posts.
- **Critérios de aceite:**
  - Nada sem consentimento é servido publicamente.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 4.3 — Persistência PostgreSQL com migrations

**Use Case 4.3.1 — Evoluir o banco com migrations versionadas**

- **Ator principal:** Equipe de desenvolvimento / pipeline.
- **Pré-condição:** Modelo alinhado aos bounded contexts.
- **Fluxo principal:**
  1. Mudanças de modelo entram como migrations versionadas.
  2. O pipeline aplica em ordem, sem perda de dados.
- **Fluxos alternativos/exceção:** Falha de migration → rollback seguro, deploy interrompido.
- **Critérios de aceite:**
  - Modelo de banco não vaza para o domínio; menor privilégio no acesso.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

---

## Épico 5 — Integração Frontend-Backend

### Feature 5.1 — Substituição dos mocks pela API real

**Use Case 5.1.1 — Trocar a fonte de dados sem mexer na UI**

- **Ator principal:** Equipe de desenvolvimento.
- **Pré-condição:** Contratos definidos e backend implementando; UI validada com mocks.
- **Fluxo principal:**
  1. A camada de dados (`lib/`) é reconfigurada para a API real.
  2. As telas continuam funcionando sem alteração nos componentes.
- **Fluxos alternativos/exceção:** Divergência de campo → mapeada explicitamente antes da troca.
- **Critérios de aceite:**
  - Troca restrita à camada de dados (requirement `frontend-foundation` já aprovado).
  - Todos os gates verdes após a troca.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

---

## Épico 6 — Infraestrutura e Qualidade

### Feature 6.1 — CI/CD

**Use Case 6.1.1 — Gates automáticos em push e PR**

- **Ator principal:** Pipeline (GitHub Actions).
- **Pré-condição:** Workflow configurado.
- **Fluxo principal:**
  1. Cada push/PR executa lint, formatação, typecheck, testes com cobertura, build, auditoria e varredura de segredos.
  2. Falha em qualquer gate bloqueia o merge.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Pipeline verde no estado atual do repositório.
- **Status atual:** Concluído (workflow criado e executando).

### Feature 6.2 — Observabilidade básica

**Use Case 6.2.1 — Logs e saúde essenciais**

- **Ator principal:** Equipe de desenvolvimento/operação.
- **Pré-condição:** Ambiente de deploy existente.
- **Fluxo principal:**
  1. O sistema emite logs estruturados e expõe saúde básica dos serviços.
- **Fluxos alternativos/exceção:** —
- **Critérios de aceite:**
  - Falhas localizáveis sem acesso a dados sensíveis; nada sensível em log.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

### Feature 6.3 — Deploy de ambiente

**Use Case 6.3.1 — Publicar a aplicação**

- **Ator principal:** Pipeline/equipe.
- **Pré-condição:** Build verde e segredos fora do código.
- **Fluxo principal:**
  1. O pipeline publica frontend e backend nos ambientes definidos.
- **Fluxos alternativos/exceção:** Falha no deploy → rollback para a versão anterior estável.
- **Critérios de aceite:**
  - Deploy reproduzível; segredos via gestão segura, nunca no código.
- **Status atual:** Não iniciado.
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).

---

## Tabela-resumo

| Épico | nº de Features | nº de Use Cases | Status geral |
| ----- | -------------- | --------------- | ------------ |
| 1. Site Público | 9 | 11 | Em andamento (Home concluída pendente validação; demais telas pendentes) |
| 2. Painel Administrativo | 7 | 9 | Não iniciado |
| 3. Autenticação e Acesso | 3 | 3 | Não iniciado |
| 4. Backend e Contratos | 3 | 9 | Não iniciado |
| 5. Integração Frontend-Backend | 1 | 1 | Não iniciado |
| 6. Infraestrutura e Qualidade | 3 | 3 | Em andamento (CI concluído; observabilidade e deploy pendentes) |
| **Total** | **26** | **36** | — |

---

## Referências cruzadas

- Visão e MVP: `docs/product/00-visao-do-produto.md`
- Persona e UX: `docs/product/01-persona-e-ux-40+.md`
- Arquitetura e bounded contexts: `docs/architecture/02-arquitetura.md`
- Segurança: `docs/security/03-seguranca.md`
- Decisões técnicas: `docs/architecture/04-decisoes-tecnicas.md`
- Estado atual: `docs/product/05-estado-atual.md`
- Workflow de engenharia: `docs/engineering/07-workflow-de-engenharia.md`
- Specs aprovadas: `openspec/specs/`
