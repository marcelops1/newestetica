## Context

Ver `proposal.md` (Why). Ponto de partida verificado: os 3 módulos (`scheduling`, `catalog`, `content`) replicam o mesmo plumbing — `ZodValidationPipe` byte-idêntico nos 3, `DomainExceptionFilter` diferindo só no mapa de status (scheduling: 404/409/422; catalog/content: 404/422), base `DomainError` idêntica salvo o union de códigos, `createPrismaClient()` idêntico — mais scaffolds/builders de teste por spec (DAMP intencional). A regra que gerou a não-compartilhamento está em `docs/architecture/02-arquitetura.md` §3 (bounded contexts não compartilham apresentação; bounded contexts não importam o domínio um do outro). Medição independente no diff do PR #40: 8,5% (145/1699 linhas normalizadas) — ~39% clones de produção, ~61% testes. Gate do Sonar: ≤3%. Precedente de remédio no repo: `5143a42` extraiu compartilhados para configs de ferramenta (vitest/stryker) — nunca para código de domínio/apresentação.

## Goals / Non-Goals

**Goals:**

- Zerar a causa estrutural da falha (clones de produção) de um jeito que preserve a independência dos módulos, e tirar os testes do denominador da métrica — com o check do Sonar verde (≤3%) no PR como prova de aceite.
- Deixar o 4º módulo (Identidade e Acesso) nascendo já no padrão limpo, sem a 4ª cópia.

**Non-Goals:**

- Mudar qualquer comportamento, rota, contrato, status de erro ou mensagem (a suíte existente é a caracterização).
- Compartilhar vocabulário de domínio, entidades, portas, casos de uso, repositórios ou mappers — só plumbing técnico.
- Unificar instâncias de PrismaClient (trigger da decisão 8 do change Conteúdo Público continua intacto — factory compartilha a *construção*, não a *instância*).
- Exclusões de duplicação para frontend/contracts (não medido — YAGNI; segue o mesmo padrão se o Sonar um dia acusar).

## Decisions

### 1. Correção combinada agora — extração + exclusão de testes (recomendação central)

