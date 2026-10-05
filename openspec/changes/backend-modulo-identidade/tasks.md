## 0. Baseline de caracterização (antes de qualquer mudança)

- [x] 0.1 Rodar a suíte completa do backend e registrar o baseline (arquivos/testes e cobertura por módulo) como rede de segurança da migração — Verificação: números colados no `verification.md` (observação, sem RED — padrão §14.10)

## 1. Setup de dependência e realm (test-first de wire-up)

- [ ] 1.1 Escrever o teste de fumaça do validador (importa o validador inexistente e constata a ausência de lib JWT no backend) e verificar que falha — RED. Verificação: `Cannot find module`
- [ ] 1.2 Adicionar a biblioteca JWT (critério do design decisão 1) e provar instalação limpa sem novos advisories — GREEN parcial. Verificação: `pnpm audit --audit-level high` com saída 0 e import resolvendo

## 2. Domain — vocabulário de identidade puro (unitários puros)

- [x] 2.1 Escrever o teste do núcleo de identidade (papéis `admin`/`reception`, decisão negar-por-padrão como tipo, mapeamento puro de claims → identidade sem framework) e verificar que falha porque o domínio não existe — RED. Verificação: `Cannot find module`
- [x] 2.2 Criar o domínio de Identidade + porta `TokenValidator` (só valida, zero implementação, sem importar domínio de nenhum outro módulo) e verificar verde + auditoria de imports (`domain/` sem imports externos e cruzados) — GREEN. Verificação: testes passam, typecheck limpo e `grep` de imports externos vazio

## 3. Application — autenticação como caso de uso contra a porta com fake

- [x] 3.1 Escrever o teste do caso de uso (token válido via fake retorna identidade com papéis; token inválido/expirado → erro sem tocar rede) com fake em memória e verificar que falha — RED. Verificação: `Cannot find module`
- [x] 3.2 Implementar o caso de uso dependendo só da porta e verificar verde — GREEN. Verificação: testes da task 3.1 passam, sem importar `infrastructure/`

## 4. Ataques dedicados, um por task, com write-then-throw (threat model do design)

- [x] 4.1 Token forjado: semear chave estranha, asserir 401 — RED: com a checagem de assinatura removida de propósito, o forjado passa e o teste reprova; GREEN: restaurada, bloqueia e o teste passa. Verificação: o teste distingue as duas situações
- [x] 4.2 Token expirado/`nbf`/skew: `exp` passado, `nbf` futuro e skew além da tolerância → 401; dentro da tolerância passa — RED: sem a checagem temporal, o expirado passa; GREEN: com ela, bloqueia. Verificação: falha sem a checagem, passa com ela
- [x] 4.3 Audience/issuer divergentes: token de outro client e de outro emissor → 401 — RED: sem a checagem de claims, o token alheio passa; GREEN: com ela, bloqueia. Verificação: falha sem a checagem, passa com ela
- [x] 4.4 Papel ausente/insuficiente + negação por padrão: token sem `roles`, `reception` em rota `admin` e rota sem decorator → 403/401 conforme a regra, com 403 byte-idêntico nos dois casos de papel — RED: sem a checagem de papel, o acesso passa; GREEN: com ela, nega. Verificação: falha sem a checagem, passa com ela
- [x] 4.5 Algoritmo `none` e confusão `HS256`/`kid`: token sem assinatura e token `HS256` assinado com a chave pública como segredo HMAC → 401 pela allowlist de `alg` + `kid` só do JWKS confiável — RED: sem a allowlist, o `none` passa; GREEN: com ela, bloqueia. Verificação: falha sem a allowlist, passa com ela
- [x] 4.6 Confusão de chaves entre realms: JWKS de outro emissor assinando token válido → 401 pelo casamento `iss`+`kid`+chave — RED: sem o casamento, o token alheio passa; GREEN: com ele, bloqueia. Verificação: falha sem o casamento, passa com ele
- [x] 4.7 Enumeração: 401 idêntico para todas as falhas de autenticação e 403 idêntico para sem-papel vs papel-insuficiente, mensagens fixas sem eco de claim/`kid`/detalhe de chave — RED: mensagem que distingue a causa e o teste reprova; GREEN: fixa e idêntica por classe. Verificação: corpos comparados literalmente por classe

## 5. Infrastructure — validador JWKS real + fake local para testes

