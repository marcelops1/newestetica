## 0. Contrato — `contracts/src/finance/` desenhado do zero + delta de valor no Atendimento (fonte da verdade)

- [x] 0.1 Escrever o teste do contrato novo (`FinanceSummaryQuery` aceita janela válida e rejeita ausente/malformada/invertida/span > 366d; `FinanceSummary` exige janela/`currency: "BRL"`/`totalCents`/`count` e rejeita moeda diversa) e verificar que falha porque os schemas não existem — RED. Verificação: `Cannot find module`
- [x] 0.2 Criar `contracts/src/finance/finance.ts` + `finance.test.ts` + `index.ts` e reexportar no índice do pacote (tipos saem dos próprios schemas) e verificar que o teste passa — GREEN. Verificação: teste da task 0.1 passa
- [x] 0.3 Escrever o teste do delta de valor (`AttendanceInput` aceita `amountCents` inteiro 0..10.000.000 e rejeita fracionário/negativo/acima do teto; `Attendance` exige `amountCents` inteiro-ou-nulo; criação sem valor continua válida) e verificar que falha contra os schemas vigentes — RED. Verificação: `amountCents` rejeitado ou ausente na saída
- [x] 0.4 Estender `contracts/src/attendance/*` com `amountCents` opcional na entrada e inteiro-ou-nulo na saída (sem tocar em contrato vigente além do delta) e verificar que o teste passa — GREEN. Verificação: teste da task 0.3 passa

## 1. Setup de persistência (test-first de wire-up)

- [x] 1.1 Executar `pnpm --filter backend test` filtrado ao novo módulo e constatar que falha (pacote `finance/` inexistente) — RED. Verificação: filtro sem arquivos
- [x] 1.2 Adicionar `amountCents Int?` ao modelo `Attendance` + migration + seed fictício (um atendimento com valor fictício, um sem) — GREEN parcial. Verificação: `prisma migrate deploy` aplica limpo no banco de teste e o seed popula sem erro

## 2. Domain — valor imutável no Atendimento + agregação pura (unitários puros)

- [x] 2.1 Escrever o teste do valor na entidade (`create`/`restore` aceitam `amountCents` válido e ausente; fracionário/negativo/acima de 10.000.000 rejeitados; sem setter — imutabilidade estrutural) e verificar que falha porque a entidade não conhece o campo — RED. Verificação: valor ignorado ou `Cannot find` no acesso
- [x] 2.2 Estender `domain/entities/attendance.entity.ts` + erros locais (sem eco) com `amountCents` e verificar que o teste passa — GREEN. Verificação: teste da task 2.1 passa
- [ ] 2.3 Escrever o teste da agregação pura (`summarize` sobre entradas mistas: com/sem valor, dentro/fora da janela → total e contagem exatos; janela vazia → zeros; soma sem float) e verificar que falha porque a função não existe — RED. Verificação: `Cannot find module`
- [ ] 2.4 Criar a função `summarize` no domínio de Financeiro + porta `FinanceSummaryReader` (só pares `{ amountCents, performedAt }`, zero implementação, sem importar domínio de Atendimento nem de Pacientes) e verificar verde + auditoria de imports (`domain/` sem imports externos e cruzados) — GREEN. Verificação: typecheck limpo e `grep` de imports externos e cruzados vazio

## 3. Application — caso de uso de resumo contra a porta com fake em memória

- [x] 3.1 Escrever o teste do caso de uso (janela válida retorna janela + `BRL` + total + contagem via fake; janela vazia → zeros; janela inválida/span estourado → erro de validação sem tocar a porta) com fake e verificar que falha — RED. Verificação: `Cannot find module`
- [x] 3.2 Implementar o caso de uso dependendo só da porta e verificar verde — GREEN. Verificação: testes da task 3.1 passam, sem importar `infrastructure/`
- [x] 3.3 Escrever o teste adversarial com payload hostil real (janela malformada/gigante/invertida, span estourado, `amountCents` fracionário/negativo/gigante na criação, injeção em query; sondas: anonimizada fora do agregado; resposta sem PII/breakdown) e verificar o comportamento seguro — RED. Verificação: teste falha (módulo ausente ou hostil aceito)
- [x] 3.4 Implementar o tratamento (validação na fronteira do núcleo + queries parametrizadas + teto de span; visibilidade na query, decisão 5 do design) e verificar verde — GREEN. Verificação: hostil rejeitado ou neutralizado sem erro interno vazado

## 4. Infrastructure — reader Prisma + Postgres real em container (cliente próprio, mesmo padrão)

