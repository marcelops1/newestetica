## 0. Setup do módulo (test-first de wire-up)

- [x] 0.1 Executar `pnpm --filter backend test` filtrado ao novo módulo e constatar que falha (pacote `catalog/` inexistente) — RED. Verificação: `Cannot find module` ou filtro sem arquivos. Execução: `No test files found, exiting with code 1` (RED real)
- [x] 0.2 Criar `backend/prisma/schema.prisma` com o modelo `Procedure` (incluindo `isActive`) + migration inicial + seed fictício alinhado aos mocks, e configurar `prisma db seed` — GREEN parcial. Verificação: `prisma migrate deploy` aplica limpo no banco de teste e o seed popula sem erro. Execução: modelo `Procedure` (`categories String[]`, `isActive Boolean @default(true)`) + migration `20260924132917_add_procedure` aplicada; seed em `prisma/seed.mjs` (7 fictícios, 1 inativo) via `migrations.seed` no `prisma.config.ts`; `prisma db seed` → "Seed do catálogo aplicado: 7 procedimentos fictícios (1 inativo)" e conferido no banco (7/6 ativos). Nota: o seed em TS falhou sob o ESM nativo do Node (cliente Prisma gerado é TS/CJS com imports sem extensão) — `.mjs` + `pg` parametrizado, sem toolchain extra

## 1. Domain — Procedure e a invariante "só ativos" (unitários puros)

- [ ] 1.1 Escrever o teste da entidade `Procedure` (criação com campos válidos; `id`/campos vazios rejeitados; `isActive` default verdadeiro) e verificar que falha porque a entidade não existe — RED. Verificação: `Cannot find module`
- [ ] 1.2 Criar `domain/entities/procedure.entity.ts` (classe pura, sem decorators, sem imports externos) e verificar que o teste passa — GREEN. Verificação: teste da task 1.1 passa
- [ ] 1.3 Escrever o teste das portas (`ProcedureRepository` com `findActive`/`findActiveByCategory`/`findActiveBySlug`, compilando contra fake manual) e verificar que falha — RED. Verificação: falha de compilação/tipo (precedente da task equivalente no scheduling)
- [ ] 1.4 Criar `domain/ports/*.ts` (só interfaces + tipos, zero implementação) e verificar verde + auditoria de imports (`domain/` sem imports externos) — GREEN. Verificação: typecheck limpo e `grep` de imports externos vazio

## 2. Application — casos de uso contra portas com fake em memória

- [ ] 2.1 Escrever o teste de listar/filtrar/buscar (só ativos; categoria filtra; slug encontra; slug inativo ou inexistente → `ProcedureNotFound` indistinguível) com fakes e verificar que falha — RED. Verificação: `Cannot find module`
- [ ] 2.2 Implementar os casos de uso dependendo só das portas e verificar verde — GREEN. Verificação: testes da task 2.1 passam, sem importar `infrastructure/`
- [ ] 2.3 Escrever o teste adversarial com payload hostil real (categoria com injeção `' OR '1'='1`, slug gigante/malformado, strings acima de qualquer limite razoável) e verificar o comportamento seguro — RED. Verificação: teste falha (módulo de validação/filtro ausente ou aceita o hostil)
- [ ] 2.4 Implementar o tratamento (validação de enum na fronteira + queries parametrizadas + limites) e verificar verde — GREEN. Verificação: hostil rejeitado ou neutralizado sem erro interno vazado

## 3. Infrastructure — Prisma + Postgres real em container

- [ ] 3.1 Escrever o teste de integração do repositório (round-trip; `findActive` exclui inativos; `findActiveByCategory` filtra; `findActiveBySlug` ignora inativo) e verificar que falha — RED. Verificação: falha de conexão/schema ausente ou módulo inexistente
- [ ] 3.2 Criar o modelo Prisma + mapper manual (Data Mapper, nunca Active Record; modelo do ORM nunca cruza para o domínio) e implementar o repositório — GREEN. Verificação: testes passam contra Postgres real em container, banco de teste isolado

## 4. Presentation — controller com validação Zod

- [ ] 4.1 Escrever o teste de contrato da Presentation (`GET /procedures` e `GET /procedures/:slug` com corpo validado contra `ProcedureSchema`; categoria inválida → 422; slug inexistente/inativo → 404 idêntico) e verificar que falha — RED. Verificação: 404 de rota ou `Cannot find module`
- [ ] 4.2 Criar controller + `CatalogModule` (mesmo padrão de wiring do `SchedulingModule`, sem `UnitOfWork`) e verificar verde de ponta a ponta — GREEN. Verificação: testes passam contra o app com banco de teste
- [ ] 4.3 Escrever o teste de saída conforme o contrato (corpos validados contra os schemas nas duas pontas, 07 §13) e verificar que falha antes do ajuste — RED. Verificação: divergência reprova
- [ ] 4.4 Ajustar o formato de saída até zerar a divergência — GREEN. Verificação: teste passa; nenhuma divergência nova

## 5. Mutation, segurança, registros e backlog

- [ ] 5.1 Rodar Stryker contra o módulo (`pnpm --filter backend mutation`, banco de teste no ar) e registrar score real + triagem de sobreviventes em `verification.md` — GREEN. Verificação: relatório completo no registro (meta docs/07 §13)
- [ ] 5.2 Revisar segurança com `security-and-hardening` contra `docs/security/03-seguranca.md` (gatilhos: entrada pública sem auth, enumeração, DoS de listagem) e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada
- [ ] 5.3 Revisar com `code-review-and-quality` e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada
- [ ] 5.4 Atualizar `docs/product/08-backlog-produto.md` (UC 4.2.2 → Em andamento) e avaliar `c2/c3-component.md` — exceção docs/07 §4 (verificação por releitura). Verificação: releitura confirma os status
- [ ] 5.5 Avaliar a complexidade da sessão (emendas? padrões reutilizáveis?) e alimentar a seção 14 de docs/07 ou registrar a dispensa com motivo — exceção docs/07 §4. Verificação: seção 14 atualizada ou dispensa justificada em `verification.md`
