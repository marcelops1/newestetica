# Verificação — corrigir-vulnerabilidades-dependencias-2

Change de dependências, sem comportamento de produto (`skip_specs: true`, justificado na proposal). Data: 2026-10-10. Branch: `chore/corrigir-vulnerabilidades-dependencias-2`.

## Prova RED (task 1.1) — audit reprovando a main

`pnpm audit --audit-level high` antes de qualquer mudança:

```
│ high  │ source-map-js allows event-loop denial of service
│ high  │ sharp : Vulnerability in librsvg dependency
│ high  │ Next.js has Server-Side Request Forgery in Image
13 vulnerabilities found
Severity: 1 low | 8 moderate | 4 high (1 ignored)
RED_EXIT=1
```

Caminhos confirmados: `frontend > next@16.3.6 > sharp@0.35.4` e `source-map-js@1.2.1` (32+ paths, incl. backend). Frontend não usa `next/image` (`rg "next/image" frontend --glob '!**/node_modules/**'` → 0 ocorrências, exit 1) — correção exigida só pelo gate.

## Correções aplicadas

- `frontend/package.json`: `next` e `eslint-config-next` 16.3.6 → **16.3.8** (fixos, sem `^`).
- **Override condicional de `sharp` — evidência que decidiu:** após o install com next 16.3.8, `frontend/node_modules/next/package.json` ainda declara `"sharp": "^0.35.4"` (optionalDependencies) e o lockfile manteve `sharp@0.35.4` — `pnpm` fixa a resolução existente dentro do range, não sobe sozinho. Por isso o override **entrou**: `"sharp@<0.35.5": "^0.35.5"` na raiz, no estilo dos existentes.
- Override incondicional: `"source-map-js@<1.2.2": "^1.2.2"` na raiz.

## Prova GREEN (tasks 3.1/3.2) — audit passando + `pnpm why`

```
$ pnpm audit --audit-level high
5 vulnerabilities found
Severity: 4 moderate | 1 high (1 ignored)
GREEN_EXIT=0
```

Zero advisories high não-ignorados. `pnpm why -r` (sem `-r` a saída sai vazia nesta máquina — pnpm 9.15 em workspace):

- `pnpm why -r next` → `frontend ... next 16.3.8`
- `pnpm why -r sharp` → `frontend ... dependencies: next 16.3.8 └── sharp 0.35.5`
- `pnpm why -r source-map-js` → `backend ... @prisma/client 7.10.0 └─┬ prisma ... └── source-map-js 1.2.2` (e demais paths 1.2.2; grep por `1.2.1` no lockfile = 0 ocorrências)

Nenhuma versão vulnerável restou nos 3 pacotes (next >=16.3.8, sharp >=0.35.5, source-map-js >=1.2.2).

## Moderates pendentes (não bloqueiam o gate)

4 moderate restantes, sem ação neste change (escopo = high): `qs` ×3 (DoS em `qs.stringify`, array-limit bypass, DoS via isBuffer) e `fast-uri` ×1 (normalização de host). Gate usa `--audit-level high`; ficam como pendência para rodada futura.

## Gates (task 4.1)

- `pnpm lint` — exit 0 (1 warning pre-existente no frontend, `import/no-anonymous-default-export` em `lint-staged.config.mjs`, fora do escopo).
- `pnpm format` — exit 0.
- `pnpm typecheck` — exit 0 (3 workspaces).
- `pnpm test` (com `make up` antes e `make down` depois): frontend **15 arquivos/109 testes**, contracts 15/80, backend **85/394** — idênticos ao baseline.
- `pnpm build` — exit 0 (sharp com binário nativo linux-x64 resolveu e buildou).
- `pnpm audit --audit-level=high` — exit 0 (GREEN acima).

## Docs (task 4.2)

- `docs/engineering/07-workflow-de-engenharia.md` §14: item 12 registrado — auditoria quebrando a main por advisories publicados **depois** dos merges (padrão recorrente: 2ª rodada em 6 dias), com a técnica (`pnpm` fixa resolução dentro do range → subir a direct dep pode não resolver a transitória; override só com evidência do `pnpm why`).
- `docs/security/03-seguranca.md` §12: **nada mudou** — aceite do `braces` (GHSA-vfj7-8cjw-p6xm, sem versão corrigida) permanece válido e continua único item de `ignoreGhsas`. Novos advisories têm fix publicado, portanto ignorar não se justifica.

## Revisão security-and-hardening (sem gatilho docs/07 §7)

- **Sem gatilho:** nenhum código alterado — apenas versões resolvidas; sem entrada de usuário, auth, dado de paciente ou integração nova. next/sharp/source-map-js sobem para versões com fix publicado (mitigação, não exposição nova).
- **Segredos:** nenhum. Lockfile revisável no diff.
