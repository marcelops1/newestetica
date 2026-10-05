## Context

Ver `proposal.md` (Why). Ponto de partida verificado nesta sessão: `IdentityPendingGuard` (kernel, `backend/src/shared/http/identity-pending.guard.ts`) nega tudo com 403 `AUTH_NOT_IMPLEMENTED` e é importado por 3 controllers + 3 módulos (Pacientes, Atendimento, Financeiro — confirmado por grep e pelo grafo); os testes atuais usam `overrideGuard` como bypass, e as guard-specs provam que ele é a ÚNICA barreira. Realm `newestetica` (`infra/docker/keycloak/realm-newestetica.json`) tem papéis `admin`/`reception` e client público `newestetica-frontend` (standard flow, sem direct grants) — mas **não tem flujos de autenticação, política OTP nem usuários**: 2FA hoje é intenção, não configuração. O backend **não tem biblioteca JWT** (sem `jose`, `jsonwebtoken`, passport ou `@nestjs/jwt` no `package.json`) — adicioná-la é decisão deste design. UC 4.2.1 e Épico 3 (3.1.1, 3.2.1, 3.3.1) estão Não iniciados, todos com gatilho de segurança.

## Goals / Non-Goals

**Goals:**

- Autenticação real e autorização RBAC funcionando nas 3 superfícies administrativas, com o bloqueio honesto removido (não convivendo).
- 2FA exigido no realm versionado e provado por teste contra o realm.
- Migração sem regressão de negócio (suítes vigentes como caracterização).

**Non-Goals:**

- Endpoint próprio de login/emissão/renovação de tokens; telas de login (Épico 5); recuperação de senha; gestão de usuários pela API.
- MFA fora do TOTP do Keycloak; políticas de senha customizadas; trilhas de auditoria persistidas (futuro, 03 §12).

## Decisions

### 1. Validação JWT por JWKS com allowlist de algoritmo (skill `security-and-hardening`)

O backend valida a cada requisição: assinatura contra as chaves do JWKS do realm (com cache e rotação), `iss` = emissor do realm, `aud` = client/audience esperada, `exp`/`nbf` com tolerância de relógio pequena e fixa, e **`alg` em allowlist explícita (`RS256` do realm — nunca `none`, nunca `HS256` com segredo confuso)**. Biblioteca JWT dedicada nova no backend (critério: suporte nativo a JWKS + allowlist de `alg` + zero dependências nativas; padrão: `jose`, com a escolha final registrada no `verification.md` do Apply se a avaliação apontar outra). Rationale: a fronteira de confiança é o JWKS — sem ele, qualquer validação é teatro; allowlist de `alg` fecha confusão de algoritmo/chave na origem. Alternativas consideradas: validar só assinatura sem `aud` (rejeitada — token de outro client seria aceito); aceitar `exp` sem `nbf`/tolerância (rejeitada — relógios divergem entre containers); decodificar sem verificar (rejeitada — é o ataque, não a defesa).

### 2. RBAC por decorator com negação por padrão

Decorator de papéis no kernel (ex.: exige `@Roles("admin")`); **rota sem decorator exige ao menos autenticação** — nada é público por esquecimento. Sem token válido → 401; token válido sem papel ou com papel insuficiente → 403 com corpo fixo `{code, message}` (envelope já usado pelos filtros), **byte-idêntico** entre "sem papel" e "papel insuficiente" (anti-enumeração). Rationale: deny-by-default elimina a classe inteira de "esqueci o guard"; 403 idêntico impede sondar papéis. Alternativas consideradas: matriz de permissões por recurso (rejeitada — YAGNI; dois papéis, sem granularidade no MVP); papel no path/query (rejeitado — papel vem do token, nunca do cliente).

### 3. Tokens nos testes: JWKS fake local + UMA prova contra o realm (decisão exigida)

Unit e integração usam **chaves e emissor fakes locais** (rápidos, determinísticos, sem Keycloak): o validador recebe a URL JWKS por configuração, e os testes apontam para o fake — cada ataque do threat model vira token forjado de verdade. **Uma única prova** (2FA) roda contra o Keycloak real do compose, com o realm versionado. Rationale: suíte rápida e hermética por padrão; o realm real só onde ele é o objeto do teste. Alternativas consideradas: realm de teste dedicado no compose para tudo (rejeitada — lenta, flakey, e o CI de backend hoje não sobe Keycloak nos testes); tokens reais gravados em fixture (rejeitada — segredo com expiração, apodrece e vaza); só fake sem prova no realm (rejeitada — 2FA presumido, não provado).