- [ ] 4.1 Escrever o teste de integração do reader (round-trip; exclui atendimentos de anonimizada mesmo com valores existindo; ignora `amountCents` nulo; respeita a janela) e verificar que falha — RED. Verificação: falha de schema ausente ou módulo inexistente
- [ ] 4.2 Criar o provider de cliente próprio no `FinanceModule` (`createPrismaClientFromEnv` do kernel, mesmo padrão dos 5 módulos — sexto pool consciente, design decisão 4) + mappers (Data Mapper, nunca Active Record) e implementar o reader com o filtro `patient: { status: "active" }` na query (sem `UnitOfWork` — só leitura, design decisão 4) — GREEN. Verificação: testes passam contra Postgres real em container, banco de teste isolado; `grep` confirma que `FinanceModule` não importa nada do módulo de Atendimento; módulo de Atendimento intocado no wiring

## 5. Presentation — controller de resumo com guard honesto

- [ ] 5.1 Escrever o teste de contrato da Presentation (`GET /finance/summary` com janela válida retorna o agregado no formato do contrato; janela inválida/span estourado → 422; corpos validados), executando com bypass do guard (`overrideGuard`, simulando a Identidade futura) e verificar que falha — RED. Verificação: 404 de rota ou `Cannot find module`
- [ ] 5.2 Criar controller (`GET /finance/summary`, `@UseGuards(IdentityPendingGuard)` importado do kernel, sem exceção) + `FinanceModule` (mesmo padrão de wiring: providers por tokens, cliente próprio via `createPrismaClientFromEnv`, pipe/filtro/erros locais, guard nos providers, sem `UnitOfWork`) e verificar verde de ponta a ponta com bypass — GREEN. Verificação: testes passam contra o app com banco de teste
- [ ] 5.3 Escrever o teste do guard honesto (sem bypass, a rota responde 403 com `AUTH_NOT_IMPLEMENTED`) e verificar que falha enquanto o guard não protege — RED: sem o guard aplicado, a rota responde normalmente. Verificação: o teste falha porque a rota está acessível (200/422 em vez de 403)
- [ ] 5.4 Confirmar o guard importado do kernel (sem duplicar a classe no módulo) e verificar verde — GREEN: rota bloqueada por padrão, e os testes de rota com bypass continuam verdes. Verificação: teste da task 5.3 passa; nenhum teste anterior quebra; `grep` confirma uma única definição de `IdentityPendingGuard` (no kernel)
- [ ] 5.5 Escrever o teste de saída conforme o contrato (corpo validado contra os schemas nas duas pontas, 07 §13, com bypass do guard; ausência de PII/breakdown asserida por inspeção) e verificar que falha antes do ajuste — RED. Verificação: divergência reprova
- [ ] 5.6 Ajustar o formato de saída até zerar a divergência (allowlist explícita; tipo de retorno = tipos do próprio `@newestetica/contracts`) — GREEN. Verificação: teste passa; nenhuma divergência nova
- [ ] 5.7 Prova de não-vazamento no agregado (dedicada e explícita): semear valores em paciente ativa e em paciente a anonimizar (anonimizar no setup via repositório de Pacientes) e asserir que o resumo reflete só a ativa — RED: o valor da anonimizada entra no total hoje (reader ingênuo sem filtro de relação); GREEN: o filtro de visibilidade (`patient: {status: "active"}`) bloqueia e o teste passa. Verificação: o teste distingue as duas situações (falha sem o filtro, passa com ele) — garantia provada pela falha, não presumida

## 6. Mutation, segurança, registros e backlog

- [ ] 6.1 Rodar Stryker contra o módulo (`pnpm --filter backend mutation`, banco de teste no ar; estender o escopo `mutate` para `src/finance/**`) e contra `contracts/src/finance/` + delta de `contracts/src/attendance/`, e registrar score real + triagem de sobreviventes em `verification.md` — GREEN. Verificação: relatório completo no registro (meta docs/07 §13)
- [ ] 6.2 Revisar segurança com `security-and-hardening` contra `docs/security/03-seguranca.md` (gatilhos: entrada de usuário, **agregado monetário com PII herdada via join**, ausência de auth com guard honesto, fishing por janelas estreitas, DoS de varredura) e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada, com os abuse cases do threat model um a um
- [ ] 6.3 Revisar com `code-review-and-quality` e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada
- [ ] 6.4 Atualizar `docs/product/08-backlog-produto.md` (UC 4.2.6 → Em andamento) e avaliar `c2/c3-component.md` — exceção docs/07 §4 (verificação por releitura). Verificação: releitura confirma os status
- [ ] 6.5 Avaliar a complexidade da sessão (emendas? padrões reutilizáveis?) e alimentar a seção 14 de docs/07 ou registrar a dispensa com motivo — exceção docs/07 §4. Verificação: seção 14 atualizada ou dispensa justificada em `verification.md`
