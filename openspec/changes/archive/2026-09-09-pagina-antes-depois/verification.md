# Verificação — pagina-antes-depois

Revisão com `security-and-hardening` contra `docs/security/03-seguranca.md` (gatilho docs/07 §7: consentimento de imagem / dados de paciente). Data: 2026-09-09.

## Threat model (5 min)

- **Fronteira:** mocks → camada `lib/` → listagem pública `/antes-depois`.
- **Ativo:** consentimento de imagem da paciente (privacidade, docs/03 §5).
- **Abuse case:** caso sem consentimento renderizado publicamente.

## Controles verificados

- [x] Página consome **somente** `getBeforeAfterPageCases()` (`lib/before-after.ts`), que delega a `getVisibleResults()` (`hasConsent === true`); nenhum componente importa `resultsMock` diretamente (grep confirma: só `data.ts` e testes tocam o mock).
- [x] Teste dedicado RED-first (`lib/__tests__/before-after.test.ts`): `resultado-3` sem consentimento nunca aparece; todo caso listado tem painel completo.
- [x] Nenhuma foto real: comparador usa blocos locais; mocks 100% fictícios (nomes, textos, contatos).
- [x] Sem `innerHTML`/`dangerouslySetInnerHTML`/`<img>` no frontend (auto-escape do React intacto).
- [x] Sem segredos, sem auth, sem chamadas de rede (modal segue 100% mockado).
- [x] Home inalterada visualmente: extração literal do comparador (zero classes novas no diff).

## Gates executados (task 4.2)

- `pnpm lint` — passou
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 5 arquivos, 22 testes, cobertura 100% (statements/branches/functions/lines)
- `pnpm build` — passou (`/antes-depois` prerenderizada como estática)
- `openspec validate --all` — 8 passed, 0 failed (INFO pré-existente em `public-site-structure`, fora deste change)

## Backlog e C4

- [x] UC 1.4.1 atualizado em `docs/08`.
- [x] Nova rota/feature altera containers/componentes → C2 (`/antes-depois`) e C3 (`features/results/`, comparador compartilhado) atualizados neste mesmo change; rotas/pastas verificadas em disco.
