## 0. Setup do módulo (test-first de wire-up)

- [x] 0.1 Executar `pnpm --filter backend test` filtrado ao novo módulo e constatar que falha (pacote `content/` inexistente) — RED. Verificação: `Cannot find module` ou filtro sem arquivos. Execução: `No test files found, exiting with code 1` (RED real)
- [x] 0.2 Criar `backend/prisma/schema.prisma` com os modelos `Testimonial`, `Post` e `BeforeAfterCase` (`hasConsent Boolean @default(false)` — fail-closed) + migration inicial + seed fictício alinhado aos mocks (com variantes com e sem consentimento), e configurar `prisma db seed` — GREEN parcial. Verificação: `prisma migrate deploy` aplica limpo no banco de teste e o seed popula sem erro. Execução: modelos + migration `20260924195938_add_content` (aplicada no dev e no test via `migrate deploy`); seed estendido (`prisma/seed.mjs`) com 5 depoimentos, 4 posts e 3 casos de antes/depois fictícios (1 sem consentimento) via `pg` parametrizado/upsert; `prisma db seed` → "5 fictícios / 4 fictícios / 3 casos (1 sem consentimento)"; `prisma generate` rodado para o cliente novo

## 1. Domain — entidades e a invariante "nada sem consentimento" (unitários puros)

- [x] 1.1 Escrever o teste das entidades (`Testimonial`/`Post`/`BeforeAfterCase`: criação com campos válidos; campos vazios rejeitados; `hasConsent` default fechado `false`; `restore` preserva e valida) e verificar que falha porque as entidades não existem — RED. Verificação: `Cannot find module`. Execução: RED real (`Cannot find module '../errors/errors'` nos 3 specs)
- [x] 1.2 Criar `domain/entities/*.ts` (classes puras, sem decorators, sem imports externos; vocabulário próprio só onde o contrato não é fonte) e verificar que o teste passa — GREEN. Verificação: teste da task 1.1 passa. Execução: 3 entidades + erros locais (`InvalidContent`/`PostNotFound`); 14/14 verdes; `hasConsent` nasce `false` no `create` (fail-closed) e `restore` preserva; `Post` valida data AAAA-MM-DD e parágrafos
- [x] 1.3 Escrever o teste das portas (`TestimonialRepository.findAll`, `PostRepository.findAll`/`findBySlug`, `BeforeAfterCaseRepository.findConsented`, compilando contra fakes manuais) e verificar que falha — RED. Verificação: falha de compilação/tipo (precedente do Catálogo). Execução: RED de tipo real (3× `TS2307` nos fakes ao implementar as portas ausentes); em runtime o import de tipo é apagado (mesmo precedente do Catálogo)
- [x] 1.4 Criar `domain/ports/*.ts` (só interfaces + tipos, zero implementação; sem `UnitOfWork` — só leitura de entidade única, design decisão 3) e verificar verde + auditoria de imports (`domain/` sem imports externos) — GREEN. Verificação: typecheck limpo e `grep` de imports externos vazio. Execução: typecheck 0; 17/17 no módulo; auditoria por script (pega import multilinha) → nenhum import externo no `domain/` fora dos specs (`vitest`)

## 2. Application — casos de uso contra portas com fake em memória

- [ ] 2.1 Escrever o teste de listar/filtrar/buscar (depoimentos listam; posts listam + slug encontra; slug inexistente → não-encontrado; antes/depois lista só consentidos; caso sem consentimento nunca aparece) com fakes e verificar que falha — RED. Verificação: `Cannot find module`
- [ ] 2.2 Implementar os casos de uso dependendo só das portas e verificar verde — GREEN. Verificação: testes da task 2.1 passam, sem importar `infrastructure/`
- [ ] 2.3 Escrever o teste adversarial com payload hostil real (slug gigante/malformado com `../`, injeção em filtro, strings acima de qualquer limite razoável; sonda de bypass: acesso direto a caso sem consentimento responde não-encontrado/ausente) e verificar o comportamento seguro — RED. Verificação: teste falha (módulo ausente ou hostil aceito)
- [ ] 2.4 Implementar o tratamento (validação na fronteira do núcleo + queries parametrizadas + limites; consentimento nunca confiado na entrada) e verificar verde — GREEN. Verificação: hostil rejeitado ou neutralizado sem erro interno vazado

