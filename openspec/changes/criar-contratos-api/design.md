## Context

Ver `proposal.md` (Why). Ponto de partida verificado por comando: `contracts/` e `shared/` existem vazios (só `.`/`..`); `pnpm-workspace.yaml` já lista `frontend`, `backend`, `shared` e `contracts` como pacotes; `zod` não está instalado em nenhum workspace (grep em `frontend/package.json` e `package.json` raiz retorna vazio); os formatos de dado a espelhar vivem em `frontend/lib/types.ts` (Procedure, Testimonial, BeforeAfter com `hasConsent`, Slot, Post, QuizGoal, QuizRecommendation, ContactInfo), `frontend/lib/mocks/*` (6 procedimentos, 3 resultados sendo 1 sem consentimento, 5 depoimentos, 3 slots, 4 posts, quiz + contato fictício) e nas fronteiras `booking.ts` (`BookingInput`: name/phone/treatment?/notes?), `quote.ts` (`QuoteInput`: name/phone/procedure?/message? com `procedure` restrito a `getTreatmentOptions()`) e `contact.ts` (`ContactInput`: name/contact flexível/message com `parseContactInput` + `validateContactFields`). A spec `mock-data` já normatiza este momento (contrato definido → mocks compatíveis ou divergência mapeada). Decisões de arquitetura vigentes: monolito modular, Repository + Data Mapper, contratos claros entre frontend e backend (02 §§3–5, 04 §§4–6), estilo de API ainda em aberto com preferência por contratos claros OpenAPI/Zod (04 §2), testes de contrato/schema em fronteira de dados verificados nas duas pontas (07 §13).

## Goals / Non-Goals

**Goals:**

- `contracts/` como pacote instalável do monorepo com schemas executáveis + tipos, prontos para o backend validar payloads e o frontend (Épico 5) trocar mocks pela API sem redefinir formatos.
- Cada schema com teste de contrato contra os mocks vigentes (prova de fidelidade, não invenção).

**Non-Goals:**

- Código de backend, Keycloak/2FA, migração do frontend para API real, versionamento de API via URL/headers (só quando houver consumidor real), OpenAPI YAML gerado (só se virar necessidade do backend — ver decisão 2).

## Decisions

### 1. Zod como linguagem dos contratos (não OpenAPI YAML puro, não tipos TS soltos)

Rationale: TypeScript em todo o projeto (frontend Next.js, futuro NestJS); Zod dá schema executável + tipo inferido (`z.infer`) de uma definição só — sem duplicar validação e tipo, sem drift entre os dois. OpenAPI YAML puro seria documentação não-executável no estágio atual (sem backend para servi-lo, sem gerador configurado); tipos TS soltos (`interface`) não validam em runtime na fronteira. Alternativas consideradas: OpenAPI YAML como fonte (rejeitada — sem toolchain de geração/validação no repo e sem consumidor; reavaliar quando o backend precisar expor Swagger); tipos manuais duplicados (rejeitada — drift garantido entre validador e tipo); `valibot`/`arktype` (rejeitadas — ecossistema menor que Zod no stack NestJS/Next.js, sem ganho para o caso).

### 2. Escopo: só contextos com equivalente mockado (Catálogo, Agendamento, Conteúdo Público)

Rationale: cada schema desta change tem pelo menos um mock ou comportamento observável para espelhar (ver Context) — contrato sem equivalente seria invenção divorciada da realidade, violando a regra de fidelidade da spec `mock-data`. Identidade/Acesso, Pacientes, Atendimento/Histórico e Financeiro Básico nascem na Feature 4.2 junto dos módulos NestJS (com RBAC, LGPD e persistência reais para informar os formatos). Alternativas consideradas: contratar os 7 contextos agora (rejeitada — 4 deles sem nenhum dado observável; especulação); contratar só Catálogo (rejeitada — Agendamento e Conteúdo Público têm mocks igualmente maduros e o custo marginal é baixo).

### 3. Estrutura `contracts/src/<contexto>/` com um schema por entidade + `index.ts` por contexto

