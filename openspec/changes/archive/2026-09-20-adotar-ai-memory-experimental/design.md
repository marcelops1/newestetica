## Context

Ver `proposal.md` (Why). Ponto de partida verificado por leitura: 04 termina em §18 Vercel, §19 Docker (com nota de roadmap K8s) e §20 Referências — a nova decisão entra como §20 e Referências vai a §21 (nenhuma referência externa a números de seção além do padrão já debts; checar por grep no apply, como no change Vercel/Docker). 03 tem 13 seções (§4 LGPD com dados do MVP e regras; §10 proibições; §11 mocks sem dados reais). `AGENTS.md` §12 lista skills com mapeamento e a cláusula "em conflito, este arquivo vence" (linha 234). Instalação real do servidor + hooks: fora, na máquina do usuário. Specs existentes: nenhuma espelha decisões do 04, regras do 03 ou notas do AGENTS como SHALL.

## Goals / Non-Goals

**Goals:**

- Decisão, regra de segurança e nota registradas no formato vigente, rastreáveis e sem decisão implícita sobre captura de sessão.

**Non-Goals:**

- Instalar o servidor, configurar hooks, mudar specs, backlog ou código; reavaliar o mérito da ferramenta além do registrado.

## Decisions

### 1. §20 em 04 + Referências→§21, no formato Escolhido/Motivos/Alternativas/Implicações

Rationale: segue o padrão das §§18–19; renumerar uma seção é seguro pelo precedente (grep provou zero refs externas da última vez; re-checar no apply). Conteúdo conforme escopo: experimental/não-obrigatória; complementar (não substituta) do OpenSpec; dev-only, nunca produção/VPS/Kubernetes; separada do compose. Alternativas consideradas: ADR separado (rejeitada — 04 é a fonte oficial e §17 autoriza documentar nele); não registrar e instalar direto (rejeitada — decisão implícita sobre ferramenta com acesso a sessões é exatamente o risco).

### 2. Regra em 03 §4 (Proteção de Dados), não em §10

Rationale: a regra é sobre **dados** (nunca capturar dado real de paciente; reforçar via path-exclusion/allowlist antes do backend com dados reais), não sobre proibição de implementação de produto — §4 é a casa temática; §10 lista proibições de código do MVP. Inclui o gatilho temporal explícito (revisão obrigatória antes de dado real existir). Alternativa considerada: item na lista do §10 (rejeitada — §10 é sobre o que o produto não faz; a regra é sobre como operar ferramenta de sessão, com condição futura).

### 3. Nota no AGENTS §12 com prevalência explícita

Rationale: §12 já é a seção de tooling de agentes (skills + mapeamento); a nota usa a mesma cláusula de prevalência existente — opcional, experimental, AGENTS vence em conflito. Alternativa considerada: seção nova no AGENTS (rejeitada — YAGNI para 3–4 linhas; §12 é o contexto certo).

### 4. `.ai-memory.toml` adiado para o change de instalação

Rationale: sem servidor instalado, o arquivo seria config morta sem nada para rotear; monorepo routing só faz sentido com a ferramenta operando. Alternativa considerada: criar vazio/mínimo agora (rejeitada — config sem consumidor apodrece; YAGNI).

### 5. `skip_specs: true`, sem delta

Rationale: nenhuma spec (`architecture-docs`, `engineering-workflow`, demais) declara SHALL sobre decisões do 04, regras do 03 ou notas do AGENTS — o conteúdo novo é normativo em docs, não em specs. Delta idêntico seria vazio; inventar texto violaria as regras. Alternativa considerada: delta MODIFIED para "documentar" (rejeitada — merge no-op, só ruído).

## Risks / Trade-offs

- [Risco] Registro sem enforcement: IAs podem ignorar a regra de captura → Mitigação: honesto no texto (é regra de conduta para humanos + IAs com citação explícita no AGENTS, não gate automatizável agora); o reforço técnico (path-exclusion) tem gatilho temporal amarrado ao backend com dados reais.
- [Trade-off] Nenhum relevante: só texto, sem comportamento.
