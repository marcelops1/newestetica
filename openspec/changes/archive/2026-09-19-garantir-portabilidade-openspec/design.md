## Context

Ver `proposal.md` (Why). Ponto de partida verificado por comando: global `@fission-ai/openspec@1.12.0`, `openspec --version` → 1.12.0, registry `openspec` → `0.0.0` (só metadata, nada executado), `node_modules/.bin/openspec` inexistente no repo, pnpm 9.15.0 + Node 24 + store warm, lockfile presente na raiz. Zero ocorrências de `npx openspec` no repo; comandos bare `openspec ...` vivem em 88 linhas de skills vendored (`.opencode/skills`, `.agents/skills`, conteúdo upstream duplicado) e em 2 menções na tabela de `docs/07`; `AGENTS.md` não cita o CLI como comando.

## Goals / Non-Goals

**Goals:**

- Qualquer máquina/IA com Node 24 + pnpm 9.15 roda o workflow OpenSpec após `pnpm install`, sem instalação global prévia — provado em ambiente limpo.

**Non-Goals:**

- Mudar specs, backlog, código de produto ou CI; reescrever skills vendored; reavaliar o CLI escolhido.

## Decisions

### 1. Pin exato `1.12.0` + script `"openspec": "openspec"`; forma canônica `pnpm exec openspec`

Rationale: mesma versão já em uso (zero código novo em execução); pin exato impede drift silencioso; script dá descobribilidade (`pnpm run` lista), `exec` dispensa indireção. Alternativas consideradas: range `^` ou `latest` (rejeitadas — drift); só documentar sem declarar a dep (rejeitada — não resolve a portabilidade); `npx` (rejeitada — baixa o pacote errado, fato central do change).

### 2. Regra no `AGENTS.md` + 2 menções do docs/07; skills vendored intactas

Rationale: reescrever 88 linhas em ~16 arquivos upstream duplicados cria divergência permanente a cada atualização de skill; a cláusula de prevalência do `AGENTS.md` ("em conflito, este arquivo vence") já cobre agentes que lerem exemplos bare nas skills. Alternativas consideradas: reescrever skills (rejeitada — churn upstream); confiar em `PATH` com `.bin` (rejeitada — shell de cada agente é incontrolável).

### 3. Prova sem mutar a máquina nem executar o pacote errado

Rationale: RED = `npm view openspec version` (→ `0.0.0`, prova que `npx` buscaria o pacote errado) + binário local inexistente + `pnpm exec` falhando hoje; GREEN = versão + caminho resolvido dentro do workspace. Alternativas consideradas: executar `npx openspec` de verdade (rejeitada — risco supply-chain ao rodar binário desconhecido); mover o global de lado (rejeitada — mutação desnecessária da máquina; prova por caminho resolvido é suficiente).

### 4. Clean test com `rm -rf node_modules` (raiz + frontend) + `pnpm install` do zero

Rationale: prova reprodutibilidade a partir do lockfile; store warm deixa rápido. A task inclui revisar o diff do lockfile e checar install scripts executados. Alternativa considerada: confiar só no install incremental (rejeitada — não prova ambiente limpo).

### 5. `skip_specs: true`; TDD só onde há comportamento executável

Rationale: docs de tooling não mudam requirements; instalação/teste de funcionamento são comportamento real testável (sem exceção §4); escrita de docs usa a exceção §4 registrada por task. Seção multi-IA no `README.md` (porta de entrada do projeto), não no docs/07 (que é sobre o fluxo, não sobre quem trabalha).

## Risks / Trade-offs

- [Risco] Lockfile com diff inesperado além da dep → Mitigação: revisão do diff na task; `pnpm-lock.yaml` versionado permite inspeção.
- [Risco] Install scripts da nova dep → Mitigação: checagem explícita na task; mesmo código já executado globalmente (pin não adiciona superfície nova, só auditabilidade).
- [Trade-off] `node_modules` removido e reinstalado no ciclo → aceito: reversível, store warm, lockfile garante o mesmo grafo.
