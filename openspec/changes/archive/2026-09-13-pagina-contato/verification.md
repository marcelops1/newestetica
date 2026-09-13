# Verificação — pagina-contato

Revisão com `security-and-hardening` contra `docs/security/03-seguranca.md` (gatilho docs/07 §7: formulário = entrada de usuário real) + revisão com `code-review-and-quality`. Data: 2026-09-13.

## Threat model (5 min)

- **Fronteira:** formulário público `/contato` (nome, contato flexível, mensagem) → camada `lib/contact.ts` → confirmação local. Nenhum dado cruza rede nem persistência.
- **Ativo:** privacidade da paciente (dados pessoais: nome + um canal de contato — docs/03 §4).
- **Abuse cases (OWASP):** (A03/XSS) marcação em nome/mensagem interpretada como HTML; (entrada hostil) payload malformado ou contato fora dos dois formatos chegando à submissão ignorando a validação da UI; (A04) falsa sensação de uso dos dados.
- **STRIDE rápido:** Spoofing/EoP n/a (página pública sem auth); Tampering — dados não trafegam; quando o backend existir, revalidação server-side é obrigatória (nota futura); Repudiation n/a nesta fase; Information Disclosure — erros acolhedores genéricos testados contra vazamento (`not.toMatch(/undefined|TypeError|stack/i)`); DoS — mensagem sem cap (aceitável em mock sem persistência; cap server-side quando existir backend) e sem rate limiting (mesma nota futura); EoP n/a.

## Revisão security-and-hardening (contra docs/03)

- [x] **Validação de entrada na fronteira** (docs/03 §7): `submitContactRequest` recebe `unknown` e valida via `parseContactInput` (estrutura + contato dentro dos dois formatos) e `validateContactFields` (nome ≥2, contato e-mail OU WhatsApp ≥10 dígitos, mensagem não-vazia) — a UI não é confiável; validação client não é tratada como fronteira de segurança (docs/03 §10 item 7).
- [x] **XSS/escaping (confirmação por grep exigida):** `grep -rn "innerHTML\|dangerouslySetInnerHTML" frontend/` retorna vazio (re-executado no tip do branch); nome, mensagem e contato são tratados como texto opaco na submissão e **não são renderizados em nenhum ponto da UI** — a confirmação de sucesso é estática (não ecoa nenhum dado digitado); renderização pública é 100% auto-escape do React (nós de texto).
- [x] **Minimização de dados e finalidade** (docs/03 §4): coleta apenas nome, um canal de contato (e-mail OU WhatsApp — um campo só) e mensagem; finalidade informada na nota LGPD ("usadas apenas para responder a esta mensagem"); nada é armazenado (mock sem persistência).
- [x] **Erros sem detalhes internos** (docs/03 §8): `WARM_ERROR` único, sem stack/nome de campo interno; testes afirmam ausência de vazamento em todas as rejeições.
- [x] **Sem dado real de paciente** (docs/03 §11): testes usam "Maria Exemplo" e placeholders fictícios; bloco institucional exibe horários/endereço do `contactMock` (fictícios), sem número real novo.
- [x] **Segredos**: nenhum segredo, `.env` ou token introduzido; diff sem credenciais.
- [x] **Sem rede**: `grep -rn "fetch(\|XMLHttpRequest\|axios\|WebSocket" frontend/lib/contact.ts frontend/features/contact/ frontend/app/contato/` vazio; spy de `fetch` afirma zero chamadas nos testes (inclusive nas rejeições da fronteira).
- [x] Sem dependências novas (diff não toca `package.json`/lockfile).

## Revisão code-review-and-quality (5 eixos)

