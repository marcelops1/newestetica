## Context

Ver `proposal.md` (Why). Ponto de partida: UC 6.3.1 "Não iniciado" com aceite de deploy reproduzível; UC 6.1.1 cobre os gates de CI (ator Pipeline — precedente de UC de pipeline sem paciente); pre-commit hook instalado e provado (`instalar-husky-lint-staged`: RED sem hook, GREEN corrigindo e barrando, ~2s por arquivo); decisões Vercel/Docker registradas em 04 §§18–19; site em produção verificado vivo por fetch nesta proposta (home completa, footer com Blog/Contato, CTA Orçamento); tabela-resumo com Épico 6 em 3 UCs e total 37.

## Goals / Non-Goals

**Goals:**

- Backlog do Épico 6 volta a descrever a realidade (deploy manual em produção, gate local existente), sem inventar status e com cada afirmação verificável.

**Non-Goals:**

- Automatizar o deploy, mudar specs, backlog fora do Épico 6 ou código; reavaliar o mérito das decisões Vercel/Docker.

## Decisions

### 1. UC 6.3.1 reescrito (Em andamento, deploy manual honesto)

Novo texto (integral, substitui o bloco atual):

```markdown
**Use Case 6.3.1 — Publicar a aplicação**

- **Ator principal:** Equipe (deploy manual).
- **Pré-condição:** Build verde e segredos fora do código.
- **Fluxo principal:**
  1. A equipe publica o frontend via deploy manual (Vercel CLI); o site público fica disponível em produção.
  2. Backend: nada implantado (aguarda Épicos 2+ e contratos).
- **Fluxos alternativos/exceção:** Falha no deploy → nova tentativa manual; rollback via redeploy da versão anterior estável na plataforma.
- **Critérios de aceite:**
  - Frontend acessível em produção a partir de build verde, sem segredos no código.
  - Deploy automático/reproduzível por push: evolução futura, ainda não implementada.
- **Status atual:** Em andamento (frontend em produção na Vercel; backend não implantado).
- **Gatilho de segurança:** revisão obrigatória com security-and-hardening (docs/07 §7).
```

Rationale: o aceite antigo ("reproduzível") descrevia o futuro; o novo descreve o presente verificado e marca o futuro como futuro. URL de produção intencionalmente fora do texto (domínio customizado futuro a tornaria instável; a prova de vida está nesta proposta e na verificação do apply). Alternativa considerada: manter "Não iniciado" até o deploy automático (rejeitada — esconderia que há produção no ar, o oposto do propósito do backlog).

### 2. Novo UC 6.1.2 na Feature 6.1 (não nova Feature) + tabela-resumo

Novo texto:

```markdown
**Use Case 6.1.2 — Barrar erro de lint/format antes do commit local**

- **Ator principal:** Desenvolvedor/IA (autor do commit).
- **Pré-condição:** Hooks ativos (`pnpm install` executado).
- **Fluxo principal:**
  1. O autor commita arquivos `.ts`/`.tsx` em `frontend/`.
  2. O hook pre-commit roda `eslint --fix` e `prettier --write` via lint-staged.
  3. Erro corrigível é corrigido e entra no commit; erro não-corrigível barra o commit.
- **Fluxos alternativos/exceção:** Autor usa `--no-verify` → commit passa sem o gate local (CI continua autoritativo).
- **Critérios de aceite:**
  - Erro corrigível entra corrigido; erro não-corrigível bloqueia o commit local.
- **Status atual:** Concluído (change `instalar-husky-lint-staged` arquivado, com prova executável RED→GREEN).
```

Tabela-resumo: Épico 6 passa a 3 features / 4 UCs com status "Em andamento (CI e pre-commit concluídos; frontend em produção manual; observabilidade e backend pendentes)"; total passa a 26 features / 38 UCs.

Rationale: um UC não justifica Feature nova; 6.1 é a casa da pipeline de qualidade e o UC 6.1.1 (ator Pipeline) é o precedente de UC sem paciente. Registro honesto: o change `instalar-husky-lint-staged` declarou "sem Use Case correspondente" — esta proposta **reverte esse registro deliberadamente**, porque mapear só o gate de CI e omitir o gate local (provado, executável, com ator) é inconsistente dentro do próprio Épico 6.

### 3. Vercel/Docker sem Use Case próprio

Rationale: UCs descrevem capabilities executáveis/operacionais com ator, fluxo e aceite; registro de decisão não é capability — sua casa autoritativa é 04 §§18–19 (com menção no 05), por regra do §17. Um UC "registrar decisão" seria meta-processo, não escopo de produto. Alternativa considerada: UC de "decisão registrada" (rejeitada — precedente ruim: toda ADR viraria UC e o backlog incharia com meta-trabalho).

### 4. `skip_specs: true`, sem delta

Rationale: backlog não é `openspec/specs/`; nenhum requirement muda. Alternativa considerada: delta vazio (rejeitada — `openspec validate` rejeita sem o marcador).

## Risks / Trade-offs

- [Risco] Backlog inchar com UCs de processo → Mitigação: só gates executáveis com ator entram (CI 6.1.1 e pre-commit 6.1.2); ferramentas sem comportamento observável continuam fora.
- [Trade-off] Reverter o "sem UC" registrado no change do husky → aceito e declarado acima; consistência do Épico 6 vale mais.
