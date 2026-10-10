# Design: estender-lint-staged-backend

## Contexto

`lint-staged.config.mjs` (raiz) hoje tem uma única chave (`frontend/**/*.{ts,tsx}`) com função que normaliza caminhos para relativos a `frontend/` e invoca `pnpm -C frontend exec eslint --fix` + `prettier --write`. O padrão v17 (função por glob-key, sem shell, binário real `pnpm`) foi estabelecido no change `instalar-husky-lint-staged` e mantido em `corrigir-dividas-lint-staged` (que ainda provou que o lint-staged v17 já exclui deleções sozinho — sem filtro `existsSync`). Backend e contracts têm seus próprios `eslint.config.mjs` + prettier; o do backend já ignora `src/generated/` nos seus `ignores`.

## Decisões

1. **Duas chaves novas, uma função cada** (`backend/**/*.ts`, `contracts/**/*.ts`), espelhando a do frontend: `path.resolve("backend")` / `path.resolve("contracts")`, `path.relative` por pasta, `pnpm -C <pasta> exec`. Cada pasta resolve seu próprio config via CWD — zero config nova, zero dependência nova.
2. **Só `.ts`, sem `.tsx`**: verificado 0 arquivos `.tsx` em `backend/src` e `contracts/src`. YAGNI — o CI cobre o que o hook não vir; estender depois custa uma string no glob.
3. **Exclusão de `backend/src/generated/**` no filtro da função** (defesa em profundidade além do `ignores` do eslint do backend): passar path gerado explicitamente ao eslint v9 produz warning "file ignored" e ao prettier reescreveria código gerado — ambos indesejados. O filtro remove esses paths antes da invocação; se sobrar lista vazia, retorna `[]` (sem comando). Contracts não tem gerado — sem filtro lá.
4. **Sem `fs.existsSync`**: precedente do change de dívidas (lint-staged v17 já exclui deletados); não reintroduzir sem problema real.
5. **Docs junto no mesmo change**: a nota das camadas em docs/07 §"Camadas de defesa" lista o escopo; 05-estado-atual remove ressalva. Sem spec nova além do delta (extensão de requirement existente).

## Alternativas consideradas

- **Uma única chave com CWD dinâmico por arquivo**: quebraria o modelo v17 (uma função por glob, um CWD por invocação) e misturaria configs — rejeitada.
- **Confiar só no `ignores` do eslint do backend para `generated/`**: deixaria o prettier reescrever gerado e poluiria a saída com warnings — rejeitada; filtro na função + `ignores` = duas camadas.
- **Cobrir `.tsx` "por precaução"**: sem nenhum arquivo existente, o glob mais largo só adiciona superfície sem teste real — rejeitada (YAGNI).

## Riscos

- **Paths com espaço/unicode**: mesmo tratamento do frontend (`JSON.stringify` por path) — já provado.
- **Hook em sessões de agente não-interativas**: incerteza explícita no escopo (item 3) — será verificada com commit real na sessão e registrada; se não rodar, o gate manual (gates + CI) é documentado como compensação. Não bloqueia o change.
- **Divergência futura frontend/backend/contracts**: aceita — cada pasta evolui seu config; o hook só invoca.
