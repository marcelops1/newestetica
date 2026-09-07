# Change: reorganizacao-documentacao

## Why

Os 9 documentos de `docs/` (mais protótipos) vivem todos no mesmo nível, sem separação por tema (produto, arquitetura, segurança, engenharia). Com o crescimento (08-backlog, futuro C4, ADRs), a pasta fica ilegível para IAs e humanas. Reorganizar por tema, preservando histórico via `git mv`, antes que mais docs nasçam no lugar errado.

## What Changes

- Nova estrutura temática de `docs/` (product, requirements, architecture + `adr/`, security, engineering, qa, data, infra) com `README.md` mapa na raiz e por pasta nova.
- Movimentação com `git mv` (histórico preservado): 00, 01, 05, 06, 08 → `product/`; 02, 04 → `architecture/`; 03 → `security/`; 07 → `engineering/`; protótipos acompanham o tema (a definir no apply, sem quebrar links).
- Atualização de TODAS as referências aos caminhos antigos em `AGENTS.md`, `frontend/AGENTS.md`, `backend/AGENTS.md` e nas referências cruzadas internas dos próprios docs.
- Seção 7 do `AGENTS.md` atualizada com os papéis reais de cada modelo (GLM-5.3, DeepSeek V4 Flash, DeepSeek V4 Pro, Muse Spark), mantendo escolha livre.
- Explicitamente fora: qualquer código de produto, backend, telas, mudança de escopo, alteração de conteúdo dos docs (só caminhos + seção 7).

## Capabilities

### New Capabilities

- `docs-organization`: estrutura temática de `docs/` com READMEs mapa, movimentação via `git mv` e referências atualizadas.

### Modified Capabilities

- Nenhuma (nenhum requirement de comportamento muda).

## Impact

- Pastas afetadas: `docs/`, `AGENTS.md`, `frontend/AGENTS.md`, `backend/AGENTS.md`, `openspec/` (nova spec).
- Nenhum código de produto muda; quality gates só confirmam que nada quebrou.
