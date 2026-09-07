# 00 — Visão do Produto — Newestetica

> **Fonte oficial da visão de produto.** Este documento é a primeira leitura obrigatória de qualquer IA que trabalhe no projeto (ver `AGENTS.md`, seção 9). Qualquer pessoa ou IA que ler este arquivo deve entender claramente o que o sistema é, para quem é, qual problema resolve, o que entra no MVP e o que fica de fora.

---

## 1. Introdução

**Newestetica** é um sistema completo para a clínica de estética da **Fabiana Rosa**, voltado ao atendimento de **mulheres de 40 a 60 anos**.

O sistema cobre a jornada da paciente — do conhecimento da clínica até o acompanhamento do tratamento — e também o dia a dia operacional da clínica: agenda, pacientes, procedimentos, histórico, financeiro básico e usuários.

O produto é sempre construído **sob o ponto de vista da Fabiana Rosa e das suas pacientes**. Toda decisão de produto parte dessa dupla perspectiva: acolher a paciente com segurança e confiança, e dar à Fabiana controle simples e tranquilo sobre a clínica.

---

## 2. Problema que o produto resolve

### Para a paciente

Mulheres de 40 a 60 anos buscam rejuvenescimento natural, elevação da autoestima, correção específica e prevenção — mas enfrentam barreiras reais:

- **Medo de artificialidade**: receio de ficar com aparência artificial ou exagerada.
- **Medo de dor**: insegurança quanto ao desconforto dos procedimentos.
- **Medo do preço**: receio de custos altos, surpresas ou falta de clareza nos valores.
- **Medo de resultados exagerados**: receio de mudar demais e "perder a própria cara".
- **Medo da privacidade**: receio de exposição de dados, fotos e do próprio tratamento.

Além dos medos, existe um problema prático: agendar um horário, tirar dúvidas e entender os procedimentos costuma ser burocrático, pouco claro e pouco acolhedor.

### Para a clínica (Fabiana Rosa)

O atendimento gera volume de contatos (WhatsApp, telefone, presença) que é difícil de organizar sem apoio digital. Sem sistema, a clínica enfrenta:

- Agenda manual ou espalhada em conversas, com risco de conflito de horários.
- Dificuldade em manter histórico organizado de cada paciente.
- Processo de orçamento e acompanhamento dependente de memória e troca de mensagens.

### O problema central

A paciente de 40 a 60 anos não encontra, nos canais digitais da maioria das clínicas, um espaço que **una acolhimento, clareza, segurança e privacidade** — e a clínica não tem uma ferramenta que apoie isso de forma simples.

---

## 3. Público-alvo e persona principal

### Público-alvo

Mulheres entre **40 e 60 anos**, que buscam tratamento estético com foco em naturalidade, prevenção e manutenção da autoestima.

### Persona principal (a paciente)

**Perfil**: mulher madura, ativa e preocupada com a própria imagem, que deseja envelhecer bem, de forma natural.

**Motivações**:

- Rejuvenescimento natural
- Autoestima
- Correção específica
- Prevenção

**Medos**:

- Artificialidade
- Dor
- Preço sem transparência
- Resultados exagerados
- Exposição da privacidade

**Comportamento esperado**: pesquisa antes de decidir, valoriza depoimentos e provas reais, dá importância ao acolhimento e à confiança no profissional, e decide em um ambiente sem pressão e sem julgamento.

### Persona secundária (a profissional)

**Fabiana Rosa**, proprietária e responsável técnica da clínica. Ela quer um sistema simples de operar, que transmita seriedade e acolhimento às pacientes e que organize o dia a dia sem burocracia.

> Detalhes completos de persona e diretrizes de UX: `docs/product/01-persona-e-ux-40+.md`.

---

## 4. Proposta de valor

**Newestetica é o canal digital que apresenta a clínica da Fabiana Rosa com o mesmo acolhimento de uma consulta presencial: claro, seguro e sem julgamento — enquanto organiza a operação da clínica em um só lugar.**

**Para a paciente:**

- Site que transmite confiança e naturalidade
- Agendamento self-service
- Privacidade respeitada
- Acolhimento em cada etapa

**Para a Fabiana:**

- Controle simples da agenda e dos slots
- Visão organizada de pacientes, histórico e financeiro básico
- Sistema que reforça a marca profissional da clínica

---

## 5. Objetivos do produto

