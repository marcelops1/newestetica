## 0. Prova de base (caracterização, sem mudança de comportamento)

- [x] 0.1 Executar a suíte backend completa antes de mover qualquer arquivo e registrar o baseline verde — exceção docs/07 §4 (leitura/registro, sem mudança de comportamento). Verificação: suite verde anotada como referência do "nada quebrou". Execução: **36 arquivos / 147 testes verdes**, cobertura statements 99,7% (335/336), branches 97,01%, functions 100%, lines 99,69%

## 1. ZodValidationPipe compartilhado

- [ ] 1.1 Escrever `backend/src/shared/http/zod-validation.pipe.spec.ts` (válido aprova, inválido reprova com o formato único de erro) importando o pipe do caminho compartilhado e constatar que falha (arquivo inexistente) — RED. Verificação: `Cannot find module`
- [ ] 1.2 Criar `backend/src/shared/http/zod-validation.pipe.ts` (idêntico ao atual), migrar os 3 módulos para importar dele e remover as cópias locais — GREEN. Verificação: suíte backend verde + `grep -rn "class ZodValidationPipe" backend/src` retorna só o compartilhado

## 2. Base DomainError compartilhada

- [ ] 2.1 Escrever o spec da base genérica (`backend/src/shared/errors/domain-error.spec.ts`: constrói com código arbitrário, preserva `code`/`message`, `name` é o da subclasse concreta) e constatar que falha — RED. Verificação: `Cannot find module`
- [ ] 2.2 Criar `backend/src/shared/errors/domain-error.ts` (`DomainError<Code extends string>`), migrar os 3 `errors.ts` (union local + subclasse fina herdando o construtor, classes concretas intocadas) — GREEN. Verificação: suíte backend verde + typecheck limpo + `grep` confirma nenhum `extends Error` direto fora do compartilhado

## 3. Base DomainExceptionFilter compartilhada

- [ ] 3.1 Escrever o spec da base (`backend/src/shared/http/domain-exception.filter.spec.ts`: com subclasse de teste, erro mapeado → status do mapa; erro fora do mapa → 422; corpo `{code, message}` sem stack) e constatar que falha — RED. Verificação: `Cannot find module`
- [ ] 3.2 Criar a base abstrata (`catch` + `statusFor` protegido com default 422) e as subclasses finas por módulo com os mapas atuais (scheduling 404/409, catalog/content 404) — GREEN. Verificação: suíte backend verde (os testes HTTP 404/409/422 existentes provam os mapas preservados) + `grep` sem `class DomainExceptionFilter` fora do compartilhado e das 3 subclasses

## 4. Factory de PrismaClient compartilhada

- [ ] 4.1 Escrever o spec da factory (`backend/src/shared/prisma/client-factory.spec.ts`: sem `DATABASE_URL` → throw com a mensagem atual; com URL → instancia `PrismaClient` sem conectar) e constatar que falha — RED. Verificação: `Cannot find module`
- [ ] 4.2 Criar `createPrismaClientFromEnv` em `backend/src/shared/prisma/client-factory.ts` e migrar os 3 módulos (providers usam a factory; **instâncias continuam por módulo** — trigger da decisão 8 intacto) — GREEN. Verificação: suíte backend verde + `grep -rn "new PrismaClient" backend/src` retorna só a factory

## 5. Escopo do Sonar + docs de arquitetura

- [ ] 5.1 Criar `.sonarcloud.properties` na raiz com `sonar.cpd.exclusions=backend/test/**,**/*.spec.ts` — exceção docs/07 §4 (configuração pura). Verificação: arquivo com o conteúdo exato da decisão 7 (a eficácia é medida no aceite 6.3, não aqui)
- [ ] 5.2 Emendar `docs/architecture/02-arquitetura.md` §3 (exceção do kernel técnico com regra de filiação), registrar a decisão em `docs/architecture/04-decisoes-tecnicas.md` e adicionar a subseção do kernel em `docs/architecture/c3-component.md` — exceção docs/07 §4 (docs). Verificação: releitura confirma os três registros
- [ ] 5.3 Dar baixa na pendência em `docs/product/05-estado-atual.md` (remover a linha, apontando este change) e estender `backend/stryker.config.mjs` (`src/shared/**` no `mutate`, para o código movido continuar medido) — exceção docs/07 §4 (docs + config pura). Verificação: releitura + `grep` do padrão no config

## 6. Gates, aceite Sonar e registros

- [ ] 6.1 Rodar gates completos (lint, format, typecheck, test com cobertura ≥80%, build) + `pnpm audit --audit-level high` e registrar em `verification.md`. Verificação: tabela de gates no registro
- [ ] 6.2 Revisar com `code-review-and-quality` e com `security-and-hardening` (foco: nenhum mapeamento/erro/status alterado; sem nova superfície; direção shared→módulos intacta) e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisões registradas
- [ ] 6.3 Abrir o PR e confirmar **Sonar Duplication on New Code ≤3%** (aceite final da decisão 1); se o `.sonarcloud.properties` for ignorado, aplicar a mesma exclusão via UI (admin) e registrar o valor exato no repo (fallback da decisão 7). Verificação: check verde ou registro do fallback
- [ ] 6.4 Escrever `verification.md`, arquivar (`openspec-archive-change`, sem sync — `skip_specs`) e rodar `openspec validate --all`. Verificação: change arquivado; validate passa
