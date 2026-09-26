## 0. Baseline RED (sem documentação hoje)

- [x] 0.1 Constatar que `GET /docs` e `GET /docs-json` respondem 404 com o backend no ar — RED. Verificação: ambos os status colados. Execução: com o stack do compose no ar: `GET /docs → 404` e `GET /docs-json → 404`
- [x] 0.2 Confirmar o inventário de rotas (14 no total: 2 scheduling + 2 catalog + 4 content + 5 patients + health) e a ausência de qualquer decorator Swagger nos controllers — GREEN de contexto. Verificação: lista de rotas + `grep` por `ApiOperation|ApiTags` vazio, sem mudar nada. Execução: 14 rotas confirmadas por grep (health 1, scheduling 2, catalog 2, content 4, patients 5); `rg "ApiTags|ApiOperation|ApiResponse"` → zero

## 1. Dependências, ponte Zod e setup (test-first)

- [x] 1.1 Avaliar e fixar a biblioteca da ponte (`@nestjs/swagger` + candidata `nestjs-zod` v5): instalar e verificar peers limpos com o Nest 12 + gerar schema de um DTO fumegante a partir de contrato real — RED se a instalação quebrar ou o schema sair vazio. Verificação: install sem erro de peer + schema fumegante contém os campos do contrato (se quebrar, aplicar o fallback manual antes de prosseguir, sem mudar specs). Execução: `@nestjs/swagger@12.0.2` (peer `@nestjs/core ^12.0.0` OK) + `nestjs-zod@5.5.0` instalados sem erro; peers declarados do nestjs-zod ainda não listam Nest 12/Swagger 12 (nota registrada no verification, trigger de rechecagem); smoke com `createZodDto(PatientInputSchema)` construiu o DTO sem erro — prova definitiva da ponte no documento gerado (2.x)
- [x] 1.2 Configurar `main.ts` (`DocumentBuilder` + `/docs` e `/docs-json`) e verificar UI 200 + JSON 200 com OpenAPI 3.x parseável — GREEN. Verificação: ambos os status e o `openapi` version colados. Execução: RED antes do setup (`expected 404 to be 200` nos dois); setup extraído para `backend/src/swagger.ts` (`setupSwagger` chamado pelo `main.ts` e pelos testes) + wire no `main.ts`; **2/2 verdes** (UI 200 com HTML Swagger; JSON 200 com `openapi 3.x` e título); typecheck 0

## 2. Decorators por módulo (test-first)

- [ ] 2.1 Escrever o teste de cobertura total (as 14 rotas aparecem no schema, cada uma com operação/parâmetros/corpo/respostas; nenhuma rota fantasma) e verificar que falha antes dos decorators — RED. Verificação: rotas ausentes listadas na falha
- [ ] 2.2 Decorar os 4 controllers (`ApiTags`, `ApiOperation`, `ApiResponse` por status real provado, `ApiParam`/`ApiQuery`) com as rotas de Pacientes documentando o 403 `AUTH_NOT_IMPLEMENTED` (código + descrição com guard e UC 4.2.1) — GREEN. Verificação: teste da task 2.1 passa; nenhuma rota sugere acesso livre em Pacientes

## 3. Fidelidade ao contrato, sem duplicação (test-first)

- [x] 3.1 Escrever o teste de divergência (fixtures válidas de cada contexto validam contra os componentes do schema gerado; campos dos contratos sem omissão nem acréscimo) e verificar que falha antes da ponte — RED. Verificação: divergência listada na falha. Execução: teste de fidelidade com mapa explícito dos 9 componentes × campos do contrato (caracterização — a ponte veio em 2.2 por dependência técnica do requestBody) + **prova de sensibilidade write-then-throw**: expectativa divergente de propósito → `AssertionError: expected [ 'fullName', 'phone', 'purpose' ] to deeply equal [ 'email', 'fullName', 'phone', …(1) ]`; restaurada → verde
- [x] 3.2 Ligar os componentes do schema aos schemas Zod (ponte, sem campo duplicado à mão) e verificar verde — GREEN. Verificação: teste da task 3.1 passa; `grep` por campo de contrato repetido manualmente retorna vazio. Execução: componentes gerados exatamente dos contratos (`PatientInputDto: fullName,phone,purpose`; `PatientResponseDto` com `status` e **sem `anonymizedAt`**; `PublicBeforeAfterResponseDto` com `hasConsent`); `rg "@ApiProperty"` nos controllers → zero (ponte é a única fonte); 7/7 verdes

## 4. Gate por ambiente + registro de segurança (test-first)

- [x] 4.1 Escrever o teste dos dois modos (`NODE_ENV=production` sem flag → 404 nas duas rotas; com `SWAGGER_ENABLED=true` → 200) e verificar que falha antes do gate — RED. Verificação: modo produção servindo docs na falha. Execução: gate já implementado em 1.2 (proteção antecipada); **prova de sensibilidade write-then-throw**: gate forçado aberto de propósito → `AssertionError: expected 200 to be 404`; restaurado → 2/2 verdes
- [x] 4.2 Implementar o gate em `main.ts` e registrar a regra em `docs/security/03-seguranca.md` (§8, item novo) — GREEN. Verificação: teste da task 4.1 passa; releitura confirma o registro. Execução: `isSwaggerEnabled` em `backend/src/swagger.ts` (chamado pelo `main.ts`); §8 da 03-segurança ganhou o item de docs restritas por ambiente (produção desabilitada por padrão; a doc não substitui o enforcement do guard)

## 5. Docs de processo (exceção §4)

- [ ] 5.1 Adicionar o bloco de acesso ao Swagger na seção "Como rodar" do `README.md` (URLs, nota de módulos implementados, nota do 403 em Pacientes) — exceção docs/07 §4 (só docs). Verificação: releitura do bloco
- [ ] 5.2 Adicionar a §17 em `docs/engineering/07-workflow-de-engenharia.md` (decorators na mesma task do endpoint) e o checkbox no `.github/pull_request_template.md` ao lado do de C2/C3 — exceção docs/07 §4 (só docs). Verificação: releitura dos dois pontos

## 6. Gates, registros e backlog

- [ ] 6.1 Rodar gates completos (lint, format, typecheck, test, build) + `pnpm audit --audit-level high` e registrar em `verification.md`. Verificação: tabela de gates no registro
- [ ] 6.2 Revisar com `code-review-and-quality` + `security-and-hardening` (foco: superfície nova sem dados reais, 403 honesto, gate por ambiente) e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisões registradas
- [ ] 6.3 Confirmar que nenhum UC muda de status (documentação de API não é UC do backlog) e arquivar (`openspec-archive-change`) com `openspec validate --all` verde. Verificação: change arquivado; validate passa