1. Transmitir confiança e naturalidade desde o primeiro contato digital.
2. Permitir agendamento self-service pela paciente, com a clínica no controle dos horários.
3. Organizar a operação da clínica (pacientes, agenda, procedimentos, histórico, financeiro básico e usuários).
4. Proteger a privacidade (fotos e dados somente com consentimento).
5. Educar e gerar confiança através de conteúdo e depoimentos.
6. Ser simples de usar no celular (mobile-first) e para a equipe da clínica.

---

## 6. Escopo do MVP (o que entra)

### 6.1 Site público

| Área | Descrição |
| ------ | ----------- |
| **Home** | Apresentação acolhedora da clínica |
| **Sobre (Fabiana / Clínica)** | História, formação e valores |
| **Catálogo de Serviços / Procedimentos** | Descrição clara dos procedimentos |
| **Antes e Depois** | Galeria de resultados reais (somente com consentimento) |
| **Depoimentos** | Relatos de pacientes |
| **Agendamento online** | Self-service com slots criados pela clínica |
| **Pedido de orçamento** | Solicitação de orçamento personalizado |
| **Contato / WhatsApp** | Canal direto de contato |
| **Blog / Conteúdo educativo** | Artigos que educam e geram confiança |

### 6.2 Painel administrativo

| Área | Descrição |
| ------ | ----------- |
| **Dashboard** | Visão geral da operação |
| **Cadastro e gestão de pacientes** | Registro e manutenção dos dados |
| **Agendamento e agenda da equipe** | Criação de slots e gestão da agenda |
| **Cadastro de procedimentos/serviços** | Manutenção do catálogo |
| **Histórico de atendimentos** | Prontuário simples por paciente |
| **Controle financeiro básico** | Visão financeira essencial |
| **Gestão de usuários** | Fabiana + equipe de recepção |

### 6.3 Regras de agendamento

- A paciente agenda sozinha (self-service).
- A administração cria os slots disponíveis.
- O agendamento gera confirmação por e-mail para a paciente e para a clínica.

---

## 7. Fora de escopo (o que NÃO entra no MVP)

- Backend real e integrações (fase posterior)
- Aplicativo móvel nativo
- Área logada para pacientes
- Pagamento online
- Telemedicina / atendimento remoto
- Financeiro avançado (contabilidade, emissão fiscal, etc.)
- Prontuário médico completo
- CRM avançado com automações complexas
- **Multi-clínica** (no MVP o sistema atende apenas a clínica da Fabiana Rosa; a arquitetura deve nascer preparada para multi-clínica no futuro, sem implementar agora)

> Itens fora desta lista também não entram sem passar pelo processo OpenSpec.

---

## 8. Estratégia de entrega (Frontend-first)

A entrega segue esta ordem:

1. **Frontend com dados mockados** — todas as telas e fluxos do MVP são construídos com dados simulados.
2. **Validação visual com a Fabiana Rosa** — ela valida telas, fluxos, textos e experiência.
3. **Backend real** — somente depois da validação do frontend.

**Motivo**: validar visualmente e barato antes de investir em backend evita construir sobre suposições erradas.

---

## 9. Princípios de produto

### Tom

Acolhedor, caloroso e empático. Comunicação com respeito, sem infantilização e sem julgamento.

### Experiência (UX)

- Mobile-first
- Simplicidade e clareza
- Segurança psicológica (informações claras sobre procedimentos e valores)

### Confiança

- Resultados reais com consentimento
- Depoimentos éticos
- Figura da Fabiana Rosa como autoridade e acolhimento

### Privacidade

- Dados e fotos tratados com máximo respeito
- Consentimento explícito obrigatório
- Segurança desde o desenho (ver `docs/security/03-seguranca.md`)

---

## 10. Critérios de sucesso do MVP

O MVP é bem-sucedido quando:

1. A Fabiana reconhece o produto como dela e aprova telas, textos e fluxos.
2. A paciente consegue agendar sozinha pelo celular, sem ajuda.
3. A clínica controla a agenda e as confirmações chegam por e-mail.
4. O site transmite confiança e endereça os medos do público.
5. A operação (pacientes, agenda, procedimentos, histórico e financeiro básico) cabe no painel.
6. Privacidade é respeitada desde o início (consentimento de fotos e dados).

---

> **Próximas leituras obrigatórias**: `docs/product/01-persona-e-ux-40+.md`, `docs/architecture/02-arquitetura.md`, `docs/security/03-seguranca.md`, `docs/architecture/04-decisoes-tecnicas.md` e `docs/product/05-estado-atual.md`.
