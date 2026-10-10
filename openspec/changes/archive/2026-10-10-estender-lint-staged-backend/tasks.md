# Tasks: estender-lint-staged-backend

## 1. Prova RED — o hook ignora backend/ e contracts/ hoje

- [ ] 1.1 Criar scratch sujo (erro corrigível: formatação) em `backend/` (ex.: `backend/scratch-lint-probe.ts` com `const  x=1`) e em `contracts/` (ex.: `contracts/scratch-lint-probe.ts`), stagear os dois, commitar e colar a saída provando que o hook NÃO disparou para eles (commit criado sem correção). Limpar com `git reset` (sem commitar scratch).

## 2. Implementação — duas chaves novas no lint-staged.config.mjs

- [ ] 2.1 Estender `lint-staged.config.mjs`: chaves `backend/**/*.ts` e `contracts/**/*.ts`, cada uma com função própria (`pnpm -C backend exec` / `pnpm -C contracts exec`, paths relativos à pasta, `JSON.stringify` por path), com filtro excluindo `backend/src/generated/**` (retorna `[]` se vazio). Sem `.tsx`, sem `existsSync` (ver design).

## 3. Prova GREEN — corrigível corrige, não-corrigível barra, gerado ignora

- [ ] 3.1 GREEN corrigível: scratch com erro de formatação em `backend/` e em `contracts/`, stagear, commitar — colar saída provando que o hook corrigiu e o commit saiu com exit 0. Reset (scratch fora).
- [ ] 3.2 GREEN não-corrigível: scratch com erro que `--fix` não resolve (ex.: variável não-usada / `no-unused-vars`) em `backend/` e em `contracts/` — colar saída provando `husky - pre-commit script failed (code 1)` e nada commitado. Reset (scratch fora).
- [ ] 3.3 GREEN gerado: stagear toque sob `backend/src/generated/` (ex.: linha em branco no fim de arquivo gerado — restaurar depois) e provar que o hook não invoca eslint/prettier sobre ele. Restaurar o arquivo (checkout), sem commitar gerado.

## 4. Comportamento em sessão de agente + docs

- [ ] 4.1 Registrar se os commits de prova acima rodaram o hook nesta sessão não-interativa (sim/não + evidência). Se não, documentar causa provável e o gate manual que compensa (gates da raiz + CI).
- [ ] 4.2 Atualizar `docs/engineering/07-workflow-de-engenharia.md` (nota das camadas: listar `frontend/`, `backend/`, `contracts/` + exclusão do gerado) e `docs/product/05-estado-atual.md` (remover ressalva "só cobre frontend"; se a redação atual já for neutra, registrar que nada havia a remover).

## 5. Gates, validação e entrega

- [ ] 5.1 Rodar gates da raiz: `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm audit --audit-level=high`. Colar resumo.
- [ ] 5.2 `pnpm exec openspec validate --all` (ou `--changes`, justificar se `--all` for inviável). Commit semântico, push, abrir PR sem merge. Colar link do PR.
- [ ] 5.3 Archive do change (spec sincronizada). `skip_specs`: NÃO se aplica — há delta de spec (requirement MODIFIED). `security-and-hardening`: sem gatilho docs/07 §7 (tooling puro, sem entrada/auth/dado/integração) — registrar justificativa no verification.md em vez de revisão completa.
