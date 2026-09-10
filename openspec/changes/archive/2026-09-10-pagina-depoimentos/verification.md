# Verificação — pagina-depoimentos

Revisão com `security-and-hardening` contra `docs/security/03-seguranca.md` (docs/07 §7). Data: 2026-09-10.

## Threat model (5 min)

- **Fronteira:** mocks → camada `lib/` → renderização pública (`/depoimentos` e seção da home).
- **Ativo:** privacidade da paciente (dados de depoimento, docs/03 §11).
- **Abuse case (OWASP A03/XSS):** um texto de depoimento contendo marcação (`<script>`, `&`, `<`) ser interpretado como HTML.

## OWASP / escaping (docs/07 §13 + cenário do spec)

- [x] **Grep:** nenhum `innerHTML` nem `dangerouslySetInnerHTML` no frontend (`rg` sem resultados) — todo texto é renderizado como nó de texto via auto-escape do React.
- [x] Citação e autor entram como `{item.quote}` / `{item.author}` (texto), nunca como HTML cru.
- [x] Spec scenario "Texto de marcação nunca vira HTML" registrado no delta `public-site-structure`.
- [x] **Dados fictícios:** autores no padrão "Primeiro nome + inicial" (Mariana S., Camila R., Patricia B., Cristina M., Helena D.), contexto "Paciente ilustrativa" — nenhum nome completo real; verificado nos 5 itens.

## Aplicação da seção 13 (registro de aplicados e dispensas)

- **Aplicado — unitários com edge cases:** `initialsOf` (nome único, 3 partes, espaço duplo — bug `"Mundefined"` corrigido) + `getTestimonialsPageCases` (campos não-vazios).
- **Aplicado — contrato/schema:** `getTestimonialsPageCases()` como fronteira mock ↔ UI; `data.test.ts` de contrato intacto.
- **Aplicado — integração do fluxo:** navegação home → `/depoimentos` (link + rota prerenderizada + typecheck).
- **Dispensado — mutation:** lógica trivial (split/filter/map/slice), sem negócio sensível.
- **Dispensado — falha/resiliência:** mock estático tipado, sem dependência externa nem dado malformado possível.
- **Dispensado — E2E:** página estática de leitura; jornada de alto valor é agendamento.
- **Dispensado — carga:** sem requisito de performance.
- Registro em `verification.md` conforme docs/07 §13 ("registrado quando aplicado ou quando dispensado").

## Gates executados (task 3.2)

- `pnpm lint` — passou
- `pnpm format` — passou
- `pnpm typecheck` — passou
- `pnpm test` — 6 arquivos, 26 testes, cobertura 100% (statements/branches/functions/lines)
- `pnpm build` — passou (`/depoimentos` prerenderizada como estática)
- `openspec validate --all` — 8 passed, 0 failed (INFO pré-existente em `public-site-structure`)

## Backlog e C4

- [x] UC 1.5.1 atualizado em `docs/08`.
- [x] Nova rota/feature altera containers/componentes → C2 (`/depoimentos`) e C3 (`features/testimonials/`, helper `initialsOf` em `lib/`) atualizados neste mesmo change; rotas/pastas verificadas em disco.