- [x] 5.1 Escrever o teste do validador contra JWKS fake local (round-trip; rotação de chaves; cache sem fetch por requisição; falha dura só após expirar o cache) e verificar que falha — RED. Verificação: `Cannot find module`
- [x] 5.2 Implementar o validador (JWKS com cache+TTL, claims, allowlist de `alg`, tolerância de relógio fixa) + fake local configurável e verificar verde — GREEN. Verificação: testes passam sem Keycloak no ar

## 6. Presentation — guard real no kernel + decorator (estado frágil planejado)

- [x] 6.1 Escrever o teste do guard real (sem token → 401; token fake válido sem papel → 403; com papel → passa; rota sem decorator exige autenticação) e verificar que falha — RED. Verificação: 404 de rota ou `Cannot find module`
- [x] 6.2 Criar o guard + decorator de papéis no kernel SEM aplicar nos controllers (estado frágil planejado, §14.8) e verificar verde em módulo isolado — GREEN. Verificação: testes passam no módulo de Identidade
- [x] 6.3 Apagar o `IdentityPendingGuard` **ao final do grupo 8 (emenda registrada: até a migração dos 3 módulos ele é referenciado)** e provar que nada mais o referencia — RED vira GREEN. Verificação: `grep` por `IdentityPendingGuard` vazio em `backend/src` e `backend/test`; suíte do kernel verde

## 7. Realm 2FA versionado + prova contra o realm real

- [x] 7.1 Escrever o teste que tenta o fluxo só-senha contra o Keycloak do compose e verificar que HOJE ele passa (2FA ausente — RED invertido: a ausência da proteção é a falha). Verificação: fluxo só-senha obtém token aceito
- [x] 7.2 Versionar fluxo OTP + política + usuários de teste no `realm-newestetica.json` e verificar que o teste agora falha fechado (só-senha não obtém acesso) — GREEN. Verificação: 2FA exigido para `admin` e `reception`, sem segredo commitado

## 8. Migração dos 3 módulos com caracterização (um por vez, zero regressão)

- [x] 8.1 Migrar Pacientes para o guard real + decorator e constatar que as guard-specs antigas reprovam (403 honesto sumiu) — RED. Verificação: falhas coladas nas specs do 403 `AUTH_NOT_IMPLEMENTED`
- [x] 8.2 Converter as specs de Pacientes para 401/403 reais + atualizar decorators Swagger na mesma task (§17) e verificar verde com respostas de negócio byte-idênticas — GREEN. Verificação: suíte de Pacientes verde contra o baseline da task 0.1
- [x] 8.3 Migrar Atendimento (mesmo ciclo RED→GREEN da 8.1→8.2, com Swagger na mesma task) — Verificação: suíte de Atendimento verde contra o baseline
- [x] 8.4 Migrar Financeiro (mesmo ciclo RED→GREEN, com Swagger na mesma task) — Verificação: suíte de Financeiro verde contra o baseline
- [x] 8.5 Atualizar `openapi.int.spec.ts` (status 401/403 reais, sem `AUTH_NOT_IMPLEMENTED`) e verificar verde — GREEN. Verificação: cobertura de rotas intacta, sem rota fantasma

## 9. Mutation, segurança, registros e backlog

- [ ] 9.1 Rodar Stryker contra o módulo (`pnpm --filter backend mutation`, banco de teste no ar; estender o escopo `mutate` para `src/identity/**`) e contra os deltas dos 3 módulos, e registrar score real + triagem de sobreviventes em `verification.md` — GREEN. Verificação: relatório completo no registro (meta docs/07 §13)
- [x] 9.2 Revisar segurança com `security-and-hardening` contra `docs/security/03-seguranca.md` (gatilhos: autenticação, autorização/RBAC, 2FA, dados de paciente via rotas agora abertas, segredos de teste) e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada, com os abuse cases do threat model um a um
- [x] 9.3 Revisar com `code-review-and-quality` e registrar em `verification.md` — exceção docs/07 §4 só para a escrita do registro. Verificação: revisão registrada
- [x] 9.4 Atualizar `docs/product/08-backlog-produto.md` (UC 4.2.1 e Épico 3 → Em andamento), `docs/security/03-seguranca.md` §8 (enforcement real) e avaliar `c2/c3-component.md` — exceção docs/07 §4 (verificação por releitura). Verificação: releitura confirma os status
- [x] 9.5 Avaliar a complexidade da sessão (emendas? padrões reutilizáveis?) e alimentar a seção 14 de docs/07 ou registrar a dispensa com motivo — exceção docs/07 §4. Verificação: seção 14 atualizada ou dispensa justificada em `verification.md`