Rationale: espelha os bounded contexts (02 §3) e permite ao backend importar por contexto (`@newestetica/contracts/catalog`) sem acoplar módulos entre si; um arquivo por entidade mantém diffs pequenos e revisáveis (padrão já usado em `frontend/lib/`). Layout: `contracts/src/catalog/procedure.ts`, `contracts/src/scheduling/booking.ts`, `contracts/src/scheduling/slot.ts`, `contracts/src/content/testimonial.ts`, `before-after.ts`, `post.ts`, `contact.ts`, `quote.ts`, `quiz.ts`, `contact-info.ts`, cada um exportando `XxxSchema` + `type Xxx = z.infer<typeof XxxSchema>`, com `index.ts` por contexto e um `index.ts` raiz. Alternativas consideradas: arquivo único `schemas.ts` (rejeitada — vira god-module, contra 02 §4.1); pastas por endpoint HTTP (rejeitada — endpoints ainda não existem; organizar por recurso antes de haver rota é antecipação).

### 4. Testes de contrato no próprio pacote `contracts` (vitest), importando os mocks do frontend

Rationale: docs/07 §13 exige teste de contrato/schema em fronteira de dados; colocar os testes em `contracts/` (não no frontend) faz o pacote ser autoverificável — `pnpm --filter contracts test` prova fidelidade sem depender do app. Os testes importam os mocks via caminho relativo workspace (`../../frontend/lib/mocks/*`) ou via alias, validam item a item com `safeParse` e falham em qualquer item incompatível não-mapeado. Alternativas consideradas: testes no frontend (rejeitada — o contrato deve se provar sozinho; o consumidor não testa o contrato); teste manual/ad-hoc (rejeitada — sem RED/GREEN, sem CI).

### 5. Erro de validação em formato único `{ code, message, fields? }`

Rationale: skill `api-and-interface-design` (Consistent Error Semantics) + regra de não vazar detalhes internos (03 §8): todo `safeParse` falho é normalizado para um formato só, com código legível por máquina (`VALIDATION_ERROR`), mensagem acolhedora reaproveitável pela UI e mapa opcional campo→mensagem. O tom acolhedor das mensagens (persona 40+) vive na UI; o contrato garante a estrutura, não o texto exato. Alternativas consideradas: expor `ZodError` cru (rejeitada — vaza estrutura interna do validador, acopla consumidor ao Zod); mensagens por campo só em português fixo no contrato (rejeitada — texto é decisão de UI, contrato fixa estrutura).

### 6. Evolução por adição, sem versionamento de API nesta change

Rationale: sem consumidor em produção ainda (backend não existe, frontend ainda usa mocks), versionar URL (`/v1`) agora seria complexidade antecipada (YAGNI, 02 §4.5); a regra vigente é campos novos sempre opcionais, nunca remover/renomear sem change OpenSpec (skill `api-and-interface-design`, Prefer Addition). Quando o backend servir tráfego real, versionamento vira change próprio. Alternativas consideradas: prefixo `/v1` desde já (rejeitada — sem tráfego, sem necessidade); versionamento por pacote npm do `contracts` (aceita como consequência natural do workspace, sem cerimônia extra).

## Risks / Trade-offs

- [Risco] Mock vigente incompatível com o contrato "ideal" (ex.: `duration` como texto livre `"Aprox. 45 min"` em vez de minutos) → Mitigação: o contrato espelha o mock (texto livre), não o ideal; normalização vira change futuro com migração explícita. Divergência mapeada no spec, nunca silenciosa.
- [Risco] Importar mocks do frontend nos testes do `contracts` cria acoplamento de workspace → Mitigação: acoplamento só em teste (dev), nunca em runtime; quando o backend existir, os testes passam a validar fixtures próprias + respostas reais nas duas pontas (07 §13).
- [Risco] Zod vira dependência definitiva sem reavaliação → Mitigação: decisão registrada aqui com alternativas; trocar a engine depois é change OpenSpec (schemas são a fonte, a engine é detalhe).
- [Trade-off] `contact` flexível (e-mail OU telefone) é menos tipável que dois campos → aceito: espelha o comportamento validado com a Fabiana (Use Case 1.8.2); discriminar em dois campos seria redesenho de UX fora deste escopo.

## Migration Plan

Não há migração: nada consome `contracts/` ainda. O frontend continua importando de `frontend/lib/`; a troca para os contratos (Épico 5) é change futuro. Rollback desta change = reverter o merge (nenhum runtime depende do pacote).

## Open Questions

Nenhuma — as incógnitas reais (formato dos 4 contextos adiados, transporte HTTP, paginação de listagens) pertencem à Feature 4.2 / Épico 5 e não alteram estes artefatos.