Nenhuma das duas opções isoladas resolve, pela matemática da métrica (denominador ~1700 linhas): só extrair a produção deixa ~5,6%; só excluir os testes deixa ~7,6% (piora proporcional — os testes diluíam o índice). Só a combinação chega a ~1%. "Aceitar" (precedente #35/#38) custa zero agora, mas normaliza o check vermelho pela 4ª vez seguida e empurra a conta para a Identidade — que herdaria a 4ª cópia antes de qualquer decisão. A correção é mecânica, limitada e provada pela suíte. Alternativas consideradas: aceitar com justificativa (rejeitada — reincidência vira cultura; o precedente 5143a42 mostra que o projeto prefere corrigir quando é barato); só extrair (rejeitada — não zera o gate); só excluir testes (rejeitada — sequer ajuda sozinha).

### 2. Kernel técnico em `backend/src/shared/` com regra de filiação estrita

`backend/src/shared/` com `http/` (pipe + base do filtro), `errors/` (base genérica) e `prisma/` (factory). Regra de filiação (vai para a emenda da 02 §3): só entra plumbing técnico sem vocabulário de domínio; o compartilhado **nunca** importa de módulos; módulos importam do compartilhado só pelo plumbing permitido. Alternativa considerada: `backend/src/common/` (convenção Nest — rejeitada; o repo já consagra `shared/` como a palavra para código transversal em 02 §5); `shared/` da raiz (rejeitado — é para código transversal a frontend/backend, não para artefatos Nest).

### 3. Filtro compartilhado via hook, com mapeamento local por módulo

Base abstrata implementa `catch` (formato `{code, message}` idêntico ao atual) e um `statusFor` protegido com default 422; cada módulo mantém uma subclasse fina (~10 linhas) com o seu mapa (`PostNotFound`→404 etc.). O mapeamento continua local por desenho — divergência futura (ex.: guards da Identidade) fica contida no módulo. Alternativas consideradas: erro carregando o próprio status HTTP (rejeitada — vaza HTTP para o domínio, viola Clean Architecture e 04 §5); factory com mapa via DI (rejeitada — mágica de wiring para economizar as mesmas ~10 linhas).

### 4. Base de erros genérica preservando os unions por módulo

`DomainError<Code extends string>` no compartilhado; cada módulo mantém `export type DomainErrorCode = ...` + subclasse fina herdando o construtor — zero mudança nos imports internos dos módulos (entidades, casos de uso e filtros continuam referenciando os nomes locais). Alternativa considerada: base não-genérica com `code: string` (rejeitada — perde a precisão de tipo nos pontos de construção sem economizar nada).

### 5. Factory de cliente, não cliente compartilhado

`createPrismaClientFromEnv()` centraliza as 8 linhas idênticas (leitura de `DATABASE_URL`, erro sem ela, adapter); cada módulo continua criando a **sua** instância no provider (3 pools, como hoje). O trigger da decisão 8 (provider compartilhado no 4º módulo ou sob pressão) não é antecipado nem cancelado.

### 6. Pipe idêntico, migração mecânica

O `ZodValidationPipe` é byte-idêntico nos 3 módulos (só o comentário de cabeçalho difere): mover para o compartilhado e trocar imports é risco ~zero, provado pela suíte de contrato/HTTP existente.

### 7. Escopo do Sonar via `.sonarcloud.properties` (repo-versionado)

`sonar.cpd.exclusions=backend/test/**,**/*.spec.ts` em `.sonarcloud.properties` na raiz — cobre `backend/test/` (fakes, helpers, integração) e os specs unitários sob `src/`. Por que este arquivo e esta chave: `sonar-project.properties` é **ignorado** pelo Automatic Analysis (verificado na documentação oficial — alternativa rejeitada com motivo, para ninguém tentar de novo); `sonar.exclusions` seria amplo demais (tiraria os testes de toda análise, não só da duplicação); migrar o Sonar para CI-based (rejeitado — exigiria secret `SONAR_TOKEN` + etapa no workflow, desproporcional). Fallback registrado em tasks: se o PR de verificação mostrar o arquivo ignorado, aplicar a mesma exclusão via UI (admin) e registrar o valor exato no repo.

### 8. Prova de não-quebra = caracterização, não teste novo de comportamento

A suíte existente (310 testes, cobertura 99,7%) é a prova: verde antes, verde entre cada migração de módulo, verde depois — mesmo padrão da reorganização de pastas do Agendamento. Somam-se: specs unitários mínimos para os 4 artefatos compartilhados (contrato próprio do código novo, exigência da DoD), auditoria por `grep` (nenhuma cópia local restante; `domain/` dos módulos sem imports externos novos), gates completos e o próprio check do Sonar ≤3% como aceite final. `backend/stryker.config.mjs` ganha `src/shared/**` no `mutate` para o código movido continuar medido.

### 9. Timing: agora, antes da Identidade

Rule of Three satisfeita (3 cópias idênticas do pipe; 3 filtros; 3 bases). Guards de autenticação são código **novo** da Identidade — fora do compartilhado, sem conflito. Fazer agora evita a 4ª cópia e deixa a Identidade nascendo no padrão limpo; esperar para "ver se o padrão se sustenta" já foi respondido por 3 módulos verdes seguidos.

## Risks / Trade-offs

- [Risco] `.sonarcloud.properties` ignorado ou com limitação não documentada para TS → Mitigação: o próprio PR prova o efeito; fallback UI + registro versionado do valor (task explícita com as duas saídas definidas).
- [Risco] Abstração prematura que a Identidade invalida → Mitigação: forma mínima, mapeamentos locais, guards fora do escopo; o hook comporta qualquer mapa futuro sem tocar a base.
- [Risco] Blast radius nos 3 módulos verdes → Mitigação: migração incremental módulo a módulo com suíte verde entre passos; rollback = reverter o merge (sem migração de dados).
- [Trade-off] 02 §3 ganha exceção explícita → aceito como emenda versionada com regra de filiação estrita (impede que o kernel vire "utils" genérico).
- [Trade-off] Subclasses locais de ~10 linhas repetem um esqueleto mínimo → aceito (ordens de magnitude abaixo de qualquer threshold; o mapeamento local é intencional, não dívida).

## Migration Plan

Sem migração de dados nem mudança de API: ordem shared → migração módulo a módulo (scheduling, catalog, content) com verde entre cada → remoção das cópias → config Sonar → docs (02 §3, 04, c3, 05) → gates → PR com aceite do Sonar. Rollback = reverter o merge. Nenhum dado existente é tocado.

## Open Questions

Nenhuma — o único ponto condicional (eficácia do `.sonarcloud.properties`) tem as duas saídas definidas nas tasks e não muda specs, abordagem ou breakdown.