### 4. Guard real no kernel; `IdentityPendingGuard` removido, não paralelo

O guard real vive em `backend/src/shared/http/` (mesma exceção do kernel, mesma regra de filiação) e os 3 módulos trocam o import; o `IdentityPendingGuard` é **apagado** e suas guard-specs convertidas (401/403 reais no lugar do 403 honesto). Rationale: dois guards convivendo é convite a rota esquecida no guard errado; a remoção é provada pela suíte (nenhum import restante, grep vazio). Alternativas consideradas: manter o honesto como fallback (rejeitada — fallback que nega tudo mascara erro de wiring); flag de ambiente escolhendo o guard (rejeitada — comportamento de segurança por env é bypass com outro nome).

### 5. Migração dos 3 módulos com as suítes como caracterização

Ordem: kernel+identity verdes primeiro (Domain→Application→Infrastructure→Presentation, §15); depois um módulo por vez (Pacientes → Atendimento → Financeiro), cada um verde antes do próximo — o contraste "sem token = 401/403" vs "token válido com papel = acesso (respostas byte-idênticas às do bypass)" substitui o `overrideGuard`. Rationale: baseline existente vira rede (padrão §14.10 do Financeiro); divergência aparece na hora, não no PR. Alternativas consideradas: migrar os 3 de uma vez (rejeitada — empilha três superfícies e cega a causa da falha); reescrever as suítes do zero (rejeitada — destrói a caracterização).

### 6. 2FA no realm versionado + prova (não presunção)

O realm ganha fluxo de autenticação com execução OTP obrigatória (conditional ou required para os dois papéis), política OTP e usuários de teste com a ação requerida; a prova é um teste que tenta o fluxo só-senha contra o Keycloak do compose e falha fechado. Rationale: o realm atual não tem nada disso (verificado) — sem a config versionada, "2FA obrigatório" é frase; sem a prova, é presunção. Alternativas consideradas: 2FA só documentado (rejeitada — 03 §3 exige enforcement); WebAuthn em vez de TOTP (rejeitada — TOTP é o suportado nativamente pelo fluxo do Keycloak sem custom SPI).

### 7. Sem superfície nova de contrato (skill `api-and-interface-design`, §16.1)

Avaliado sob a skill: o módulo **não define nem consome** schemas em `contracts/` — a credencial viaja no header `Authorization: Bearer`, fora de qualquer body contratado, e os erros 401/403 reutilizam o envelope `{code, message}` com códigos novos do vocabulário de cada módulo. Cada campo tem uso declarado (header já padronizado; envelope já existente) e nada é exposto que vire compromisso de Hyrum. Alternativas consideradas: contrato de login/refresh no backend (rejeitada — fora de escopo, pertence ao Keycloak); espelhar claims do token em DTO (rejeitada — duplicaria a verdade do token no wire).

### 8. Erros sem eco, sem distinção, sem timing útil ao atacante

401 idêntico para todas as falhas de autenticação (ausente, malformado, expirado, assinatura/issuer/audience/alg inválidos); 403 idêntico para sem-papel vs papel-insuficiente; mensagens fixas sem eco de claim, `kid` ou detalhe de chave; comparação em tempo constante onde houver segredo comparado. Rationale: cada distinção é um oráculo (enumeração de usuários, de papéis, de chaves). Alternativas consideradas: mensagem por causa ("token expirado" vs "assinatura inválida" — rejeitada: UX de debug não supera oráculo de ataque; o log interno, sem PII, registra a causa para operação).

## Checklist §16 (obrigatório para este change, que cria módulo novo)