- **Correção:** comportamento idêntico ao delta do spec (4 estados, sem rede, confirmação sem prazo fechado, contato flexível com as duas faces); 29 testes novos cobrindo contrato, edge cases, OWASP e fronteira. Erro preserva dados (formulário não remontado).
- **Legibilidade:** constantes nomeadas (`WARM_ERROR`, `NAME_ERROR`, `CONTACT_ERROR`, `MESSAGE_ERROR`), funções de responsabilidade única, helpers privados (`isValidEmail`/`isValidPhone`/`isValidContact`); comentários no padrão `quote.ts`/`booking.ts`.
- **Arquitetura:** espelha o padrão revisado sem ressalvas do orçamento (design decisão 1); sem dependência de dados (contact não precisa de allowlist externa) — mais enxuto que `quote.ts`; fronteira isolada em `lib/` para troca futura por API real; página segue o padrão validado `QuotePage`.
- **Segurança:** ver seção acima — sem achados.
- **Performance:** sem loops unbounded; página estática; delay mockado único.
- **Achados:** nenhum Critical/Required. *FYI:* `validateContactFields` saiu no GREEN 1.2 (antes da seção 2) — registrado com honestidade em `tasks.md`; sem cap de mensagem (trade-off no threat model); *Nit:* `autoComplete="email"` no campo flexível (dica de preenchimento; inofensivo).
- **Veredito:** Aprovado.

## Aplicação da seção 13 (registro de aplicados e dispensas)

- **Aplicado — unitários com edge cases:** `submitContactRequest` (sucesso, `forceError` acolhedor, sem rede), `parseContactInput` (campo ausente, tipo errado nos três campos, entrada nula, contato fora dos dois formatos, mensagem só de espaços), `validateContactFields` (e-mail ✓, WhatsApp ✓, texto em nenhum formato, WhatsApp sem DDD, nome curto, mensagem vazia/só espaços, não-string nos três campos).
- **Aplicado — segurança OWASP (task dedicada):** `<script>alert(1)</script>`, `<img onerror>`, `&`, aspas em nome/mensagem tratados como texto opaco; nome curto e contato malformado rejeitados na fronteira; grep de `innerHTML`/`dangerouslySetInnerHTML` vazio.
- **Aplicado — contrato/schema (skill `api-and-interface-design`):** `ContactInput`/`ContactResult`/`parseContactInput`/`validateContactFields` como contrato nomeado da fronteira UI ↔ submissão, RED-first; documenta a futura troca mock → API.
- **Aplicado — integração do fluxo crítico (preencher → enviar → confirmação):** verificação pelos gates disponíveis (rota `/contato` prerenderizada, typecheck, testes da lib, revisão manual dos estados sucesso/erro com dados preservados e das duas faces do campo). Limitação registrada: sem `@testing-library` no projeto, clique/fluxo de componente não é simulável (mesma lacuna dos changes anteriores).
- **Dispensado — mutation:** lógica trivial (trim/match de formato/delay mockado), sem negócio sensível — mesma justificativa de `pagina-orcamento`.
- **Dispensado — E2E (parcimônia):** jornada de alto valor é agendamento; contato não recebe E2E nesta fase.
- **Dispensado — carga (parcimônia):** sem requisito de performance.
- **Parcial — falha/resiliência:** coberta por `forceError` (dados preservados, nova tentativa), payloads malformados e mensagem longa; sem outras dependências externas.

## Gates executados (task 4.1)

- `pnpm lint` — passou (0 erros; 1 warning pre-existente em `stryker.config.mjs`, fora do escopo deste change)
- `pnpm format` — passou (todos os arquivos no estilo Prettier)
- `pnpm typecheck` — passou (`tsc --noEmit`)
- `pnpm test` — 10 arquivos, 82 testes, cobertura **100%** (141/141 stmts, 103/103 branches, 42/42 funcs, 133/133 lines) — `lib/contact.ts` a 100%, meta atingida como em `quote.ts`
- `pnpm build` — passou (`/contato` prerenderizada como estática)
- `openspec validate --changes` — 1 passed, 0 failed (`change/pagina-contato`)

## TDD (docs/07 §4)

- [x] RED comprovado antes de cada GREEN: task 1.1 (`Cannot find module '../contact'`), task 2.1 (1 falha comportamental — fronteira aceitava nome de 1 caractere). Observação honesta: os testes de `validateContactFields` passaram de primeira (função já presente no GREEN 1.2) — lacuna de teste, não de implementação; nenhum caminho de produção mudou sem prova de teste.