## 3. Infrastructure — Prisma + Postgres real em container

- [ ] 3.1 Escrever o teste de integração dos repositórios (round-trip; `findConsented` exclui sem-consentimento mesmo com o registro existindo; `findBySlug` ignora inexistente; ordenação determinística) e verificar que falha — RED. Verificação: falha de conexão/schema ausente ou módulo inexistente
- [ ] 3.2 Criar os modelos Prisma + mappers manuais (Data Mapper, nunca Active Record; modelo do ORM nunca cruza para o domínio; validação do vocabulário/consentimento pela entidade como fonte única) e implementar os repositórios — GREEN. Verificação: testes passam contra Postgres real em container, banco de teste isolado

## 4. Presentation — controller com validação Zod

- [ ] 4.1 Escrever o teste de contrato da Presentation (`GET /testimonials`, `GET /posts`, `GET /posts/:slug`, `GET /before-after` com corpos validados contra os schemas; slug inválido → 422; slug inexistente → 404) e verificar que falha — RED. Verificação: 404 de rota ou `Cannot find module`
- [ ] 4.2 Criar controller + `ContentModule` (mesmo padrão de wiring do `CatalogModule`: providers por tokens, cliente próprio, pipe/filtro/erros locais, sem `UnitOfWork`) e verificar verde de ponta a ponta — GREEN. Verificação: testes passam contra o app com banco de teste
- [ ] 4.3 Escrever o teste de saída conforme o contrato (corpos validados contra os schemas nas duas pontas, 07 §13 — incluindo `PublicBeforeAfterListSchema` com `hasConsent: z.literal(true)`) e verificar que falha antes do ajuste — RED. Verificação: divergência reprova
- [ ] 4.4 Ajustar o formato de saída até zerar a divergência (allowlist explícita; tipo de retorno = tipos do próprio `@newestetica/contracts`) — GREEN. Verificação: teste passa; nenhuma divergência nova
- [ ] 4.5 Prova de exclusão de consentimento (dedicada e explícita): semear no banco um caso COM e um SEM consentimento e asserir que a resposta de `GET /before-after` contém exatamente o consentido — RED: o caso sem consentimento aparece hoje (filtro ausente/ingênuo); GREEN: o filtro real (`where` no banco + validação de saída) bloqueia e o teste passa. Verificação: o teste distingue as duas situações (falha sem o filtro, passa com ele) — garantia provada pela falha, não presumida

## 5. Mutation, segurança, registros e backlog

- [ ] 5.1 Rodar Stryker contra o módulo (`pnpm --filter backend mutation`, banco de teste no ar; estender o escopo `mutate` para `src/content/**`) e contra `contracts/src/content/`, e registrar score real + triagem de sobreviventes em `verification.md` — GREEN. Verificação: relatório completo no registro (meta docs/07 §13)
- [ ] 5.2 Revisar segurança com `security-and-hardening` contra `docs/security/03-seguranca.md` (gatilhos: entrada pública sem auth, consentimento de imagem, enumeração, DoS de listagem) e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada, com os abuse cases do threat model um a um
- [ ] 5.3 Revisar com `code-review-and-quality` e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada
- [ ] 5.4 Atualizar `docs/product/08-backlog-produto.md` (UC 4.2.7 → Em andamento) e avaliar `c2/c3-component.md` — exceção docs/07 §4 (verificação por releitura). Verificação: releitura confirma os status
- [ ] 5.5 Avaliar a complexidade da sessão (emendas? padrões reutilizáveis?) e alimentar a seção 14 de docs/07 ou registrar a dispensa com motivo — exceção docs/07 §4. Verificação: seção 14 atualizada ou dispensa justificada em `verification.md`