- **(a) `api-and-interface-design` citada:** avaliada nesta sessão de planejamento; aplicada na decisão 7 (sem superfície nova de contrato, cada campo com uso declarado, rejeições).
- **(b) `security-and-hardening` no planejamento:** carregada nesta sessão; threat model abaixo com rigor de fronteira de autenticação. Revisão do Verify continua obrigatória (docs/07 §7).
- **(c) Mutation:** tasks deste change incluem medição Stryker contra o módulo + delta dos 3 módulos afetados, com score e triagem em `verification.md` (meta docs/07 §13).
- **(d) Adversarial:** tasks incluem uma task test-first dedicada a cada ataque do threat model (token forjado, expirado, audience errada, papel ausente/insuficiente, `alg: none`, confusão de chaves, enumeração) com write-then-throw — não só raciocínio.
- **(e) §14:** tasks incluem avaliação ao final — se o apply exigir emendas ou render padrões reutilizáveis, alimenta; senão, registra a dispensa com motivo.

### Threat model da fronteira (planejamento, skill `security-and-hardening`)

- **Fronteira:** header `Authorization: Bearer` em todas as rotas de Pacientes, Atendimento e Financeiro — sob o guard real (401/403), por desenho (decisão 4).
- **Ativos:** PII de pacientes, histórico operacional, agregado monetário; segredo de sessão (tokens) em trânsito.
- **Abuse cases (cada um com task test-first dedicada e write-then-throw):** (1) **token forjado** (assinatura de chave estranha) → 401 idêntico; a prova remove a checagem de assinatura e o teste passa a aceitar (RED) antes de restaurá-la; (2) **token expirado** (`exp` passado, `nbf` futuro, tolerância estourada) → 401; (3) **audience errada** (token de outro client) e **issuer divergente** → 401; (4) **papel ausente ou insuficiente** (`reception` em rota `admin`, token sem `realm_access.roles`) → 403 byte-idêntico nos dois casos; rota sem decorator exige autenticação (negação por padrão); (5) **algoritmo `none`** e **confusão de chaves/algoritmo** (`HS256` com a chave pública como segredo HMAC, `kid` apontando para chave do atacante) → 401, pela allowlist de `alg` + `kid` resolvido só no JWKS confiável; (6) **confusão de chaves entre realms** (JWKS de outro emissor) → 401, pelo casamento `iss`+`kid`+chave; (7) **enumeração** (sondar usuários/papéis/recursos via diferenças de erro ou timing) → 401/403 fixos e idênticos por classe, mensagens sem eco, comparação constante onde houver segredo.
- **STRIDE resumido:** Spoofing fechado por JWKS+claims+allowlist; Tampering sem escrita nova (só leitura de identidade); Repudiation fora de escopo (trilhas futuras, 03 §12); Information disclosure controlado por erros fixos + ausência de eco; DoS limitado por JWKS em cache (sem fetch por requisição) e teto de tamanho do header; Elevation bloqueado por RBAC deny-by-default até papéis explícitos.

## Risks / Trade-offs

- [Risco] Nova dependência JWT amplia superfície de supply-chain → Mitigação: biblioteca estabelecida, auditada pelo `pnpm audit` do CI; sem dependências nativas como critério.
- [Risco] JWKS fora do ar nega tudo (fail-closed em cascata) → Mitigação: cache com TTL + fallback para o último conjunto válido dentro da janela; falha dura só após expirar o cache (comportamento testado).
- [Risco] Relógios divergentes entre containers rejeitam tokens válidos → Mitigação: tolerância pequena e fixa documentada; teste com skew nos dois sentidos.
- [Risco] 2FA trava o fluxo de teste local → Mitigação: só a prova de 2FA usa o realm real; todo o resto usa o fake local (decisão 3).
- [Trade-off] Sem refresh/rotina de sessão no backend → aceito: sessão é do Keycloak (Épico 5 consome); o backend é stateless por desenho.
- [Trade-off] Sem rate-limit de autenticação nesta fatia → aceito com trigger: entra com o hardening de staging, como nos módulos anteriores.

## Migration Plan

Sem migração de dados. Ordem de `deleteMany` no `resetDatabase` inalterada (sem tabela nova). Rollback = reverter o merge (o guard honesto voltaria junto, bloqueando tudo de novo — falha segura, não aberta). O realm versionado é aplicado pelo import do Keycloak no compose; segredos de teste fora do repo (`.env` ignorado).

## Open Questions

Nenhuma bloqueante. Rate-limit de autenticação, trilhas de auditoria persistidas, WebAuthn e matriz de permissões granular pertencem a changes futuros explícitos com triggers registrados.
