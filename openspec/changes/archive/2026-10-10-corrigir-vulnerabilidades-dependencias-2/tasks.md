# Tasks: corrigir-vulnerabilidades-dependencias-2

## 1. Prova RED — audit reprovando (antes de qualquer mudança)

- [ ] 1.1 Rodar `pnpm audit --audit-level high` e colar a saída com exit 1 (os 3 advisories high: next, sharp, source-map-js).

## 2. Correções de dependências

- [ ] 2.1 `frontend/package.json`: `next` e `eslint-config-next` 16.3.6 → 16.3.8 (fixos, sem `^`). Rodar `pnpm install`.
- [ ] 2.2 Verificar `pnpm why sharp`: se a árvore já resolves `>=0.35.5`, seguir; se sobrar `<0.35.5`, adicionar override `"sharp@<0.35.5": "^0.35.5"` na raiz + `pnpm install`. Registrar a decisão com a evidência do `pnpm why`.
- [ ] 2.3 Adicionar override `"source-map-js@<1.2.2": "^1.2.2"` na raiz + `pnpm install`.

## 3. Prova GREEN — audit passando

- [ ] 3.1 `pnpm audit --audit-level high` com exit 0 (colar saída; moderates pendentes listados).
- [ ] 3.2 `pnpm why next` / `pnpm why sharp` / `pnpm why source-map-js`: nenhuma versão vulnerável restou (`>=16.3.8`, `>=0.35.5`, `>=1.2.2`). Colar.

## 4. Gates e verificação

- [ ] 4.1 Gates nos 3 workspaces: `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm build`. Backend: `make up` antes de `pnpm test`, `make down` depois. Frontend 15 arquivos/109 testes e backend 85/394 (baseline inalterado).
- [ ] 4.2 Docs: `docs/engineering/07-workflow-de-engenharia.md` §14 — registrar o padrão (auditoria quebrando a main por advisories publicados após merges) só se for aprendizado novo. `docs/security/03-seguranca.md`: nada a mudar (aceite do braces intacto) — confirmar.
- [ ] 4.3 Commits semânticos, push, PR sem merge. Colar link.
